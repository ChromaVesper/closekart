import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBoxZUkzf0NebX8Xf9KANWLLY9qexGXfCo",
    authDomain: "closekart-8f6b0.firebaseapp.com",
    projectId: "closekart-8f6b0",
    storageBucket: "closekart-8f6b0.firebasestorage.app",
    messagingSenderId: "29503582787",
    appId: "1:29503582787:web:720c9b9059ba5b011e9af6",
    measurementId: "G-VSZDRBBB4W"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(
            auth,
            "recaptcha-container",
            {
                size: "invisible"
            }
        );
    }
};
