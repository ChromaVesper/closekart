const GoogleStrategy = require("passport-google-oauth20").Strategy;

module.exports = function (passport) {
    passport.use(
        new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL
        }, async (accessToken, refreshToken, profile, done) => {
            return done(null, profile);
        })
    );

    // Provide basic serialize/deserialize to satisfy passport session requirements if needed
    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((obj, done) => {
        done(null, obj);
    });
};
