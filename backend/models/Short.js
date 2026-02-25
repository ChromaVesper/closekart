const mongoose = require("mongoose");

const shortSchema = new mongoose.Schema({
    title: { type: String, required: true },
    videoUrl: { type: String, required: true },
    thumbnail: { type: String },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    views: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("Short", shortSchema);
