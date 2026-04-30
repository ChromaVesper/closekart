import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ShoppingCart, Search, Menu, X, User, ChevronDown,
    LogOut, Heart, ShoppingBag, Store, MapPin, ChevronRight
} from 'lucide-react';
import { useUserLocation } from '../context/LocationContext';
import AddressModal from './AddressModal';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [addrOpen, setAddrOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();

    const { locationName } = useUserLocation();
    const { user, profile, logout } = useAuth();

    const dropdownRef = useRef(null);
    const addrRef = useRef(null);

    // Scroll effect for glassy nav
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdowns on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setProfileOpen(false);
            if (addrRef.current && !addrRef.current.contains(e.target)) setAddrOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleSearch = (e) => { e.preventDefault(); if (query.trim()) navigate(`/search?q=${query}`); };

    const handleProfileClick = () => {
        if (!user) {
            navigate("/login");
        } else {
            navigate("/account");
        }
    };

    // Location chip display
    const addrText = locationName || "Select Location";

    return (
        <nav className={`fixed w-full top-0 z-50 transition-all duration-500 ${scrolled ? 'glass-effect py-2 premium-shadow' : 'bg-transparent py-4'}`}>
            <div className="container mx-auto px-4 lg:px-8 transition-all duration-300">
                <div className="flex justify-between items-center h-14">

                    {/* Logo + Address Chip */}
                    <div className="flex items-center gap-4">
                        <Link to="/" className="flex items-center space-x-2 shrink-0 group">
                            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-1.5 rounded-xl font-black text-xl shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all">CK</div>
                            <span className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-900 to-indigo-800 tracking-tight hidden sm:inline">CLOSEKART</span>
                        </Link>

                        {/* Address selector chip — desktop */}
                        <div className="relative hidden md:block" ref={addrRef}>
                            <button
                                onClick={() => setAddrOpen(v => !v)}
                                className="flex items-center gap-2 px-3.5 py-2 rounded-2xl border border-blue-100 bg-blue-50/50 hover:bg-blue-100/50 hover:border-blue-200 transition-all max-w-[240px] group"
                            >
                                <div className="p-1 bg-white rounded-full shadow-sm">
                                    <MapPin size={14} className="text-blue-600 shrink-0" />
                                </div>
                                <div className="text-left min-w-0">
                                    <span className="text-xs font-bold text-blue-800 block leading-none mb-0.5">Deliver to:</span>
                                    <span className="text-xs text-gray-600 truncate block max-w-[150px] font-medium">{addrText}</span>
                                </div>
                                <ChevronRight size={14} className={`text-gray-400 shrink-0 transition-transform duration-300 ${addrOpen ? 'rotate-90' : ''}`} />
                            </button>
                        </div>
                    </div>

                    {/* Search Bar — Desktop */}
                    <div className="hidden md:flex flex-1 max-w-xl mx-8">
                        <form onSubmit={handleSearch} className="w-full relative group">
                            <input
                                type="text"
                                placeholder="Search products, shops, or brands..."
                                className="w-full pl-6 pr-14 py-3 bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:bg-white text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 flex items-center justify-center bg-brand-primary text-white rounded-full hover:bg-brand-accent hover:scale-105 transition-all duration-300 shadow-md">
                                <Search size={18} strokeWidth={2.5} />
                            </button>
                        </form>
                    </div>

                    {/* Right Icons */}
                    <div className="hidden md:flex items-center space-x-6">
                        <div className="relative" ref={dropdownRef}>
                            <button onClick={() => { if(!user) navigate('/login'); else setProfileOpen(!profileOpen); }} className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 font-medium rounded-full hover:bg-blue-50/50 py-1.5 px-2.5 transition-all border border-transparent hover:border-blue-100 group">
                                {profile?.avatar || user?.photoURL ? (
                                    <img src={profile?.avatar || user?.photoURL} alt="User" className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm group-hover:scale-105 transition-transform" />
                                ) : (
                                    <div className="p-2 bg-gray-100/80 rounded-full text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                        <User size={18} />
                                    </div>
                                )}
                                <span className="text-sm font-bold max-w-[120px] truncate">{user ? (profile?.name?.split(' ')[0] || user?.displayName?.split(' ')[0] || "Profile") : "Sign In"}</span>
                                {user && <ChevronDown size={14} className={`text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />}
                            </button>
                            
                            {profileOpen && user && (
                                <div className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 py-2 flex flex-col z-50 overflow-hidden animate-[fadeIn_0.2s_ease-out]">
                                    <div className="px-4 py-3 border-b border-gray-100/50 mb-1 bg-gray-50/50">
                                        <p className="text-sm font-bold text-gray-900 truncate">{profile?.name || user?.displayName || "User"}</p>
                                        <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email}</p>
                                    </div>
                                    <Link to="/account" onClick={() => setProfileOpen(false)} className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 flex items-center gap-3 transition-colors">
                                        <User size={16} /> My Account
                                    </Link>
                                    <Link to="/orders" onClick={() => setProfileOpen(false)} className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 flex items-center gap-3 transition-colors">
                                        <ShoppingBag size={16} /> Orders
                                    </Link>
                                    <Link to="/wishlist" onClick={() => setProfileOpen(false)} className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 flex items-center gap-3 transition-colors">
                                        <Heart size={16} /> Wishlist
                                    </Link>
                                    <div className="h-px bg-gray-100 my-1"></div>
                                    <button onClick={() => { logout(); setProfileOpen(false); navigate('/'); }} className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors">
                                        <LogOut size={16} /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                        <Link to="/cart" className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors group">
                            <ShoppingCart size={24} className="group-hover:scale-110 transition-transform" />
                            <span className="absolute max-w-none text-center top-0 right-0 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-black rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center shadow-md border-2 border-white transform translate-x-1/4 -translate-y-1/4">0</span>
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-4">
                        <Link to="/cart" className="relative p-1 text-gray-600">
                            <ShoppingCart size={24} />
                            <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-black rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center border-2 border-white transform translate-x-1/4 -translate-y-1/4">0</span>
                        </Link>
                        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 hover:text-blue-600 p-1 bg-gray-50 rounded-lg">
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="md:hidden pt-4 pb-6 animate-[fadeIn_0.2s_ease-out]">
                        <form onSubmit={handleSearch} className="mb-4 relative">
                            <input type="text" placeholder="Search products..." value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-medium" />
                            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"><Search size={18} /></button>
                        </form>

                        {/* Mobile address chip */}
                        <button
                            onClick={() => { setAddrOpen(v => !v); }}
                            className="w-full flex items-center gap-3 px-4 py-3 mb-4 bg-blue-50/50 border border-blue-100 rounded-2xl text-left hover:bg-blue-50 transition-colors"
                        >
                            <div className="p-1.5 bg-white rounded-full shadow-sm">
                                <MapPin size={16} className="text-blue-600 shrink-0" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <span className="text-sm font-bold text-blue-800 block">Deliver to:</span>
                                <span className="text-xs text-gray-600 truncate block font-medium mt-0.5">{addrText}</span>
                            </div>
                            <ChevronRight size={16} className={`text-gray-400 shrink-0 transition-transform ${addrOpen ? 'rotate-90' : ''}`} />
                        </button>

                        <div className="flex flex-col space-y-1 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                            <button onClick={handleProfileClick} className="flex items-center gap-3 text-left w-full px-4 py-3 rounded-xl text-sm font-bold text-gray-800 hover:bg-white hover:text-blue-600 hover:shadow-sm transition-all">
                                <User size={18} />
                                {user ? "My Account" : "Sign In / Register"}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Address Modal placed globally */}
            <AddressModal isOpen={addrOpen} onClose={() => setAddrOpen(false)} />
        </nav>
    );
};

export default Navbar;
