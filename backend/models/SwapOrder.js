const mongoose = require("mongoose");

const swapOrderSchema = new mongoose.Schema(
    {
        itemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SwapItem",
            required: true,
        },
        buyerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        swapKeeperId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SwapKeeper",
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "declined", "completed"],
            default: "pending",
        },
        note: { type: String, default: "" },
    },
    { timestamps: true }
);

module.exports = mongoose.model("SwapOrder", swapOrderSchema);
