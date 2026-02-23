const express = require('express');
const router = express.Router();
const Address = require('../models/Address');
const auth = require('../middleware/authMiddleware');

// ── Helper: build fullAddress string from parts ────────────────────────────────
const buildFullAddress = (fields) => {
    const { houseNumber, buildingName, floor, area, landmark, city, state, pincode, country, fullAddress } = fields;
    if (houseNumber || buildingName || area) {
        const parts = [
            houseNumber && `#${houseNumber}`,
            buildingName,
            floor && `Floor ${floor}`,
            area,
            landmark && `Near ${landmark}`,
            city,
            state,
            pincode,
            country,
        ].filter(Boolean);
        return parts.join(', ');
    }
    return fullAddress || '';
};

// ── POST /api/address/add ─────────────────────────────────────────────────────
router.post('/add', auth, async (req, res) => {
    try {
        const {
            label, latitude, longitude, isDefault = false,
            fullName, phoneNumber,
            houseNumber, buildingName, floor, area, landmark, city, state, pincode, country,
            fullAddress: rawFullAddress,
        } = req.body;

        if (latitude == null || longitude == null) {
            return res.status(400).json({ msg: 'latitude and longitude are required' });
        }

        const fullAddress = buildFullAddress({ houseNumber, buildingName, floor, area, landmark, city, state, pincode, country, fullAddress: rawFullAddress });
        if (!fullAddress) return res.status(400).json({ msg: 'fullAddress or address details are required' });

        if (isDefault) {
            await Address.updateMany({ userId: req.user.id }, { isDefault: false });
        }
        const existingCount = await Address.countDocuments({ userId: req.user.id });

        const address = new Address({
            userId: req.user.id,
            label: label || 'Home',
            fullName: fullName || '',
            phoneNumber: phoneNumber || '',
            houseNumber: houseNumber || '',
            buildingName: buildingName || '',
            floor: floor || '',
            area: area || '',
            landmark: landmark || '',
            city: city || '',
            state: state || '',
            pincode: pincode || '',
            country: country || '',
            fullAddress,
            location: {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)],
            },
            isDefault: isDefault || existingCount === 0,
        });

        await address.save();
        res.status(201).json(address);
    } catch (err) {
        console.error('Address add error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// ── PUT /api/address/update/:id ───────────────────────────────────────────────
router.put('/update/:id', auth, async (req, res) => {
    try {
        const {
            label, latitude, longitude,
            fullName, phoneNumber,
            houseNumber, buildingName, floor, area, landmark, city, state, pincode, country,
            fullAddress: rawFullAddress,
        } = req.body;

        const address = await Address.findOne({ _id: req.params.id, userId: req.user.id });
        if (!address) return res.status(404).json({ msg: 'Address not found' });

        // Merge fields
        if (label) address.label = label;
        if (fullName !== undefined) address.fullName = fullName;
        if (phoneNumber !== undefined) address.phoneNumber = phoneNumber;
        if (houseNumber !== undefined) address.houseNumber = houseNumber;
        if (buildingName !== undefined) address.buildingName = buildingName;
        if (floor !== undefined) address.floor = floor;
        if (area !== undefined) address.area = area;
        if (landmark !== undefined) address.landmark = landmark;
        if (city !== undefined) address.city = city;
        if (state !== undefined) address.state = state;
        if (pincode !== undefined) address.pincode = pincode;
        if (country !== undefined) address.country = country;

        if (latitude != null && longitude != null) {
            address.location = { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] };
        }

        // Rebuild fullAddress
        address.fullAddress = buildFullAddress({
            houseNumber: address.houseNumber,
            buildingName: address.buildingName,
            floor: address.floor,
            area: address.area,
            landmark: address.landmark,
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            country: address.country,
            fullAddress: rawFullAddress || address.fullAddress,
        });

        await address.save();
        res.json(address);
    } catch (err) {
        console.error('Address update error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// ── GET /api/address/my ───────────────────────────────────────────────────────
router.get('/my', auth, async (req, res) => {
    try {
        const addresses = await Address.find({ userId: req.user.id }).sort({ isDefault: -1, createdAt: -1 });
        res.json(addresses);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// ── PUT /api/address/set-default/:id ─────────────────────────────────────────
router.put('/set-default/:id', auth, async (req, res) => {
    try {
        await Address.updateMany({ userId: req.user.id }, { isDefault: false });
        const address = await Address.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { isDefault: true },
            { new: true }
        );
        if (!address) return res.status(404).json({ msg: 'Address not found' });
        res.json(address);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// ── DELETE /api/address/:id ───────────────────────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
    try {
        const address = await Address.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!address) return res.status(404).json({ msg: 'Address not found' });
        if (address.isDefault) {
            const next = await Address.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
            if (next) await Address.findByIdAndUpdate(next._id, { isDefault: true });
        }
        res.json({ msg: 'Address deleted', id: req.params.id });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
