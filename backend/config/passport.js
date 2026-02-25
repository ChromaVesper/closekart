const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                if (!profile.emails || profile.emails.length === 0) {
                    return done(new Error("No email found"), null);
                }

                const email = profile.emails[0].value;

                let user = await User.findOne({ email });

                if (!user) {
                    user = await User.create({
                        email: email,
                        name: profile.displayName,
                        provider: "google",
                        googleId: profile.id,
                        avatar: profile.photos?.[0]?.value || "",
                    });
                }

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

module.exports = passport;
