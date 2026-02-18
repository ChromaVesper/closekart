const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// Get all products (Search & Filter)
router.get('/', async (req, res) => {
    const { search, category, minPrice, maxPrice } = req.query;
    let query = {};

    if (search) {
        query.name = { $regex: search, $options: 'i' };
    }
    if (category) {
        query.category = category;
    }
    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = minPrice;
        if (maxPrice) query.price.$lte = maxPrice;
    }

    try {
        const products = await Product.find(query).populate('shop');
        res.json(products);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Add Product (Protected - Shopkeeper)
router.post('/', auth, async (req, res) => {
    const { shopId, name, category, price, stockQuantity } = req.body;
    try {
        // Verify user owns the shop (logic omitted for brevity, but should be here)
        const newProduct = new Product({
            shop: shopId,
            name,
            category,
            price,
            stockQuantity
        });
        const product = await newProduct.save();
        res.json(product);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
