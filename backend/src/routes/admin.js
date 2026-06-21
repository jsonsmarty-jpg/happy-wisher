const express = require("express");
const router  = express.Router();
const bcrypt  = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// GET /api/admin/status - check if password has been set up
router.get("/status", async (req, res, next) => {
  try {
    const existing = await prisma.adminAuth.findFirst();
    res.json({ configured: !!existing });
  } catch (err) { next(err); }
});

// POST /api/admin/setup - first time password setup
router.post("/setup", async (req, res, next) => {
  try {
    const existing = await prisma.adminAuth.findFirst();
    if (existing) return res.status(400).json({ error: "Admin password already configured." });

    const { password, confirmPassword } = req.body;
    if (!password || password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters." });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.adminAuth.create({ data: { passwordHash } });
    res.status(201).json({ success: true });
  } catch (err) { next(err); }
});

// POST /api/admin/login - authenticate and return token
router.post("/login", async (req, res, next) => {
  try {
    const admin = await prisma.adminAuth.findFirst();
    if (!admin) return res.status(400).json({ error: "Admin not configured yet." });

    const { password } = req.body;
    const valid = await bcrypt.compare(password || "", admin.passwordHash);
    if (!valid) return res.status(401).json({ error: "Incorrect password." });

    res.json({ success: true, token: process.env.ADMIN_KEY });
  } catch (err) { next(err); }
});

// Middleware to protect routes below
function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized." });
  }
  next();
}

// POST /api/admin/change-password (requires being logged in)
router.post("/change-password", requireAdmin, async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    const admin = await prisma.adminAuth.findFirst();
    if (!admin) return res.status(400).json({ error: "Admin not configured yet." });

    const valid = await bcrypt.compare(currentPassword || "", admin.passwordHash);
    if (!valid) return res.status(401).json({ error: "Current password is incorrect." });

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters." });
    }
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ error: "New passwords do not match." });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.adminAuth.update({ where: { id: admin.id }, data: { passwordHash } });
    res.json({ success: true });
  } catch (err) { next(err); }
});

// POST /api/admin/reset-password (emergency recovery using ADMIN_KEY as master override)
router.post("/reset-password", async (req, res, next) => {
  try {
    const { masterKey, newPassword, confirmNewPassword } = req.body;
    if (masterKey !== process.env.ADMIN_KEY) {
      return res.status(401).json({ error: "Invalid master key." });
    }
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters." });
    }
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ error: "New passwords do not match." });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    const admin = await prisma.adminAuth.findFirst();
    if (admin) {
      await prisma.adminAuth.update({ where: { id: admin.id }, data: { passwordHash } });
    } else {
      await prisma.adminAuth.create({ data: { passwordHash } });
    }
    res.json({ success: true });
  } catch (err) { next(err); }
});

// GET /api/admin/stats
router.get("/stats", requireAdmin, async (req, res, next) => {
  try {
    const totalWishes = await prisma.wish.count();
    const totalSpecial = await prisma.wish.count({ where: { type: "special" } });
    const totalRandom = await prisma.wish.count({ where: { type: "random" } });

    const senders = await prisma.wish.findMany({
      select: { sender: true },
      distinct: ["sender"],
    });

    const countryGroups = await prisma.wish.groupBy({
      by: ["country"],
      _count: { country: true },
    });
    const countries = countryGroups
      .map(c => ({ country: c.country || "Unknown", count: c._count.country }))
      .sort((a, b) => b.count - a.count);

    const totalViews = await prisma.wish.aggregate({ _sum: { views: true } });

    res.json({
      totalUsers: senders.length,
      totalWishes,
      totalSpecial,
      totalRandom,
      totalViews: totalViews._sum.views || 0,
      countries,
    });
  } catch (err) { next(err); }
});

// GET /api/admin/media - list all media for storage management
router.get("/media", requireAdmin, async (req, res, next) => {
  try {
    const gifts = await prisma.gift.findMany({
      select: {
        id: true, wishId: true, mediaUrl: true, mediaType: true,
        publicId: true, audioUrl: true, audioPublicId: true, createdAt: true,
        wish: { select: { code: true, sender: true, receiver: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ gifts });
  } catch (err) { next(err); }
});

// DELETE /api/admin/media/:giftId - delete a piece of media
router.delete("/media/:giftId", requireAdmin, async (req, res, next) => {
  try {
    const cloudinary = require("../config/cloudinary");
    const gift = await prisma.gift.findUnique({ where: { id: req.params.giftId } });
    if (!gift) return res.status(404).json({ error: "Not found." });

    if (gift.publicId) {
      await cloudinary.uploader.destroy(gift.publicId, {
        resource_type: gift.mediaType === "video" ? "video" : "image",
      }).catch(() => {});
    }
    if (gift.audioPublicId) {
      await cloudinary.uploader.destroy(gift.audioPublicId, { resource_type: "video" }).catch(() => {});
    }
    await prisma.gift.update({
      where: { id: gift.id },
      data: { mediaUrl: null, mediaType: null, publicId: null, audioUrl: null, audioPublicId: null },
    });
    res.json({ success: true });
  } catch (err) { next(err); }
});

// GET /api/admin/feedback
router.get("/feedback", requireAdmin, async (req, res, next) => {
  try {
    const feedbacks = await prisma.feedback.findMany({ orderBy: { createdAt: "desc" } });
    res.json({ feedbacks });
  } catch (err) { next(err); }
});

module.exports = router;
