const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

module.exports = function (passport) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL || "https://closekart.onrender.com/api/auth/google/callback",
            },
            async (accessToken, refreshToken, profile, done) => {
                console.log("PASSPORT CALLBACK URL BEING USED:");
                console.log(process.env.GOOGLE_CALLBACK_URL || "https://closekart.onrender.com/api/auth/google/callback");

                try {
                    console.log("Google login for:", profile.emails[0].value);
                    // Passing profile directly as requested for debugging/verification
                    return done(null, profile);
                } catch (error) {
                    return done(error, null);
                }
            }
        )
    );
};
