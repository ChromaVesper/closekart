const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

// GET /api/user/me — get current user profile
router.get("/me", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "No token" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");
        if (!user) return res.status(404).json({ error: "User not found" });

        res.json(user);
    } catch {
        res.status(401).json({ error: "Invalid token" });
    }
});

// PUT /api/user/update — update user profile
router.put("/update", authMiddleware, async (req, res) => {
    try {
        const { name, phone, avatar } = req.body;
        const updateFields = {};
        if (name) updateFields.name = name;
        if (phone) updateFields.phone = phone;
        if (avatar) updateFields.avatar = avatar;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updateFields },
            { new: true }
        ).select("-password");

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: "Server Error" });
    }
});

// GET /api/user/orders — get user orders
router.get("/orders", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate("orders");
        res.json(user.orders || []);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: "Server Error" });
    }
});

// GET /api/user/wishlist — get user wishlist
router.get("/wishlist", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate("wishlist");
        res.json(user.wishlist || []);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: "Server Error" });
    }
});

// POST /api/user/wishlist/:productId — toggle wishlist item
router.post("/wishlist/:productId", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const productId = req.params.productId;
        const index = user.wishlist.indexOf(productId);

        if (index > -1) {
            user.wishlist.splice(index, 1);
        } else {
            user.wishlist.push(productId);
        }

        await user.save();
        res.json(user.wishlist);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: "Server Error" });
    }
});

module.exports = router;
