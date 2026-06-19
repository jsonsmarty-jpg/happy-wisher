const express = require("express");
const router  = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// POST /api/feedback
router.post("/", async (req, res, next) => {
  try {
    const { name, type, message } = req.body;
    if (!name?.trim() || !type?.trim() || !message?.trim()) {
      return res.status(400).json({ error: "Name, type and message are required." });
    }
    const feedback = await prisma.feedback.create({
      data: {
        name: name.trim(),
        type: type.trim(),
        message: message.trim(),
      },
    });
    res.status(201).json({ success: true, feedback });
  } catch (err) { next(err); }
});

// GET /api/feedback
router.get("/", async (req, res, next) => {
  try {
    const feedbacks = await prisma.feedback.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json({ feedbacks });
  } catch (err) { next(err); }
});

module.exports = router;
