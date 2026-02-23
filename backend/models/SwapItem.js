const mongoose = require("mongoose");

const swapItemSchema = new mongoose.Schema(
    {
        swapKeeperId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SwapKeeper",
            required: true,
        },
        title: { type: String, required: true },
        description: { type: String, default: "" },
        category: { type: String, default: "General" },
        images: [{ type: String }],
        price: { type: Number, required: true, default: 0 },
        swapAllowed: { type: Boolean, default: false },
        stock: { type: Number, default: 0 },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("SwapItem", swapItemSchema);
