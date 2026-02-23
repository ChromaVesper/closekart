const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Order = require("../models/Order");
const Wishlist = require("../models/Wishlist");
const authMiddleware = require("../middleware/authMiddleware");

// GET /api/profile/me
router.get("/me", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) return res.status(404).json({ msg: "User not found" });
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: "Server Error" });
    }
});

// GET /api/profile/orders
router.get("/orders", authMiddleware, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: "Server Error" });
    }
});

// GET /api/profile/wishlist
router.get("/wishlist", authMiddleware, async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({ userId: req.user.id });
        res.json(wishlist || { products: [] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: "Server Error" });
    }
});

// PUT /api/profile/update
router.put("/update", authMiddleware, async (req, res) => {
    try {
        const { name, phone, avatar } = req.body;
        const updateFields = {};
        if (name !== undefined) updateFields.name = name;
        if (phone !== undefined) updateFields.phone = phone;
        if (avatar !== undefined) updateFields.avatar = avatar;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updateFields },
            { new: true }
        ).select("-password");

        if (!user) return res.status(404).json({ msg: "User not found" });
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: "Server Error" });
    }
});

module.exports = router;
