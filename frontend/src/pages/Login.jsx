import React, { useState } from "react";
import { auth, db } from "../firebase";
import {
    GoogleAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    RecaptchaVerifier,
    signInWithPhoneNumber
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, Lock, ChevronRight, User, Key, ArrowRight, ShoppingBag, Store } from 'lucide-react';

export default function Login() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("email");

    // Email state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSignup, setIsSignup] = useState(false);

    // Role selection state
    const [role, setRole] = useState("buyer"); // 'buyer' or 'seller'

    // Phone state
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [confirmationResult, setConfirmationResult] = useState(null);

    // Loading State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const redirectUser = (userRole) => {
        if (!userRole) {
            navigate("/select-role");
            return;
        }
        localStorage.setItem("userRole", userRole);
        if (userRole === "seller") {
            navigate("/seller-dashboard");
        } else {
            navigate("/buyer-dashboard");
        }
    };

    // Store user data in Firestore
    const saveUserToFirestore = async (user, overrideRole = role) => {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            // For Google Auth without a chosen role, we don't save the document immediately 
            // but return null to trigger redirect to /select-role
            if (!overrideRole) return null;

            const defaultStatus = overrideRole === 'seller' ? 'pending' : 'active';

            await setDoc(userRef, {
                userId: user.uid,
                name: user.displayName || 'CloseKart User',
                email: user.email || '',
                phone: user.phoneNumber || '',
                role: overrideRole,
                status: defaultStatus,
                createdAt: serverTimestamp()
            });
            return overrideRole;
        } else {
            // Document already exists, check if user is intentionally requesting a role override
            const existingData = userSnap.data();
            const currentRole = existingData.role || 'buyer';

            // If an explicit overrideRole is requested through a Google Login Button click, update their document
            if (overrideRole && overrideRole !== currentRole) {
                const updatedStatus = overrideRole === 'seller' ? 'pending' : 'active';
                await updateDoc(userRef, {
                    role: overrideRole,
                    status: updatedStatus
                });
                return overrideRole;
            }

            return currentRole;
        }
    };

    // Google Login
    const handleGoogleLogin = async () => {
        try {
            setError("");
            setLoading(true);
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);

            // Extract intended role from our secure localStorage before sending Google Auth
            const intendedRole = localStorage.getItem('loginRole') || 'buyer';

            // Check / Save user role with explicit intendedRole
            const userRole = await saveUserToFirestore(result.user, intendedRole);
            redirectUser(userRole);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
            localStorage.removeItem('loginRole'); // Cleanup
        }
    };

    // Email Authentication
    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            let userRole = 'buyer';
            if (isSignup) {
                const result = await createUserWithEmailAndPassword(auth, email, password);
                userRole = await saveUserToFirestore(result.user, role);
            } else {
                const result = await signInWithEmailAndPassword(auth, email, password);
                // Fetch role from Firestore directly on login to ensure immediate redirect consistency
                const userRef = doc(db, 'users', result.user.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    userRole = userSnap.data().role || 'buyer';
                }
            }
            redirectUser(userRole);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Initialize Recaptcha
    const setupRecaptcha = () => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(
                auth,
                "recaptcha-container",
                { size: "invisible" }
            );
        }
    };

    // Phone Login - Send OTP
    const handleSendOTP = async (e) => {
        e?.preventDefault();
        setLoading(true);
        setError("");
        try {
            setupRecaptcha();
            const formattedPhone = phone.startsWith("+") ? phone : "+91" + phone;
            const confirmation = await signInWithPhoneNumber(
                auth,
                formattedPhone,
                window.recaptchaVerifier
            );
            setConfirmationResult(confirmation);
            setOtpSent(true);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Phone Login - Verify OTP
    const handleVerifyOTP = async (e) => {
        e?.preventDefault();
        setLoading(true);
        setError("");
        try {
            if (!confirmationResult) return;
            const result = await confirmationResult.confirm(otp);
            const userRole = await saveUserToFirestore(result.user, role);
            redirectUser(userRole);
        } catch (error) {
            setError("Invalid OTP code. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">

            {/* Dynamic Background */}
            <div className="absolute top-0 left-0 w-full h-[40vh] bg-gradient-to-b from-blue-100/60 to-transparent -z-10 pointer-events-none"></div>
            <div className="absolute top-[-5%] left-[-10%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[80px] -z-10 animate-float opacity-70"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-400/10 rounded-full blur-[100px] -z-10 animate-float opacity-70" style={{ animationDelay: '2s' }}></div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
                <div className="inline-block bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-3 rounded-2xl font-black text-3xl shadow-xl mb-6 transform -rotate-3 hover:rotate-0 transition-transform duration-300">CK</div>
                <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                    {isSignup ? "Create an account" : "Welcome back"}
                </h2>
                <p className="mt-3 text-sm font-medium text-gray-500 max-w-xs mx-auto">
                    {isSignup ? "Join CloseKart today as a Buyer or Seller." : "Sign in to access your CloseKart dashboard and features."}
                </p>
            </div>

            <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-[420px] relative z-10 animate-[fadeIn_0.4s_ease-out]">
                <div className="glass-card py-10 px-6 sm:px-10 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white relative overflow-hidden">

                    {/* Decorative Top Accent */}
                    <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

                    {/* Role Selector during Signup */}
                    {isSignup && (
                        <div className="mb-6 animate-[fadeIn_0.3s]">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 mb-2">Account Type</label>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setRole('buyer')}
                                    className={`flex-1 p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${role === 'buyer'
                                        ? 'border-blue-600 bg-blue-50/50 text-blue-700 shadow-sm'
                                        : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
                                        }`}
                                >
                                    <ShoppingBag size={20} className={role === 'buyer' ? 'text-blue-600' : 'text-gray-400'} />
                                    <span className="text-sm font-bold">Buyer</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('seller')}
                                    className={`flex-1 p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${role === 'seller'
                                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-sm'
                                        : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
                                        }`}
                                >
                                    <Store size={20} className={role === 'seller' ? 'text-indigo-600' : 'text-gray-400'} />
                                    <span className="text-sm font-bold">Seller</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Styled Tabs (Segmented Control) */}
                    <div className="flex bg-gray-100/80 p-1.5 rounded-2xl mb-8">
                        <button
                            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === "email"
                                ? "bg-white text-blue-700 shadow-sm border border-gray-200"
                                : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                                }`}
                            onClick={() => { setActiveTab("email"); setError(""); }}
                        >
                            <Mail size={16} /> Email
                        </button>
                        <button
                            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === "phone"
                                ? "bg-white text-indigo-700 shadow-sm border border-gray-200"
                                : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                                }`}
                            onClick={() => { setActiveTab("phone"); setError(""); }}
                        >
                            <Phone size={16} /> Phone
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium flex items-center gap-3 animate-[fadeIn_0.3s]">
                            <div className="p-1 bg-red-100 rounded-full shrink-0"><Lock size={14} className="text-red-600" /></div>
                            {error}
                        </div>
                    )}

                    {/* Email Tab */}
                    {activeTab === "email" && (
                        <form onSubmit={handleEmailAuth} className="space-y-5 animate-[fadeIn_0.3s]">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email Address</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        required
                                        className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-gray-900 font-medium placeholder-gray-400"
                                        placeholder="you@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Password</label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        required
                                        className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-gray-900 font-medium placeholder-gray-400 font-mono tracking-widest"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-full shadow-lg text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all hover:-translate-y-0.5 mt-2 disabled:opacity-70 disabled:hover:translate-y-0"
                            >
                                {loading ? "Processing..." : (isSignup ? "Create Account" : "Sign In via Email")}
                                {!loading && <ArrowRight size={18} />}
                            </button>

                            <div className="mt-4 text-center">
                                <button
                                    type="button"
                                    onClick={() => setIsSignup(!isSignup)}
                                    className="text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors"
                                >
                                    {isSignup ? "Already have an account? Sign In" : "Need an account? Sign Up"}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Phone Tab */}
                    {activeTab === "phone" && (
                        <div className="space-y-5 animate-[fadeIn_0.3s]">
                            <div id="recaptcha-container"></div>

                            {!otpSent ? (
                                <form onSubmit={handleSendOTP} className="space-y-5">
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Mobile Number</label>
                                        <div className="relative flex">
                                            <span className="inline-flex items-center px-4 rounded-l-2xl border border-r-0 border-gray-200 bg-gray-50 text-gray-500 font-bold border-r pr-3">
                                                +91
                                            </span>
                                            <input
                                                type="text"
                                                required
                                                className="flex-1 w-full pl-4 pr-4 py-3.5 bg-white border border-gray-200 rounded-r-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-gray-900 font-bold tracking-wide placeholder-gray-400"
                                                placeholder="98765 43210"
                                                value={phone}
                                                maxLength={10}
                                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading || phone.length < 10}
                                        className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-full shadow-lg text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 transition-all hover:-translate-y-0.5 mt-2 disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none"
                                    >
                                        {loading ? "Sending OTP..." : "Continue with Mobile"}
                                        {!loading && <ArrowRight size={18} />}
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleVerifyOTP} className="space-y-5">
                                    <div className="text-center mb-6">
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 mb-3">
                                            <Phone size={24} />
                                        </div>
                                        <p className="text-sm text-gray-600 font-medium">We sent a 6-digit code to</p>
                                        <p className="text-base font-bold text-gray-900">+91 {phone}</p>
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                required
                                                className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-gray-900 font-mono font-bold text-2xl tracking-[0.5em] text-center"
                                                placeholder="••••••"
                                                maxLength="6"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || otp.length !== 6}
                                        className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-full shadow-lg text-sm font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-4 focus:ring-green-500/30 transition-all hover:-translate-y-0.5 mt-2 disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none"
                                    >
                                        {loading ? "Verifying..." : "Secure Login"}
                                    </button>

                                    <div className="mt-4 text-center">
                                        <button
                                            type="button"
                                            onClick={() => setOtpSent(false)}
                                            className="text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors"
                                        >
                                            Change mobile number
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}

                    {/* Divider */}
                    <div className="mt-8 mb-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-400 font-medium text-xs tracking-wider uppercase">Or continue with Google</span>
                            </div>
                        </div>
                    </div>

                    {/* Google OAuth Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pb-2">
                        <button
                            onClick={() => {
                                localStorage.setItem("loginRole", "buyer");
                                handleGoogleLogin();
                            }}
                            className="flex-1 flex justify-center items-center gap-3 py-4 px-3 border border-gray-200 rounded-2xl shadow-sm bg-white hover:bg-blue-50 hover:border-blue-300 transition-all font-bold text-gray-700 focus:ring-4 focus:ring-blue-100 group active:scale-[0.98]"
                        >
                            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            <span className="text-sm group-hover:text-blue-700 transition-colors">Continue as Buyer with Google</span>
                        </button>
                        <button
                            onClick={() => {
                                localStorage.setItem("loginRole", "seller");
                                handleGoogleLogin();
                            }}
                            className="flex-1 flex justify-center items-center gap-3 py-4 px-3 border border-gray-200 rounded-2xl shadow-sm bg-white hover:bg-indigo-50 hover:border-indigo-300 transition-all font-bold text-gray-700 focus:ring-4 focus:ring-indigo-100 group active:scale-[0.98]"
                        >
                            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            <span className="text-sm group-hover:text-indigo-700 transition-colors">Continue as Seller with Google</span>
                        </button>
                    </div>

                </div>

                {/* Footer text */}
                <p className="mt-8 text-center text-xs font-medium text-gray-400 max-w-xs mx-auto">
                    By confirming, you agree to CloseKart's <a href="#" className="underline hover:text-gray-600 focus:outline-none">Terms of Service</a> & <a href="#" className="underline hover:text-gray-600 focus:outline-none">Privacy Policy</a>.
                </p>
            </div>
        </div>
    );
}
