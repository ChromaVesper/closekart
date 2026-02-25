const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/User");
const Otp = require("../models/Otp");
const generateToken = require("../utils/generateToken");
const { generateOTP, sendOTP } = require("../utils/sendOTP");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const authMiddleware = require("../middleware/authMiddleware");

// ==================== EMAIL/PASSWORD AUTH ====================

// POST /api/auth/register
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: "User already exists" });

        user = new User({ name, email, password, role });
        await user.save();

        const token = generateToken(user.id);
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: "Server Error" });
    }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: "Invalid Credentials" });
        if (!user.password) return res.status(400).json({ msg: "Please login with Google or Phone" });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

        const token = generateToken(user.id);
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: "Server Error" });
    }
});

// ==================== PHONE OTP AUTH ====================

// POST /api/auth/send-otp
router.post("/send-otp", async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) return res.status(400).json({ msg: "Phone number is required" });

        // Delete any existing OTPs for this phone
        await Otp.deleteMany({ phone });

        // Generate and save OTP
        const otp = generateOTP();
        await Otp.create({
            phone,
            otp,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
        });

        // Send OTP
        await sendOTP(phone, otp);

        res.json({ msg: "OTP sent successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: "Failed to send OTP" });
    }
});

// POST /api/auth/verify-otp
router.post("/verify-otp", async (req, res) => {
    try {
        const { phone, otp } = req.body;
        if (!phone || !otp) return res.status(400).json({ msg: "Phone and OTP are required" });

        const otpRecord = await Otp.findOne({ phone, otp, expiresAt: { $gt: new Date() } });
        if (!otpRecord) return res.status(400).json({ msg: "Invalid or expired OTP" });

        // Delete used OTP
        await Otp.deleteMany({ phone });

        // Find or create user
        let user = await User.findOne({ phone });
        if (!user) {
            user = await User.create({ phone, provider: "phone" });
        }

        const token = generateToken(user.id);
        res.json({ token, user: { id: user.id, name: user.name, phone: user.phone } });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: "OTP verification failed" });
    }
});

// ==================== FORGOT / RESET PASSWORD ====================

// POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: "No user with that email" });

        const resetToken = crypto.randomBytes(20).toString("hex");
        user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
        user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
        await user.save();

        const resetUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password/${resetToken}`;
        console.log("PASSWORD RESET URL:", resetUrl);

        try {
            await sendEmail({
                email: user.email,
                subject: "Reset your CloseKart password",
                message: `Reset your password here: ${resetUrl}`
            });
            res.json({ msg: "Email sent" });
        } catch {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();
            res.status(500).json({ msg: "Email could not be sent" });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: "Server Error" });
    }
});

// POST /api/auth/reset-password/:token
router.post("/reset-password/:token", async (req, res) => {
    try {
        const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
        const user = await User.findOne({ resetPasswordToken, resetPasswordExpires: { $gt: Date.now() } });
        if (!user) return res.status(400).json({ msg: "Invalid or expired token" });

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ msg: "Password reset successful" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: "Server Error" });
    }
});

// ==================== GET CURRENT USER ====================

// GET /api/auth/me
router.get("/me", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: "Server Error" });
    }
});

// ==================== GOOGLE OAUTH ====================

router.get("/google",
    passport.authenticate("google", {
        scope: ["profile", "email"],
        prompt: "select_account"
    })
);

router.get("/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: "/login" }),
    (req, res) => {
        try {
            const token = generateToken(req.user._id || req.user.id);
            res.redirect(`${process.env.FRONTEND_URL || "https://chromavesper.github.io/closekart"}/oauth-success?token=${token}`);
        } catch (error) {
            console.error("OAuth callback error:", error);
            res.redirect(`${process.env.FRONTEND_URL || "https://chromavesper.github.io/closekart"}/login`);
        }
    }
);

// POST /api/auth/logout
router.post("/logout", (req, res) => {
    res.json({ msg: "Logged out successfully" });
});

module.exports = router;
