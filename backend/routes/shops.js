const express = require('express');
const router = express.Router();
const Shop = require('../models/Shop');
const auth = require('../middleware/auth'); // We need to create this middleware

// Get all shops (with filters & location)
router.get('/', async (req, res) => {
    const { lat, lng, distance = 5000 } = req.query; // distance in meters

    try {
        let query = {};
        if (lat && lng) {
            query.location = {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: parseInt(distance)
                }
            };
        }

        const shops = await Shop.find(query).populate('owner', 'name email');
        res.json(shops);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Get shop by ID
router.get('/:id', async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id).populate('owner', 'name email');
        if (!shop) return res.status(404).json({ msg: 'Shop not found' });
        res.json(shop);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Create a shop (Protected)
router.post('/', auth, async (req, res) => {
    const { shopName, category, address, phone, latitude, longitude } = req.body;
    try {
        const newShop = new Shop({
            owner: req.user.id,
            shopName,
            category,
            address,
            phone,
            location: { type: 'Point', coordinates: [longitude || 0, latitude || 0] } // Mock coords if not provided
        });
        const shop = await newShop.save();
        res.json(shop);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
