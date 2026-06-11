const express    = require("express");
const router     = express.Router();
const { PrismaClient } = require("@prisma/client");
const { upload, uploadToCloudinary } = require("../middleware/upload");
const cloudinary = require("../config/cloudinary");
const { generateWishCode } = require("../utils/wishCode");

const prisma = new PrismaClient();
const VALID_TYPES = ["special","random"];

function validateWish({ type, sender, receiver, message, event }) {
  if (!VALID_TYPES.includes(type))
    throw Object.assign(new Error("Invalid wish type."), { status: 400 });
  if (!sender?.trim())
    throw Object.assign(new Error("Sender name required."), { status: 400 });
  if (type === "special" && !receiver?.trim())
    throw Object.assign(new Error("Receiver name required."), { status: 400 });
  if (!message?.trim() || message.trim().length < 10)
    throw Object.assign(new Error("Message too short."), { status: 400 });
  if (!event?.trim())
    throw Object.assign(new Error("Event required."), { status: 400 });
}

// ── POST /api/wishes ──────────────────────────────────────────────────────────
router.post("/", upload.fields([
  { name: "giftMedia", maxCount: 1 },
  { name: "giftAudio", maxCount: 1 },
]), async (req, res, next) => {
  let mediaPublicId = null;
  let audioPublicId = null;
  try {
    const {
      type, sender, receiver, message, event,
      eventLabel, eventEmoji,
      songTitle, songArtist, songUrl, songYtId,
      giftMessage, background, pin,
      expiryDays,
    } = req.body;

    validateWish({ type, sender, receiver, message, event });

    let code, attempts = 0;
    while (true) {
      code = generateWishCode();
      const exists = await prisma.wish.findUnique({ where: { code } });
      if (!exists) break;
      if (++attempts > 5) throw new Error("Could not generate unique code.");
    }

    // Calculate expiry
    let expiresAt = null;
    if (expiryDays && parseInt(expiryDays) > 0) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(expiryDays));
    }

    let giftData = null;
    const hasGift = type === "special" && (
      giftMessage?.trim() ||
      req.files?.giftMedia?.[0] ||
      req.files?.giftAudio?.[0]
    );

    if (hasGift) {
      let mediaUrl = null, mediaType = null;
      let audioUrl = null;

      if (req.files?.giftMedia?.[0]) {
        const file = req.files.giftMedia[0];
        const isVideo = file.mimetype.startsWith("video/");
        const { url, publicId } = await uploadToCloudinary(
          file.buffer, file.mimetype
        );
        mediaUrl = url;
        mediaType = isVideo ? "video" : "image";
        mediaPublicId = publicId;
      }

      if (req.files?.giftAudio?.[0]) {
        const file = req.files.giftAudio[0];
        const { url, publicId } = await uploadToCloudinary(
          file.buffer, file.mimetype, "happy-wisher/audio"
        );
        audioUrl = url;
        audioPublicId = publicId;
      }

      giftData = {
        message:      giftMessage?.trim() || null,
        mediaUrl,
        mediaType,
        publicId:     mediaPublicId,
        audioUrl,
        audioPublicId,
      };
    }

    const wish = await prisma.wish.create({
      data: {
        code, type,
        sender:     sender.trim(),
        receiver:   receiver?.trim()    || null,
        message:    message.trim(),
        event:      event.trim(),
        eventLabel: eventLabel?.trim()  || null,
        eventEmoji: eventEmoji?.trim()  || null,
        songTitle:  songTitle?.trim()   || null,
        songArtist: songArtist?.trim()  || null,
        songUrl:    songUrl?.trim()     || null,
        songYtId:   songYtId?.trim()    || null,
        background: background?.trim()  || null,
        pin:        pin?.trim()         || null,
        expiresAt,
        ...(giftData && { gift: { create: giftData } }),
      },
      include: { gift: true },
    });

    res.status(201).json({ success: true, wish });
  } catch (err) {
    if (mediaPublicId) cloudinary.uploader.destroy(mediaPublicId).catch(() => {});
    if (audioPublicId) cloudinary.uploader.destroy(audioPublicId, { resource_type: "video" }).catch(() => {});
    next(err);
  }
});

