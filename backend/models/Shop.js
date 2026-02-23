const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    shopName: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },

    // ── Address (text form) ────────────────────────────────────────────────────
    address: {          // short address / street
        type: String,
        default: '',
    },
    fullAddress: {       // complete reverse-geocoded address from map
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

    // ── GeoJSON location (2dsphere) ─────────────────────────────────────────────
    location: {
        type: { type: String, default: 'Point', enum: ['Point'] },
        coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
    },

    // ── Location lock (permanent after first save) ──────────────────────────────
    isLocationLocked: {
        type: Boolean,
        default: false,
    },

    // ── Shop image ─────────────────────────────────────────────────────────────
    shopImage: {
        type: String,
        default: '',
    },

    // ── Metrics ─────────────────────────────────────────────────────────────────
    rating: {
        type: Number,
        default: 4.5,
    },
    deliveryAvailable: {
        type: Boolean,
        default: false,
    },
    deliveryRadius: {
        type: Number,
        default: 5000, // metres
    },
    deliveryCharge: {
        type: Number,
        default: 0,
    },
    phone: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Geospatial index — required for $geoNear and $near queries
shopSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Shop', shopSchema);
