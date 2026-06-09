const express    = require("express");
const router     = express.Router();
const { PrismaClient } = require("@prisma/client");
const { upload, uploadToCloudinary } = require("../middleware/upload");
const cloudinary = require("../config/cloudinary");
const { generateWishCode } = require("../utils/wishCode");

const prisma = new PrismaClient();

const VALID_EVENTS = ["birthday","graduation","newyear","christmas","easter","eid"];
const VALID_TYPES  = ["special","random"];

function validateWish({ type, sender, receiver, message, event }) {
  if (!VALID_TYPES.includes(type))            throw Object.assign(new Error("Invalid wish type."), { status: 400 });
  if (!sender?.trim())                        throw Object.assign(new Error("Sender name required."), { status: 400 });
  if (type === "special" && !receiver?.trim()) throw Object.assign(new Error("Receiver name required."), { status: 400 });
  if (!message?.trim() || message.trim().length < 10) throw Object.assign(new Error("Message too short."), { status: 400 });
  if (!VALID_EVENTS.includes(event))          throw Object.assign(new Error("Invalid event."), { status: 400 });
}

router.post("/", upload.single("giftMedia"), async (req, res, next) => {
  let cloudinaryPublicId = null;
  try {
    const { type, sender, receiver, message, event, songTitle, songArtist, giftMessage } = req.body;
    validateWish({ type, sender, receiver, message, event });

    let code, attempts = 0;
    while (true) {
      code = generateWishCode();
      const exists = await prisma.wish.findUnique({ where: { code } });
      if (!exists) break;
      if (++attempts > 5) throw new Error("Could not generate unique code.");
    }

    let giftData = null;
    if (type === "special" && giftMessage?.trim()) {
      let mediaUrl = null, mediaType = null;
      if (req.file) {
        const isVideo = req.file.mimetype.startsWith("video/");
        const { url, publicId } = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
        mediaUrl = url;
        mediaType = isVideo ? "video" : "image";
        cloudinaryPublicId = publicId;
      }
      giftData = { message: giftMessage.trim(), mediaUrl, mediaType, publicId: cloudinaryPublicId };
    }

    const wish = await prisma.wish.create({
      data: {
        code, type,
        sender:     sender.trim(),
        receiver:   receiver?.trim() || null,
        message:    message.trim(),
        event,
        songTitle:  songTitle?.trim()  || null,
        songArtist: songArtist?.trim() || null,
        ...(giftData && { gift: { create: giftData } }),
      },
      include: { gift: true },
    });

    res.status(201).json({ success: true, wish });
  } catch (err) {
    if (cloudinaryPublicId) cloudinary.uploader.destroy(cloudinaryPublicId).catch(() => {});
    next(err);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(20, parseInt(req.query.limit) || 12);
    const [wishes, total] = await Promise.all([
      prisma.wish.findMany({
        where: { type: "random" }, orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit, take: limit,
        select: { id:true, code:true, type:true, sender:true, event:true, message:true, createdAt:true },
      }),
      prisma.wish.count({ where: { type: "random" } }),
    ]);
    res.json({ wishes, total, page, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
});

router.get("/:code", async (req, res, next) => {
  try {
    const wish = await prisma.wish.findUnique({
      where: { code: req.params.code.toUpperCase() },
      include: { gift: true },
    });
    if (!wish) return res.status(404).json({ error: "Wish not found." });
    prisma.wish.update({ where: { id: wish.id }, data: { views: { increment: 1 } } }).catch(() => {});
    res.json({ wish });
  } catch (err) { next(err); }
});

router.delete("/:code", async (req, res, next) => {
  try {
    const wish = await prisma.wish.findUnique({
      where: { code: req.params.code.toUpperCase() },
      include: { gift: true },
    });
    if (!wish) return res.status(404).json({ error: "Wish not found." });
    if (wish.gift?.publicId) {
      await cloudinary.uploader.destroy(wish.gift.publicId, {
        resource_type: wish.gift.mediaType === "video" ? "video" : "image"
      }).catch(() => {});
    }
    await prisma.wish.delete({ where: { id: wish.id } });
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
