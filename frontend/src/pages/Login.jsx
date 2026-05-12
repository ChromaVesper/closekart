import React, { useState } from "react";
import { auth, db } from "../firebase";
import {
    GoogleAuthProvider, signInWithPopup,
    signInWithEmailAndPassword, createUserWithEmailAndPassword,
    RecaptchaVerifier, signInWithPhoneNumber
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Phone, Lock, Key, ArrowRight, ShoppingBag, Zap, Eye, EyeOff, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login() {
    const navigate = useNavigate();
    const { user, profile, role: contextRole, loading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState("email");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [isSignup, setIsSignup] = useState(false);

    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    React.useEffect(() => {
        if (!authLoading && user && contextRole) {
            if (contextRole === 'seller') navigate('/seller-dashboard', { replace: true });
            else if (contextRole === 'buyer') navigate('/buyer-dashboard', { replace: true });
            else navigate('/account', { replace: true });
        }
    }, [user, contextRole, authLoading, navigate]);

    const redirectUser = (userRole) => {
        if (!userRole) { navigate("/select-role"); return; }
        navigate(userRole === "seller" ? "/seller-dashboard" : "/buyer-dashboard", { replace: true });
    };

    const exchangeFirebaseToken = async (user, userRole) => {
        try {
            const apiRes = await api.post('/auth/firebase-login', { uid: user.uid, email: user.email, name: user.displayName, phone: user.phoneNumber, role: userRole });
            if (apiRes.data.token) localStorage.setItem('token', apiRes.data.token);
        } catch (err) { console.error("Token exchange failed:", err); }
    };

    const saveUserToFirestore = async (user, overrideRole = role) => {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
            await setDoc(userRef, { userId: user.uid, name: user.displayName || 'CloseKart User', email: user.email || '', phone: user.phoneNumber || '', role: overrideRole, status: 'active', createdAt: serverTimestamp() });
            return overrideRole;
        }
        const currentRole = userSnap.data().role || 'buyer';
        if (overrideRole === 'seller' && currentRole === 'buyer') {
            await updateDoc(userRef, { role: 'seller', status: 'active' });
            return 'seller';
        }
        return currentRole;
    };

    const handleGoogleLogin = async (selectedRole) => {
        try { setError(""); setLoading(true);
            const result = await signInWithPopup(auth, new GoogleAuthProvider());
            const userRole = await saveUserToFirestore(result.user, selectedRole);
            await exchangeFirebaseToken(result.user, userRole);
            redirectUser(userRole);
        } catch (e) { setError(e.message); } finally { setLoading(false); }
    };

    const handleEmailAuth = async (e) => {
        e.preventDefault(); setLoading(true); setError("");
        try {
            let userRole = 'buyer';
            if (isSignup) {
                const result = await createUserWithEmailAndPassword(auth, email, password);
                userRole = await saveUserToFirestore(result.user, 'buyer');
                await exchangeFirebaseToken(result.user, userRole);
            } else {
                const result = await signInWithEmailAndPassword(auth, email, password);
                const snap = await getDoc(doc(db, 'users', result.user.uid));
                if (snap.exists()) userRole = snap.data().role || 'buyer';
                await exchangeFirebaseToken(result.user, userRole);
            }
            redirectUser(userRole);
        } catch (e) { setError(e.message); } finally { setLoading(false); }
    };

    const setupRecaptcha = () => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", { size: "invisible" });
        }
    };

    const handleSendOTP = async (e) => {
        e?.preventDefault(); setLoading(true); setError("");
        try {
            setupRecaptcha();
            const formatted = phone.startsWith("+") ? phone : "+91" + phone;
            const conf = await signInWithPhoneNumber(auth, formatted, window.recaptchaVerifier);
            setConfirmationResult(conf); setOtpSent(true);
        } catch (e) { setError(e.message); } finally { setLoading(false); }
    };

    const handleVerifyOTP = async (e) => {
        e?.preventDefault(); setLoading(true); setError("");
        try {
            if (!confirmationResult) return;
            const result = await confirmationResult.confirm(otp);
            const userRole = await saveUserToFirestore(result.user, 'buyer');
            await exchangeFirebaseToken(result.user, userRole);
            redirectUser(userRole);
        } catch { setError("Invalid OTP. Please try again."); } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen relative flex flex-col items-center justify-center py-12 px-4 overflow-hidden">
            {/* Animated mesh background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 -z-10" />
            <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] bg-indigo-400/10 rounded-full blur-3xl -z-10 animate-blob" />
            <div className="absolute bottom-[-10%] right-[-8%] w-[450px] h-[450px] bg-purple-400/10 rounded-full blur-3xl -z-10 animate-blob" style={{ animationDelay: '4s' }} />
            <div className="absolute top-[40%] right-[-5%] w-80 h-80 bg-pink-400/8 rounded-full blur-3xl -z-10 animate-float-slow" />

            {/* Logo + Heading */}
            <motion.div
                initial={{ opacity: 0, y: -24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="text-center mb-8"
            >
                <Link to="/" className="inline-flex items-center gap-2.5 mb-6 group">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-xl shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-300">
                        <Zap size={22} className="text-white fill-white" strokeWidth={0} />
                    </div>
                    <span className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">CloseKart</span>
                </Link>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                    {isSignup ? "Create your account" : "Welcome back"}
                </h1>
                <p className="mt-2 text-sm text-gray-500 font-medium max-w-xs mx-auto">
                    {isSignup ? "Join CloseKart — your hyperlocal marketplace" : "Sign in to access your dashboard"}
                </p>
            </motion.div>

            {/* Card */}
            <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                className="w-full max-w-[420px]"
            >
                <div className="relative bg-white/90 backdrop-blur-2xl rounded-3xl shadow-[0_24px_64px_-16px_rgba(99,102,241,0.18)] border border-white/80 overflow-hidden">
                    {/* Top gradient accent bar */}
                    <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                    <div className="p-7 sm:p-8">

                        {/* Role selector (signup only) */}
                        <AnimatePresence>
                            {isSignup && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mb-6 overflow-hidden"
                                >
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5">Joining as a Buyer</p>
                                    <div className="flex items-center gap-3 p-3.5 rounded-2xl border-2 border-indigo-400 bg-indigo-50/60 shadow-sm">
                                        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-400 to-indigo-600 shadow-md">
                                            <ShoppingBag size={17} className="text-white" />
                                        </div>
                                        <div>
                                            <span className="text-sm font-black text-indigo-700 block">Buyer</span>
                                            <span className="text-[10px] text-gray-400 font-medium">Shop &amp; discover</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Tab switcher */}
                        <div className="flex p-1 bg-gray-100/80 rounded-2xl mb-6">
                            {[
                                { id: 'email', icon: Mail, label: 'Email' },
                                { id: 'phone', icon: Phone, label: 'Phone' },
                            ].map(({ id, icon: Icon, label }) => (
                                <button
                                    key={id}
                                    onClick={() => { setActiveTab(id); setError(""); }}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-xl transition-all duration-250 ${activeTab === id
                                        ? 'bg-white text-indigo-700 shadow-sm border border-gray-200/60'
                                        : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <Icon size={15} /> {label}
                                </button>
                            ))}
                        </div>

                        {/* Error message */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    className="mb-5 flex items-start gap-3 p-3.5 bg-red-50 border border-red-100 rounded-2xl"
                                >
                                    <div className="w-6 h-6 rounded-lg bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                                        <AlertCircle size={13} className="text-red-500" />
                                    </div>
                                    <p className="text-sm text-red-600 font-medium leading-snug">{error}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* ── Email Tab ── */}
                        {activeTab === "email" && (
                            <form onSubmit={handleEmailAuth} className="space-y-4">
                                <FormField label="Email Address" icon={Mail}>
                                    <input
                                        type="email" required autoComplete="email"
                                        placeholder="you@example.com"
                                        value={email} onChange={e => setEmail(e.target.value)}
                                        className="input-field"
                                    />
                                </FormField>

                                <FormField label="Password" icon={Key}>
                                    <div className="relative">
                                        <input
                                            type={showPw ? 'text' : 'password'} required
                                            placeholder="••••••••"
                                            value={password} onChange={e => setPassword(e.target.value)}
                                            className="input-field pr-11"
                                        />
                                        <button type="button" onClick={() => setShowPw(v => !v)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500 transition-colors">
                                            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </FormField>

                                {!isSignup && (
                                    <div className="flex justify-end -mt-1">
                                        <Link to="/forgot-password" className="text-xs font-bold text-indigo-500 hover:text-indigo-700 transition-colors">
                                            Forgot password?
                                        </Link>
                                    </div>
                                )}

                                <GradientButton loading={loading}>
                                    {loading ? "Processing..." : (isSignup ? "Create Account" : "Sign In")}
                                </GradientButton>

                                <p className="text-center text-sm font-semibold text-gray-500">
                                    {isSignup ? "Already have an account? " : "Need an account? "}
                                    <button type="button" onClick={() => { setIsSignup(v => !v); setError(""); }}
                                        className="text-indigo-600 font-black hover:text-indigo-700 transition-colors">
                                        {isSignup ? "Sign In" : "Sign Up"}
                                    </button>
                                </p>
                            </form>
                        )}

                        {/* ── Phone Tab ── */}
                        {activeTab === "phone" && (
                            <div className="space-y-4">
                                <div id="recaptcha-container" />
                                {!otpSent ? (
                                    <form onSubmit={handleSendOTP} className="space-y-4">
                                        <FormField label="Mobile Number" icon={Phone}>
                                            <div className="flex">
                                                <span className="flex items-center px-3.5 bg-gray-50 border border-r-0 border-gray-200 rounded-l-2xl text-sm font-black text-gray-600">+91</span>
                                                <input
                                                    type="text" required maxLength={10}
                                                    placeholder="98765 43210"
                                                    value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                                                    className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-r-2xl text-sm font-bold text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all"
                                                />
                                            </div>
                                        </FormField>
                                        <GradientButton loading={loading} disabled={phone.length < 10}>
                                            {loading ? "Sending..." : "Send OTP"}
                                        </GradientButton>
                                    </form>
                                ) : (
                                    <form onSubmit={handleVerifyOTP} className="space-y-4">
                                        <div className="text-center py-2">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 flex items-center justify-center mx-auto mb-3 shadow-sm">
                                                <Phone size={22} className="text-indigo-500" />
                                            </div>
                                            <p className="text-sm text-gray-500 font-medium">6-digit code sent to</p>
                                            <p className="text-base font-black text-gray-900">+91 {phone}</p>
                                        </div>
                                        <input
                                            type="text" required maxLength={6}
                                            placeholder="Enter 6-digit OTP"
                                            value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                                            className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-center text-2xl font-black tracking-[0.4em] text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 focus:bg-white transition-all"
                                        />
                                        <GradientButton loading={loading} disabled={otp.length !== 6}>
                                            {loading ? "Verifying..." : "Verify & Sign In"}
                                        </GradientButton>
                                        <button type="button" onClick={() => setOtpSent(false)}
                                            className="w-full text-sm text-gray-500 hover:text-indigo-600 font-bold transition-colors">
                                            ← Change number
                                        </button>
                                    </form>
                                )}
                            </div>
                        )}

                        {/* Divider */}
                        <div className="my-6 flex items-center gap-3">
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">or continue with</span>
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                        </div>

                        {/* Google button */}
                        <button
                            onClick={() => handleGoogleLogin('buyer')}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2.5 py-3 px-3 rounded-2xl border border-gray-200 bg-white hover:bg-blue-50/60 hover:border-blue-200 transition-all duration-200 font-bold text-gray-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] group"
                        >
                            <GoogleIcon />
                            <span className="text-xs group-hover:text-blue-700 transition-colors">Continue with Google</span>
                        </button>
                    </div>
                </div>

                {/* Terms */}
                <p className="mt-6 text-center text-xs text-gray-400 font-medium max-w-xs mx-auto leading-relaxed">
                    By continuing, you agree to CloseKart's{' '}
                    <a href="#" className="text-indigo-500 hover:text-indigo-700 font-bold transition-colors">Terms</a>
                    {' & '}
                    <a href="#" className="text-indigo-500 hover:text-indigo-700 font-bold transition-colors">Privacy Policy</a>
                </p>
            </motion.div>
        </div>
    );
}

// ── Helpers ──

function FormField({ label, icon: Icon, children }) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-0.5">{label}</label>
            <div className="relative">
                {Icon && <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />}
                <div className={Icon ? '[&_input]:pl-10 [&_input.input-field]:pl-10' : ''}>
                    {children}
                </div>
            </div>
        </div>
    );
}

function GradientButton({ children, loading, disabled }) {
    return (
        <button
            type="submit"
            disabled={loading || disabled}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white text-sm font-black shadow-lg shadow-indigo-400/30 hover:shadow-xl hover:shadow-indigo-400/40 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none"
        >
            {children}
            {!loading && <ArrowRight size={16} />}
        </button>
    );
}

function GoogleIcon() {
    return (
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
    );
}
