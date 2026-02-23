const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },

    // ── Label ──────────────────────────────────────────────────────────────────
    label: {
        type: String,
        enum: ['Home', 'Work', 'Hotel', 'Other'],
        default: 'Home',
    },

    // ── Delivery contact ────────────────────────────────────────────────────────
    fullName: {
        type: String,
        default: '',
    },
    phoneNumber: {
        type: String,
        default: '',
    },

    // ── Address detail fields ───────────────────────────────────────────────────
    houseNumber: {      // Flat / House / Door number
        type: String,
        default: '',
    },
    buildingName: {
        type: String,
        default: '',
    },
    floor: {
        type: String,
        default: '',
    },
    area: {             // Locality / Colony
        type: String,
        default: '',
    },
    landmark: {
        type: String,
        default: '',
    },
    city: {
        type: String,
        default: '',
    },
    state: {
        type: String,
        default: '',
    },
    pincode: {
        type: String,
        default: '',
    },
    country: {
        type: String,
        default: '',
    },

    // ── Auto-generated display address ──────────────────────────────────────────
    fullAddress: {
        type: String,
        required: true,
    },

    // ── GeoJSON location ────────────────────────────────────────────────────────
    location: {
        type: { type: String, default: 'Point', enum: ['Point'] },
        coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },

    isDefault: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

addressSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Address', addressSchema);
