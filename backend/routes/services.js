const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const auth = require('../middleware/auth');

// Get all services
router.get('/', async (req, res) => {
    try {
        const services = await Service.find().populate('shop');
        res.json(services);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Add Service (Protected)
router.post('/', auth, async (req, res) => {
    const { shopId, name, price, homeServiceAvailable } = req.body;
    try {
        const newService = new Service({
            shop: shopId,
            name,
            price,
            homeServiceAvailable
        });
        const service = await newService.save();
        res.json(service);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
