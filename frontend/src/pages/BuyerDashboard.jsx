import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { ShoppingBag, Heart, MapPin, User, Settings, HelpCircle, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

export default function BuyerDashboard() {
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('orders');

    // Stats or dummy data for UI completeness
    const [stats, setStats] = useState({ orders: 0, wishlist: 0 });

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20 md:pb-0">
            {/* Header Area */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white pb-24 pt-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md p-1 border-2 border-white/40 shadow-xl flex items-center justify-center overflow-hidden">
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <User size={40} className="text-white" />
                        )}
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">{profile?.name || user?.displayName || 'Customer'}</h1>
                        <p className="text-blue-100 font-medium">{profile?.email || user?.email}</p>
                        <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-xs font-bold tracking-wider uppercase">Buyer Account</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
                <div className="flex flex-col md:flex-row gap-6">

                    {/* Sidebar Nav */}
                    <div className="w-full md:w-72 shrink-0 space-y-2">
                        <div className="bg-white rounded-3xl p-4 shadow-xl shadow-blue-900/5 border border-white/60">
                            {[
                                { id: 'orders', icon: ShoppingBag, label: 'Recent Orders' },
                                { id: 'wishlist', icon: Heart, label: 'Wishlist' },
                                { id: 'addresses', icon: MapPin, label: 'Saved Addresses' },
                                { id: 'settings', icon: Settings, label: 'Account Settings' },
                                { id: 'help', icon: HelpCircle, label: 'Help Center' }
                            ].map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm ${activeTab === item.id
                                            ? 'bg-blue-50 text-blue-700 shadow-sm'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <item.icon size={18} className={activeTab === item.id ? 'text-blue-600' : 'text-gray-400'} />
                                    {item.label}
                                </button>
                            ))}

                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-red-600 hover:bg-red-50 transition-all font-bold text-sm">
                                    <LogOut size={18} /> Sign Out
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-900/5 border border-white/60 min-h-[400px]">

                        <h2 className="text-2xl font-black text-gray-900 capitalize mb-6">{activeTab.replace('-', ' ')}</h2>

                        {activeTab === 'orders' && (
                            <div className="text-center py-16">
                                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <ShoppingBag size={32} className="text-blue-400" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">No orders yet</h3>
                                <p className="text-gray-500 mt-1 max-w-sm mx-auto">When you buy products on CloseKart, your orders will appear here.</p>
                                <button onClick={() => navigate('/')} className="mt-6 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">Start Shopping</button>
                            </div>
                        )}

                        {activeTab === 'wishlist' && (
                            <div className="text-center py-16">
                                <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Heart size={32} className="text-pink-400" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Your wishlist is empty</h3>
                                <p className="text-gray-500 mt-1 max-w-sm mx-auto">Save items you like and they will show up here for later.</p>
                            </div>
                        )}

                        {['addresses', 'settings', 'help'].includes(activeTab) && (
                            <div className="text-center py-16 text-gray-500 font-medium">
                                Settings and configuration for {activeTab} will be available here soon.
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
