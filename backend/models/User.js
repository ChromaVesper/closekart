const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    name: { type: String },
    email: { type: String, unique: true, sparse: true },
    phone: {
        type: String,
        unique: true,
        required: true
    },
    password: { type: String },
    avatar: { type: String },
    googleId: { type: String },
    firebaseUid: { type: String },
    provider: { type: String, default: "local" },
    role: { type: String, enum: ["customer", "shopkeeper", "swap_keeper", "admin"], default: "customer" },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
    resetPasswordToken: String,
    resetPasswordExpires: Date
}, { timestamps: true });

userSchema.pre("save", async function () {
    if (!this.password) return;
    if (!this.isModified("password")) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
