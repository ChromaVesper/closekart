const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
        required: true
    },

    products: [
        {
            productId: String,
            name: String,
            price: Number,
            quantity: Number,
            image: String
        }
    ],

    totalAmount: Number,

    deliveryLocation: {
        lat: Number,
        lng: Number,
        address: String
    },

    status: {
        type: String,
        enum: ["placed", "preparing", "out_for_delivery", "delivered", "cancelled"],
        default: "placed"
    }

}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
