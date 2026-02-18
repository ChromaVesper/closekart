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
    address: {
        type: String,
        required: true,
    },
    location: {
        type: { type: String, default: 'Point', enum: ['Point'] },
        coordinates: { type: [Number], index: '2dsphere' }, // [longitude, latitude]
    },
    rating: {
        type: Number,
        default: 4.5,
    },
    distanceKm: { // Mock distance for demo
        type: Number,
        default: 1.2,
    },
    deliveryAvailable: {
        type: Boolean,
        default: false,
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

module.exports = mongoose.model('Shop', shopSchema);
