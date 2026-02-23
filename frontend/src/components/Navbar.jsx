import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ShoppingCart, Search, Menu, X, User, ChevronDown,
    LogOut, Heart, ShoppingBag, Store, MapPin, ChevronRight
} from 'lucide-react';
import { useUserLocation } from '../context/LocationContext';
import { useAddress } from '../context/AddressContext';
import { useAuth } from '../context/AuthContext';
import AddressSelector from './AddressSelector';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [addrOpen, setAddrOpen] = useState(false);
    const [query, setQuery] = useState('');
    const navigate = useNavigate();

    const { locationName } = useUserLocation();
    const { selectedAddress } = useAddress();
    const { user, logout } = useAuth();

    const dropdownRef = useRef(null);
    const addrRef = useRef(null);

    // Close dropdowns on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setProfileOpen(false);
            if (addrRef.current && !addrRef.current.contains(e.target)) setAddrOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleLogout = () => { logout(); setProfileOpen(false); navigate('/'); };
    const handleSearch = (e) => { e.preventDefault(); if (query.trim()) navigate(`/search?q=${query}`); };

    // Location chip display
    const addrLabel = selectedAddress?.label || null;
    const addrText = selectedAddress
        ? selectedAddress.fullAddress.split(',').slice(0, 2).join(',')
        : locationName;

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">

                    {/* Logo + Address Chip */}
                    <div className="flex items-center gap-3">
                        <Link to="/" className="flex items-center space-x-2 shrink-0">
                            <div className="bg-blue-600 text-white p-1 rounded font-bold text-xl">CK</div>
                            <span className="text-2xl font-bold text-blue-900 tracking-tight hidden sm:inline">CLOSEKART</span>
                        </Link>

                        {/* Address selector chip — desktop */}
                        <div className="relative hidden md:block" ref={addrRef}>
                            <button
                                onClick={() => setAddrOpen(v => !v)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 transition max-w-[220px] group"
                            >
                                <MapPin size={13} className="text-blue-600 shrink-0" />
                                <div className="text-left min-w-0">
                                    {addrLabel && (
                                        <span className="text-xs font-bold text-blue-700 block leading-none">{addrLabel}</span>
                                    )}
                                    <span className="text-xs text-gray-600 truncate block max-w-[150px]">{addrText}</span>
                                </div>
                                <ChevronRight size={12} className={`text-gray-400 shrink-0 transition-transform ${addrOpen ? 'rotate-90' : ''}`} />
                            </button>

                            {/* Address dropdown panel */}
                            {addrOpen && (
                                <div className="absolute top-full left-0 mt-2 z-[100] w-[380px] shadow-2xl rounded-2xl">
                                    <AddressSelector onClose={() => setAddrOpen(false)} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Search Bar — Desktop */}
                    <div className="hidden md:flex flex-1 max-w-xl mx-6">
                        <form onSubmit={handleSearch} className="w-full relative">
                            <input
                                type="text"
                                placeholder="Search for products, shops, or services..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            <button type="submit" className="absolute right-0 top-0 h-full bg-blue-600 text-white px-4 rounded-r-md hover:bg-blue-700 transition-colors">
                                <Search size={20} />
                            </button>
                        </form>
                    </div>

                    {/* Right Icons */}
                    <div className="hidden md:flex items-center space-x-4">
                        {user ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setProfileOpen(!profileOpen)}
                                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                                >
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-2 border-blue-300">
                                        {user.avatar
                                            ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                                            : <User size={16} className="text-blue-600" />
                                        }
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">{user.name || 'User'}</span>
                                    <ChevronDown size={14} className={`text-gray-500 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {profileOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{user.name || 'User'}</p>
                                            <p className="text-xs text-gray-500 truncate">{user.email || user.phone || ''}</p>
                                        </div>

                                        {(user.role === 'swap_keeper' || user.role === 'shopkeeper') && (
                                            <Link to="/swapkeeper/dashboard" onClick={() => setProfileOpen(false)}
                                                className="flex items-center space-x-3 px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 transition">
                                                <Store size={16} /><span>SwapKeeper Dashboard</span>
                                            </Link>
                                        )}
                                        <Link to="/profile" onClick={() => setProfileOpen(false)}
                                            className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition">
                                            <User size={16} /><span>Profile</span>
                                        </Link>
                                        <Link to="/profile" onClick={() => setProfileOpen(false)}
                                            className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition">
                                            <ShoppingBag size={16} /><span>Orders</span>
                                        </Link>
                                        <Link to="/profile" onClick={() => setProfileOpen(false)}
                                            className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition">
                                            <Heart size={16} /><span>Wishlist</span>
                                        </Link>
                                        <div className="border-t border-gray-100 mt-1 pt-1">
                                            <button onClick={handleLogout}
                                                className="flex items-center space-x-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition w-full text-left">
                                                <LogOut size={16} /><span>Logout</span>
                                            </button>
                                        </div>
                                        {/* Founder mini-strip */}
                                        <div className="border-t border-gray-100 mt-2 pt-2 pb-1 text-center px-3">
                                            <p className="text-xs text-gray-500 font-medium">Founder: Akshay Mehta 🇮🇳</p>
                                            <p className="text-xs text-gray-400">CloseKart • Est. 2026</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/login" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 font-medium">
                                <User size={20} /><span>Login</span>
                            </Link>
                        )}
                        <Link to="/cart" className="relative text-gray-700 hover:text-blue-600">
                            <ShoppingCart size={24} />
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">0</span>
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 hover:text-blue-600 focus:outline-none">
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="md:hidden pb-4">
                        <form onSubmit={handleSearch} className="mb-4 relative">
                            <input type="text" placeholder="Search..." value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <button type="submit" className="absolute right-2 top-2 text-gray-500"><Search size={20} /></button>
                        </form>

                        {/* Mobile address chip */}
                        <button
                            onClick={() => { setAddrOpen(v => !v); }}
                            className="w-full flex items-center gap-2 px-3 py-2.5 mb-3 bg-blue-50 border border-blue-200 rounded-xl text-left"
                        >
                            <MapPin size={14} className="text-blue-600 shrink-0" />
                            <div className="min-w-0 flex-1">
                                {addrLabel && <span className="text-xs font-bold text-blue-700 block">{addrLabel}</span>}
                                <span className="text-xs text-gray-600 truncate block">{addrText}</span>
                            </div>
                            <ChevronRight size={13} className="text-gray-400 shrink-0" />
                        </button>

                        {addrOpen && (
                            <div className="mb-3">
                                <AddressSelector onClose={() => { setAddrOpen(false); setIsOpen(false); }} />
                            </div>
                        )}

                        <div className="flex flex-col space-y-2">
                            {user ? (
                                <>
                                    {(user.role === 'swap_keeper' || user.role === 'shopkeeper') && (
                                        <Link to="/swapkeeper/dashboard" onClick={() => setIsOpen(false)}
                                            className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-semibold text-indigo-700 hover:bg-indigo-50">
                                            <Store size={18} /> SwapKeeper Dashboard
                                        </Link>
                                    )}
                                    <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50" onClick={() => setIsOpen(false)}>Profile</Link>
                                    <button onClick={handleLogout} className="text-left w-full block px-3 py-2 rounded-md text-base font-medium text-red-700 hover:bg-gray-50">Logout</button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50" onClick={() => setIsOpen(false)}>Login</Link>
                                    <Link to="/register" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50" onClick={() => setIsOpen(false)}>Register</Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
