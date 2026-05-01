import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

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
setPersistence(auth, browserLocalPersistence).catch(console.error);

export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
