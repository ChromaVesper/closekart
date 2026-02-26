const admin = require("firebase-admin");

try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });

    console.log("Firebase Admin initialized successfully");
} catch (error) {
    console.error("Firebase Admin initialization failed. Ensure FIREBASE_SERVICE_ACCOUNT is set in Render.");
    console.error(error.message);
}

module.exports = admin;
