const express = require("express");
const router = express.Router();
const Short = require("../models/Short");
const authMiddleware = require("../middleware/authMiddleware");

// GET /api/shorts
// Fetch the latest shorts for the feed
router.get("/", async (req, res) => {
    try {
        const shorts = await Short.find()
            .sort({ createdAt: -1 })
            .populate("sellerId", "name avatar shopName")
            .limit(20);
        res.json(shorts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server Error" });
    }
});

// POST /api/shorts/upload
// Upload a new short (Auth Required)
router.post("/upload", authMiddleware, async (req, res) => {
    try {
        const { title, videoUrl, thumbnail } = req.body;

        if (!title || !videoUrl) {
            return res.status(400).json({ msg: "Please provide title and videoUrl" });
        }

        const newShort = new Short({
            title,
            videoUrl,
            thumbnail,
            sellerId: req.user.id
        });

        await newShort.save();
        res.status(201).json(newShort);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server Error" });
    }
});

module.exports = router;
