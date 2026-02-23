const crypto = require("crypto");

/**
 * Generate a 6-digit OTP
 */
const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};

/**
 * Send OTP via console log (production: replace with Twilio)
 * To use Twilio, set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER in .env
 */
const sendOTP = async (phone, otp) => {
    // Check if Twilio credentials are configured
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
            return true;
        } catch (error) {
            console.error("Twilio error:", error.message);
            // Fall through to console log
        }
    }

    // Development fallback: log OTP to console
    console.log("=========================================");
    console.log(`OTP for ${phone}: ${otp}`);
    console.log("=========================================");
    return true;
};

module.exports = { generateOTP, sendOTP };
