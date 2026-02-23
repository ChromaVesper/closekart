const express = require('express');
const router = express.Router();
const Shop = require('../models/Shop');
const auth = require('../middleware/authMiddleware');

// GET /api/shops/nearby?lat=X&lng=Y&radius=R
// Uses $geoNear aggregate so each result includes distanceMeters field
router.get('/nearby', async (req, res) => {
    const { lat, lng, radius = 5000 } = req.query;
    if (!lat || !lng) {
        return res.status(400).json({ msg: 'lat and lng are required' });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const maxDist = parseInt(radius);

    if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ msg: 'lat and lng must be numbers' });
    }

    try {
        const shops = await Shop.aggregate([
            {
                $geoNear: {
                    near: { type: 'Point', coordinates: [longitude, latitude] },
                    distanceField: 'distanceMeters',
                    maxDistance: maxDist,
                    spherical: true,
                },
            },
            {
                $addFields: {
                    distanceKm: { $round: [{ $divide: ['$distanceMeters', 1000] }, 1] },
                },
            },
            { $sort: { distanceMeters: 1 } },
        ]);

        res.json(shops);
    } catch (err) {
        console.error('Nearby shops error:', err);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

// GET /api/shops?lat=X&lng=Y&radius=R — same as nearby but permissive (no error when coords missing)
router.get('/', async (req, res) => {
    try {
        const { lat, lng, radius = 10000 } = req.query;

        if (!lat || !lng) return res.status(200).json([]);

        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);

        if (isNaN(latitude) || isNaN(longitude)) return res.status(200).json([]);

        const shops = await Shop.aggregate([
            {
                $geoNear: {
                    near: { type: 'Point', coordinates: [longitude, latitude] },
                    distanceField: 'distanceMeters',
                    maxDistance: parseInt(radius),
                    spherical: true,
                },
            },
            {
                $addFields: {
                    distanceKm: { $round: [{ $divide: ['$distanceMeters', 1000] }, 1] },
                },
            },
            { $sort: { distanceMeters: 1 } },
        ]);

        res.json(shops);
    } catch (error) {
        console.error('Shops fetch error:', error);
        res.status(200).json([]);
    }
});

// GET /api/shops/:id — get a single shop by ID
router.get('/:id', async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id).populate('owner', 'name email');
        if (!shop) return res.status(404).json({ msg: 'Shop not found' });
        res.json(shop);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// POST /api/shops — create shop (protected)
router.post('/', auth, async (req, res) => {
    const { shopName, category, address, phone, latitude, longitude, deliveryRadius } = req.body;
    try {
        const newShop = new Shop({
            owner: req.user.id,
            shopName,
            category,
            address,
            phone,
            deliveryRadius: deliveryRadius || 5000,
            location: {
                type: 'Point',
                coordinates: [parseFloat(longitude) || 0, parseFloat(latitude) || 0],
            },
        });
        const shop = await newShop.save();
        res.json(shop);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
