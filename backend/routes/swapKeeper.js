const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const isSwapKeeper = require("../middleware/isSwapKeeper");
const ctrl = require("../controllers/swapKeeperController");

// All routes protected by auth + swap_keeper role check
router.use(authMiddleware, isSwapKeeper);

// Dashboard
router.get("/dashboard", ctrl.getDashboardStats);

// Items
router.get("/items", ctrl.getItems);
router.post("/items", ctrl.createItem);
router.put("/items/:id", ctrl.updateItem);
router.delete("/items/:id", ctrl.deleteItem);

// Orders
router.get("/orders", ctrl.getOrders);
router.put("/orders/:id/accept", ctrl.acceptOrder);
router.put("/orders/:id/decline", ctrl.declineOrder);

// Profile
router.get("/profile", ctrl.getProfile);
router.put("/profile", ctrl.updateProfile);

// Shop location — set permanently
router.post("/save-location", async (req, res) => {
    const Shop = require("../models/Shop");
    const { latitude, longitude, fullAddress, landmark, city, state, pincode } = req.body;

    if (!latitude || !longitude || !fullAddress) {
        return res.status(400).json({ msg: "latitude, longitude and fullAddress are required" });
    }

    try {
        const shop = await Shop.findOne({ owner: req.user.id });
        if (!shop) return res.status(404).json({ msg: "Shop not found" });

        if (shop.isLocationLocked) {
            return res.status(403).json({ msg: "Shop location is already locked and cannot be changed." });
        }

        shop.location = {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
        };
        shop.fullAddress = fullAddress;
        shop.landmark = landmark || "";
        shop.city = city || "";
        shop.state = state || "";
        shop.pincode = pincode || "";
        shop.isLocationLocked = true;

        await shop.save();
        res.json({ msg: "Location saved and locked.", shop });
    } catch (err) {
        console.error("save-location error:", err);
        res.status(500).json({ msg: "Server error" });
    }
});

// Get own shop data (location, profile, etc.)
router.get("/shop", async (req, res) => {
    const Shop = require("../models/Shop");
    try {
        const shop = await Shop.findOne({ owner: req.user.id });
        if (!shop) return res.status(404).json({ msg: "Shop not found" });
        res.json(shop);
    } catch (err) {
        res.status(500).json({ msg: "Server error" });
    }
});

module.exports = router;
