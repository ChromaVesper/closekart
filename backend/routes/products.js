const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Shop = require('../models/Shop');
const auth = require('../middleware/authMiddleware');

// ── GET /api/products/nearby?lat=X&lng=Y&radius=R&search=Q&category=C ─────────
// Find nearby shops via $nearSphere (avoids duplicate 2dsphere index ambiguity),
// then return their products annotated with shop distanceKm.
router.get('/nearby', async (req, res) => {
    try {
        const { lat, lng, radius = 10000, search, category } = req.query;

        let shopIds = null;
        let shopDistMap = {};

        if (lat && lng) {
            const latitude = parseFloat(lat);
            const longitude = parseFloat(lng);

            if (!isNaN(latitude) && !isNaN(longitude)) {
                // Use $nearSphere — works even with multiple 2dsphere indexes
                const nearbyShops = await Shop.find({
                    location: {
                        $nearSphere: {
                            $geometry: { type: 'Point', coordinates: [longitude, latitude] },
                            $maxDistance: parseInt(radius),
                        },
                    },
                }).select('_id shopName shopImage location');

                shopIds = nearbyShops.map(s => s._id);

                // Pre-compute Haversine distance for each shop
                const toRad = d => d * Math.PI / 180;
                nearbyShops.forEach(s => {
                    const [sLng, sLat] = s.location.coordinates;
                    const R = 6371000;
                    const dLat = toRad(sLat - latitude);
                    const dLng = toRad(sLng - longitude);
                    const a = Math.sin(dLat / 2) ** 2
                        + Math.cos(toRad(latitude))
                        * Math.cos(toRad(sLat))
                        * Math.sin(dLng / 2) ** 2;
                    const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                    shopDistMap[s._id.toString()] = {
                        shopName: s.shopName,
                        distanceKm: Math.round(dist / 100) / 10,
                    };
                });
            }
        }

        // Build product query
        const query = { availability: true };
        if (shopIds !== null) query.shop = { $in: shopIds };
        if (category) query.category = { $regex: category, $options: 'i' };
        if (search) query.name = { $regex: search, $options: 'i' };

        const products = await Product.find(query)
            .populate('shop', 'shopName shopImage city state')
            .sort({ createdAt: -1 })
            .limit(30);

        // Annotate with distance
        const annotated = products.map(p => {
            const obj = p.toObject();
            const sid = obj.shop?._id?.toString();
            if (sid && shopDistMap[sid]) obj.shop.distanceKm = shopDistMap[sid].distanceKm;
            return obj;
        });

        res.json(annotated);
    } catch (err) {
        console.error('Products nearby error:', err);
        res.status(500).json({ msg: 'Server error', error: err.message });

    }
});

// ── GET /api/products?search=Q&category=C&minPrice=X&maxPrice=Y ───────────────
router.get('/', async (req, res) => {
    const { search, category, minPrice, maxPrice } = req.query;
    let query = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    if (category) query.category = { $regex: category, $options: 'i' };
    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    try {
        const products = await Product.find(query).populate('shop');
        res.json(products);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
});

// ── POST /api/products — Add product (auto-attach shop from logged-in user) ───
router.post('/', auth, async (req, res) => {
    const { name, category, price, stockQuantity, image, description } = req.body;
    try {
        // Auto-resolve shop from logged-in user (SwapKeeper)
        const shop = await Shop.findOne({ owner: req.user.id });
        if (!shop) {
            return res.status(404).json({ msg: 'No shop found for this user. Please set up your shop profile first.' });
        }

        const newProduct = new Product({
            shop: shop._id,
            name,
            category,
            price,
            stockQuantity: stockQuantity || 10,
            image: image || '',
            description: description || '',
        });
        const product = await newProduct.save();
        res.status(201).json(product);
    } catch (err) {
        console.error('Product create error:', err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// ── PUT /api/products/:id ─────────────────────────────────────────────────────
router.put('/:id', auth, async (req, res) => {
    try {
        const shop = await Shop.findOne({ owner: req.user.id });
        const product = await Product.findOne({ _id: req.params.id, shop: shop?._id });
        if (!product) return res.status(404).json({ msg: 'Product not found or not yours' });

        const { name, category, price, stockQuantity, availability, image, description } = req.body;
        if (name !== undefined) product.name = name;
        if (category !== undefined) product.category = category;
        if (price !== undefined) product.price = price;
        if (stockQuantity !== undefined) product.stockQuantity = stockQuantity;
        if (availability !== undefined) product.availability = availability;
        if (image !== undefined) product.image = image;
        if (description !== undefined) product.description = description;

        await product.save();
        res.json(product);
    } catch (err) {
        console.error('Product update error:', err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// ── DELETE /api/products/:id ──────────────────────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
    try {
        const shop = await Shop.findOne({ owner: req.user.id });
        const product = await Product.findOneAndDelete({ _id: req.params.id, shop: shop?._id });
        if (!product) return res.status(404).json({ msg: 'Product not found or not yours' });
        res.json({ msg: 'Product deleted', id: req.params.id });
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
});

module.exports = router;
