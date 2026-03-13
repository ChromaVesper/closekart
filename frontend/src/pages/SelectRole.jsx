import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Store, ArrowRight, Loader2 } from 'lucide-react';

export default function SelectRole() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);

    // Make sure we have a logged-in user who just hasn't chosen a role yet
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                navigate('/login');
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const handleSelectRole = async (role) => {
        if (!user) return;
        setLoading(true);
        try {
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, {
                userId: user.uid,
                name: user.displayName || 'CloseKart User',
                email: user.email || '',
                phone: user.phoneNumber || '',
                role: role,
                createdAt: serverTimestamp()
            });

            // Store Role Locally
            localStorage.setItem("userRole", role);

            // Redirect After Save
            if (role === 'seller') {
                navigate("/seller-dashboard");
            } else {
                navigate("/buyer-dashboard");
            }
        } catch (error) {
            console.error("Error saving role:", error);
            alert("Something went wrong. Please try again.");
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute top-0 left-0 w-full h-[30vh] bg-gradient-to-b from-indigo-100/60 to-transparent -z-10 pointer-events-none"></div>

            <div className="sm:mx-auto sm:w-full sm:max-w-2xl relative z-10 text-center animate-[fadeIn_0.3s_ease-out]">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-6">
                    <img src={user.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'} alt="Profile" className="w-18 h-18 rounded-full" />
                </div>
                <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                    Choose how you want to use CloseKart
                </h2>
                <p className="mt-4 text-base font-medium text-gray-500 max-w-lg mx-auto">
                    Hi {user.displayName?.split(' ')[0] || 'there'}! Tell us what you plan to do so we can set up your dashboard correctly.
                </p>

                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 px-4">

                    {/* Buyer Card */}
                    <button
                        onClick={() => handleSelectRole('buyer')}
                        disabled={loading}
                        className="group relative bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_60px_-15px_rgba(37,99,235,0.2)] hover:border-blue-200 transition-all text-left flex flex-col h-full focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:opacity-50"
                    >
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <ShoppingBag size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2">Buyer</h3>
                        <p className="text-gray-500 font-medium mb-8">Shop products near you, discover great local deals, and manage your orders seamlessly.</p>

                        <div className="mt-auto flex items-center text-blue-600 font-bold group-hover:gap-2 transition-all">
                            Continue as Buyer <ArrowRight size={18} className="ml-1" />
                        </div>
                    </button>

                    {/* Seller Card */}
                    <button
                        onClick={() => handleSelectRole('seller')}
                        disabled={loading}
                        className="group relative bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_60px_-15px_rgba(79,70,229,0.2)] hover:border-indigo-200 transition-all text-left flex flex-col h-full focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:opacity-50"
                    >
                        <div className="absolute top-6 right-6 px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm">
                            Grow Business
                        </div>
                        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Store size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2">Seller</h3>
                        <p className="text-gray-500 font-medium mb-8">Sell products, manage your store, track revenue, and reach more local customers directly.</p>

                        <div className="mt-auto flex items-center text-indigo-600 font-bold group-hover:gap-2 transition-all">
                            Continue as Seller <ArrowRight size={18} className="ml-1" />
                        </div>
                    </button>

                </div>
            </div>
        </div>
    );
}
