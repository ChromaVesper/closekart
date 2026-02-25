const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../uploads"));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `avatar_${req.user.id}_${Date.now()}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed"), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// POST /api/upload/avatar
router.post("/avatar", authMiddleware, upload.single("avatar"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: "No file uploaded" });
        }

        const avatarUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        await User.findByIdAndUpdate(req.user.id, { avatar: avatarUrl });

        res.json({ avatar: avatarUrl, msg: "Avatar uploaded successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: "Upload failed" });
    }
});

module.exports = router;
