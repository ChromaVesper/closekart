import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { Search, User, MapPin, ChevronDown, Bell, Zap } from 'lucide-react';
import { useUserLocation } from '../context/LocationContext';
import { useAddress } from '../context/AddressContext';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Heart, ShoppingBag, ShoppingCart, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';

// Lazy-load AddressSelector — it pulls in Leaflet, keep it out of the main bundle
const AddressSelector = lazy(() => import('./AddressSelector'));

const Header = () => {
    const { locationName } = useUserLocation();
    const { selectedAddress } = useAddress();
    const { user, profile } = useAuth();
    const [profileOpen, setProfileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 12);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            localStorage.removeItem('userRole');
            setProfileOpen(false);
            navigate('/', { replace: true });
        } catch (error) {
            console.error('Logout Error:', error);
        }
    };

    let displayName = 'Mithapur';
    if (selectedAddress) {
        displayName = selectedAddress.label || selectedAddress.fullAddress?.split(',')[0];
    } else if (locationName && locationName !== 'Detected location') {
        displayName = locationName;
    }

    const isSeller = false; // buyer-only platform

    return (
        <>
        <motion.header
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className={`sticky top-0 z-50 transition-all duration-500 ${
                scrolled
                    ? 'glass-effect shadow-[0_8px_32px_-8px_rgba(99,102,241,0.12)]'
                    : 'bg-white/70 backdrop-blur-xl border-b border-white/50'
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

                {/* Logo + Location */}
                <div className="flex items-center gap-4 sm:gap-5 shrink-0">
                    <Link to="/" className="flex items-center gap-2.5 group">
                        {/* Logo mark */}
                        <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 group-hover:shadow-indigo-500/50 transition-all duration-300">
                            <Zap size={18} className="text-white fill-white" strokeWidth={0} />
                            <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <span className="hidden sm:block text-xl font-black tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                            CloseKart
                        </span>
                    </Link>

                    {/* Location chip — desktop */}
                    <button
                        onClick={() => setShowAddressModal(true)}
                        className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-50/80 hover:bg-indigo-100/80 border border-indigo-100/80 hover:border-indigo-200 transition-all duration-200 group max-w-[200px]"
                    >
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-sm shrink-0">
                            <MapPin size={12} className="text-white" />
                        </div>
                        <div className="text-left min-w-0">
                            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block leading-none mb-0.5">
                                {selectedAddress ? selectedAddress.label : 'Delivery to'}
                            </span>
                            <span className="text-xs font-semibold text-gray-700 truncate block max-w-[130px] leading-none">
                                {displayName}
                            </span>
                        </div>
                        <ChevronDown size={13} className="text-indigo-400 shrink-0 group-hover:rotate-180 transition-transform duration-300" />
                    </button>
                </div>

                {/* Search — Desktop */}
                <div className="hidden md:flex flex-1 max-w-2xl mx-4">
                    <div
                        onClick={() => navigate('/search', { replace: false })}
                        className="relative w-full cursor-pointer group"
                    >
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
                        <div className="relative flex items-center w-full bg-gray-50/90 hover:bg-white border border-gray-200/80 hover:border-indigo-200 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-indigo-100/50 px-4 py-2.5 gap-3">
                            <Search size={16} className="text-gray-400 group-hover:text-indigo-500 transition-colors shrink-0" />
                            <span className="text-sm text-gray-400 font-medium flex-1 select-none">
                                Search products, brands and categories...
                            </span>
                            <kbd className="hidden lg:flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded-lg text-[10px] font-bold text-gray-400 shadow-sm">
                                ⌘K
                            </kbd>
                        </div>
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 shrink-0">
                    {/* Mobile Search */}
                    <button
                        onClick={() => navigate('/search', { replace: false })}
                        className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-indigo-50 text-gray-500 hover:text-indigo-600 border border-gray-200/80 hover:border-indigo-200 transition-all duration-200 tap-scale"
                    >
                        <Search size={18} />
                    </button>

                    {/* Cart */}
                    <Link
                        to="/cart"
                        className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-indigo-50 text-gray-500 hover:text-indigo-600 border border-gray-200/80 hover:border-indigo-200 transition-all duration-200 tap-scale"
                    >
                        <ShoppingCart size={18} />
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md border-2 border-white">
                            0
                        </span>
                    </Link>

                    {/* Profile */}
                    {user ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setProfileOpen(!profileOpen)}
                                className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl bg-gray-50 hover:bg-indigo-50 border border-gray-200/80 hover:border-indigo-200 transition-all duration-200 tap-scale"
                            >
                                <div className="relative w-7 h-7 rounded-full overflow-hidden border-2 border-indigo-200 shadow-sm">
                                    {user.photoURL ? (
                                        <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                                            <span className="text-white text-xs font-black">
                                                {(profile?.name || user.displayName || 'U')[0].toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />
                                </div>
                                <div className="hidden sm:flex flex-col items-start leading-none">
                                    <span className="text-xs font-bold text-gray-800 max-w-[90px] truncate">
                                        {(profile?.name || user.displayName || 'Account').split(' ')[0]}
                                    </span>
                                    <span className="text-[10px] font-semibold text-emerald-500 mt-0.5">
                                        Buyer
                                    </span>
                                </div>
                                <ChevronDown
                                    size={13}
                                    className={`hidden sm:block text-gray-400 transition-transform duration-300 ${profileOpen ? 'rotate-180' : ''}`}
                                />
                            </button>

                            <AnimatePresence>
                                {profileOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.93, y: 8 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.93, y: 8 }}
                                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                        className="absolute right-0 mt-2 w-64 glass rounded-2xl shadow-[0_20px_60px_-10px_rgba(99,102,241,0.2)] border border-white/70 py-2 z-[100] overflow-hidden"
                                    >
                                        {/* Profile Header */}
                                        <div className="px-4 py-3.5 border-b border-gray-100/60 mb-1">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-indigo-100 shadow-sm shrink-0">
                                                    {user.photoURL ? (
                                                        <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                                                            <span className="text-white font-black text-sm">
                                                                {(profile?.name || user.displayName || 'U')[0].toUpperCase()}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-black text-gray-900 truncate">{profile?.name || user.displayName || 'User'}</p>
                                                    <p className="text-xs text-gray-500 font-medium truncate mt-0.5">{user.email}</p>
                                                    <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                                                        ✓ Buyer Account
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Menu Items */}
                                        <div className="px-2 space-y-0.5">
                                            <DropItem icon={ShoppingBag} label="My Orders" to="/orders" onClick={() => setProfileOpen(false)} />
                                            <DropItem icon={Heart} label="My Wishlist" to="/wishlist" onClick={() => setProfileOpen(false)} />
                                            <DropItem icon={Settings} label="Account Settings" to="/account" onClick={() => setProfileOpen(false)} />
                                        </div>

                                        {/* Logout */}
                                        <div className="border-t border-gray-100/60 mt-2 pt-2 px-2">
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50/80 hover:text-red-600 transition-all duration-200"
                                            >
                                                <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
                                                    <LogOut size={14} />
                                                </div>
                                                Sign out
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white text-sm font-bold shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/35 hover:-translate-y-0.5 transition-all duration-200 tap-scale"
                        >
                            <User size={15} />
                            <span className="hidden sm:block">Sign In</span>
                        </Link>
                    )}
                </div>
            </div>

            {/* Mobile Location Strip */}
            <div
                className="sm:hidden px-4 py-2 border-t border-gray-100/60 bg-white/60 backdrop-blur-sm flex items-center justify-between cursor-pointer active:bg-indigo-50/50 transition-colors"
                onClick={() => setShowAddressModal(true)}
            >
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                        <MapPin size={10} className="text-white" />
                    </div>
                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
                        {selectedAddress ? selectedAddress.label : 'Delivery to'}
                    </span>
                    <span className="text-xs text-gray-700 font-semibold truncate max-w-[160px]">
                        {displayName}
                    </span>
                </div>
                <ChevronDown size={13} className="text-gray-400 shrink-0" />
            </div>
        </motion.header>

        {/* ── Address Selector Modal ─────────────────────────────────────────── */}
        <AnimatePresence>
            {showAddressModal && (
                <motion.div
                    key="address-modal-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4"
                    style={{ background: 'rgba(15,15,35,0.45)', backdropFilter: 'blur(4px)' }}
                    onClick={(e) => { if (e.target === e.currentTarget) setShowAddressModal(false); }}
                >
                    <motion.div
                        key="address-modal-panel"
                        initial={{ opacity: 0, y: 40, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 40, scale: 0.97 }}
                        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Suspense fallback={
                            <div className="flex items-center justify-center h-48 text-gray-400">
                                <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                            </div>
                        }>
                            <AddressSelector onClose={() => setShowAddressModal(false)} />
                        </Suspense>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
        </>
    );
};

// Reusable dropdown item
const DropItem = ({ icon: Icon, label, to, onClick, gradient }) => (
    <Link
        to={to}
        onClick={onClick}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50/80 transition-all duration-150 group"
    >
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${gradient ? `bg-gradient-to-br ${gradient}` : 'bg-gray-100'} shrink-0 group-hover:scale-110 transition-transform duration-200`}>
            <Icon size={14} className={gradient ? 'text-white' : 'text-gray-600'} />
        </div>
        <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">{label}</span>
    </Link>
);

export default Header;
