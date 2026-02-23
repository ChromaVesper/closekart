const express = require("express");
const router = express.Router();

// Simple reverse geocode placeholder endpoint
router.get("/reverse", async (req, res) => {
    try {
        const { lat, lng } = req.query;

        if (!lat || !lng) {
            return res.status(200).json({
                city: "Unknown",
                lat: null,
                lng: null
            });
        }

        res.status(200).json({
            city: "Detected location",
            lat: parseFloat(lat),
            lng: parseFloat(lng)
        });

    } catch (error) {
        console.error("Location route error:", error);
        res.status(200).json({
            city: "Unknown"
        });
    }
});

module.exports = router;