// ── GET /api/wishes ───────────────────────────────────────────────────────────
router.get("/", async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(20, parseInt(req.query.limit) || 12);
    const now   = new Date();
    const [wishes, total] = await Promise.all([
      prisma.wish.findMany({
        where: {
          type: "random",
          OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit, take: limit,
        select: {
          id:true,code:true,type:true,sender:true,
          event:true,eventLabel:true,eventEmoji:true,
          message:true,views:true,createdAt:true,
        },
      }),
      prisma.wish.count({
        where: {
          type: "random",
          OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        },
      }),
    ]);
    res.json({ wishes, total, page, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
});

// ── GET /api/wishes/:code ─────────────────────────────────────────────────────
router.get("/:code", async (req, res, next) => {
  try {
    const wish = await prisma.wish.findUnique({
      where: { code: req.params.code.toUpperCase() },
      include: {
        gift: true,
        reactions: { orderBy: { createdAt: "desc" } },
        replies:   { orderBy: { createdAt: "desc" } },
      },
    });
    if (!wish) return res.status(404).json({ error: "Wish not found." });

    // Check expiry
    if (wish.expiresAt && new Date() > wish.expiresAt) {
      return res.status(410).json({ error: "This wish has expired." });
    }

    // Increment views
    prisma.wish.update({
      where: { id: wish.id },
      data: { views: { increment: 1 } },
    }).catch(() => {});

    // Don't send PIN in response
    const { pin, ...wishData } = wish;
    const hasPIN = !!pin;
    res.json({ wish: wishData, hasPIN });
  } catch (err) { next(err); }
});

// ── POST /api/wishes/:code/verify-pin ─────────────────────────────────────────
router.post("/:code/verify-pin", async (req, res, next) => {
  try {
    const wish = await prisma.wish.findUnique({
      where: { code: req.params.code.toUpperCase() },
      include: {
        gift: true,
        reactions: { orderBy: { createdAt: "desc" } },
        replies:   { orderBy: { createdAt: "desc" } },
      },
    });
    if (!wish) return res.status(404).json({ error: "Wish not found." });
    if (wish.expiresAt && new Date() > wish.expiresAt) {
      return res.status(410).json({ error: "This wish has expired." });
    }
    if (wish.pin && wish.pin !== req.body.pin) {
      return res.status(401).json({ error: "Wrong PIN. Try again." });
    }
    const { pin, ...wishData } = wish;
    res.json({ wish: wishData });
  } catch (err) { next(err); }
});

// ── POST /api/wishes/:code/react ──────────────────────────────────────────────
router.post("/:code/react", async (req, res, next) => {
  try {
    const wish = await prisma.wish.findUnique({
      where: { code: req.params.code.toUpperCase() },
    });
    if (!wish) return res.status(404).json({ error: "Wish not found." });
    const { emoji } = req.body;
    if (!emoji) return res.status(400).json({ error: "Emoji required." });
    const reaction = await prisma.reaction.create({
      data: { wishId: wish.id, emoji },
    });
    res.status(201).json({ success: true, reaction });
  } catch (err) { next(err); }
});

// ── POST /api/wishes/:code/reply ──────────────────────────────────────────────
router.post("/:code/reply", async (req, res, next) => {
  try {
    const wish = await prisma.wish.findUnique({
      where: { code: req.params.code.toUpperCase() },
    });
    if (!wish) return res.status(404).json({ error: "Wish not found." });
    const { name, message } = req.body;
    if (!name?.trim() || !message?.trim()) {
      return res.status(400).json({ error: "Name and message required." });
    }
    const reply = await prisma.reply.create({
      data: { wishId: wish.id, name: name.trim(), message: message.trim() },
    });
    res.status(201).json({ success: true, reply });
  } catch (err) { next(err); }
});

// ── DELETE /api/wishes/:code ──────────────────────────────────────────────────
router.delete("/:code", async (req, res, next) => {
  try {
    const wish = await prisma.wish.findUnique({
      where: { code: req.params.code.toUpperCase() },
      include: { gift: true },
    });
    if (!wish) return res.status(404).json({ error: "Wish not found." });
    if (wish.gift?.publicId) {
      await cloudinary.uploader.destroy(wish.gift.publicId, {
        resource_type: wish.gift.mediaType === "video" ? "video" : "image",
      }).catch(() => {});
    }
    if (wish.gift?.audioPublicId) {
      await cloudinary.uploader.destroy(wish.gift.audioPublicId, {
        resource_type: "video",
      }).catch(() => {});
    }
    await prisma.wish.delete({ where: { id: wish.id } });
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;