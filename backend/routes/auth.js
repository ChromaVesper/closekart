const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Otp = require("../models/Otp");
const otpGenerator = require("otp-generator");
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

router.post("/send-otp", async (req, res) => {
    try {
        const { phone } = req.body;

        const otp = otpGenerator.generate(6, {
            upperCase: false,
            specialChars: false,
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false
        });

        await Otp.create({
            phone,
            otp,
            expiresAt: Date.now() + 5 * 60 * 1000
        });

        // Twilio Integration
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
            try {
                const twilio = require("twilio");
                const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
                await client.messages.create({
                    body: `Your CloseKart verification code is: ${otp}`,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: phone
                });
                console.log(`OTP sent to ${phone} via Twilio`);
            } catch (twilioErr) {
                console.error("Twilio SMS send error:", twilioErr.message);
                console.log("Fallback OTP log:", otp);
            }
        } else {
            console.log("OTP:", otp);
        }

        res.json({
            success: true,
            message: "OTP sent"
        });
    } catch (err) {
        console.error("OTP Error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/verify-otp", async (req, res) => {
    try {
        const { phone, otp } = req.body;

        const record = await Otp.findOne({ phone, otp });

        if (!record)
            return res.status(400).json({ message: "Invalid OTP" });

        if (record.expiresAt < Date.now())
            return res.status(400).json({ message: "OTP expired" });

        let user = await User.findOne({ phone });

        if (!user) {
            user = await User.create({ phone });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "30d" }
        );

        res.json({
            success: true,
            token,
            user
        });
    } catch (err) {
        console.error("Verify OTP Error:", err);
        res.status(500).json({ message: "Server error" });
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
    passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/google/callback",
    passport.authenticate("google", {
        failureRedirect: process.env.FRONTEND_URL,
        session: true
    }),
    (req, res) => {
        res.redirect(process.env.FRONTEND_URL + "/closekart/");
    }
);

// POST /api/auth/logout
router.post("/logout", (req, res) => {
    res.json({ msg: "Logged out successfully" });
});

module.exports = router;
