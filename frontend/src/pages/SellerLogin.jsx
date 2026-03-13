import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Store, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';

export default function SellerLogin() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Handle Seller Authentication
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Check if user is mapped correctly in our central `users` registry
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const existingData = userSnap.data();
                if (existingData.role !== 'seller') {
                    // Update role to seller when specifically using this portal
                    await setDoc(userRef, {
                        role: 'seller',
                        status: 'pending'
                    }, { merge: true });
                }
                navigate('/seller-dashboard');
            } else {
                await setDoc(userRef, {
                    userId: user.uid,
                    name: user.displayName || 'Seller',
                    email: user.email,
                    phone: '',
                    role: 'seller',
                    status: 'pending',
                    createdAt: serverTimestamp()
                });
                navigate('/seller-dashboard');
            }
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to sign in. Check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);
        const provider = new GoogleAuthProvider();

        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                await setDoc(userRef, {
                    userId: user.uid,
                    name: user.displayName || 'CloseKart Seller',
                    email: user.email || '',
                    phone: user.phoneNumber || '',
                    role: 'seller',
                    status: 'pending',
                    createdAt: serverTimestamp()
                });
            } else {
                const existingData = userSnap.data();
                if (existingData.role !== 'seller') {
                    // Update user.role to 'seller' and set status to 'pending'
                    await setDoc(userRef, {
                        role: 'seller',
                        status: 'pending'
                    }, { merge: true });
                }
            }
            navigate('/seller-dashboard');
        } catch (err) {
            console.error(err);
            setError('Google sign-in failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] relative flex items-center justify-center p-4">

            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-[40vh] bg-gradient-to-b from-blue-100/60 to-transparent -z-10 pointer-events-none"></div>
            <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-400/20 rounded-full blur-3xl -z-10 animate-float"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl -z-10 animate-float" style={{ animationDelay: '2s' }}></div>

            <div className="glass-effect rounded-3xl w-full max-w-md p-8 relative overflow-hidden shadow-2xl border border-white/60">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-600 rounded-[1.2rem] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30 transform transition-transform hover:scale-105">
                        <Store size={32} className="text-white" strokeWidth={2.5} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Seller Central</h2>
                    <p className="text-gray-500 mt-2 text-sm font-medium">Manage your store, products, and sales</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-100 rounded-xl flex items-start gap-3">
                        <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                        <p className="text-sm text-red-600 font-medium">{error}</p>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Email Address</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail size={18} className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-11 pr-4 py-3.5 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                placeholder="seller@example.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Password</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock size={18} className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-11 pr-4 py-3.5 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-600/20 disabled:opacity-70 flex items-center justify-center mt-2 group"
                    >
                        {loading ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <span>Access Dashboard</span>
                        )}
                    </button>
                </form>

                <div className="mt-8 relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white/80 text-gray-500 font-medium rounded-full">Or continue with</span>
                    </div>
                </div>

                <div className="mt-6">
                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white/80 hover:bg-white border border-gray-200 rounded-xl font-bold text-sm text-gray-700 transition-all shadow-sm hover:shadow-md disabled:opacity-70"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Google
                    </button>
                </div>
            </div>
        </div>
    );
}
