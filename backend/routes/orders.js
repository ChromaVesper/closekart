const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Shop = require('../models/Shop');
const auth = require('../middleware/authMiddleware');

// ── POST /api/orders — Place a new order ──────────────────────────────────────
router.post('/', auth, async (req, res) => {
    try {
        const { shopId, products, totalAmount, deliveryLocation } = req.body;

        if (!shopId || !products || products.length === 0) {
            return res.status(400).json({ msg: 'shopId and products are required' });
        }

        // Verify shop exists
        const shop = await Shop.findById(shopId);
        if (!shop) {
            return res.status(404).json({ msg: 'Shop not found' });
        }

        const newOrder = new Order({
            userId: req.user.id,
            shopId,
            products,
            totalAmount,
            deliveryLocation,
            status: 'placed'
        });

        const order = await newOrder.save();
        res.status(201).json(order);
    } catch (err) {
        console.error('Create order error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// ── GET /api/orders/me — Get user's orders (Buyer) ────────────────────────────
router.get('/me', auth, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id })
            .populate('shopId', 'shopName shopImage')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        console.error('Get user orders error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// ── GET /api/orders/seller — Get current seller's shop orders ────────────────
router.get('/seller', auth, async (req, res) => {
    try {
        const shop = await Shop.findOne({ owner: req.user.id });
        if (!shop) {
            return res.status(404).json({ msg: 'No shop found for this user.' });
        }

        const orders = await Order.find({ shopId: shop._id })
            .populate('userId', 'name phone')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        console.error('Get seller orders error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// ── GET /api/orders/shop/:shopId — Get shop's orders (Seller) ─────────────────
router.get('/shop/:shopId', auth, async (req, res) => {
    try {
        // Verify shop ownership
        const shop = await Shop.findOne({ _id: req.params.shopId, owner: req.user.id });
        if (!shop) {
            return res.status(403).json({ msg: 'Unauthorized or shop not found' });
        }

        const orders = await Order.find({ shopId: req.params.shopId })
            .populate('userId', 'name phone')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        console.error('Get shop orders error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// ── PATCH /api/orders/:id/status — Update order status (Seller) ───────────────
router.patch('/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ["placed", "preparing", "out_for_delivery", "delivered", "cancelled"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ msg: 'Invalid status' });
        }

        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ msg: 'Order not found' });

        // Verify shop ownership
        const shop = await Shop.findOne({ _id: order.shopId, owner: req.user.id });
        if (!shop) {
            return res.status(403).json({ msg: 'Unauthorized' });
        }

        order.status = status;
        await order.save();
        
        res.json(order);
    } catch (err) {
        console.error('Update order status error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
