import React from 'react';
import { Home, Compass, PlaySquare, User, ShoppingCart, Heart, HelpCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const mainItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/explore', icon: Compass, label: 'Explore' },
    { path: '/play', icon: PlaySquare, label: 'Play' },
    { path: '/cart', icon: ShoppingCart, label: 'Cart', badge: 0 },
    { path: '/wishlist', icon: Heart, label: 'Wishlist' },
];

const bottomItems = [
    { path: '/account', icon: User, label: 'Account' },
    { path: '/help', icon: HelpCircle, label: 'Help' },
];

const DesktopSidebar = () => {
    const location = useLocation();
    const currentPath = location.pathname;
    const { user, profile } = useAuth ? useAuth() : { user: null, profile: null };

    return (
        <aside className="hidden md:flex flex-col w-64 h-[calc(100vh-64px)] fixed left-0 top-16 z-40 overflow-y-auto no-scrollbar">
            {/* Sidebar background */}
            <div className="absolute inset-0 bg-white/90 backdrop-blur-2xl border-r border-gray-100/80" />

            {/* Gradient accent top */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-indigo-50/60 to-transparent pointer-events-none" />

            <div className="relative flex flex-col h-full pt-5 pb-4">
                {/* Main Nav */}
                <nav className="flex-1 px-3 space-y-0.5">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 mb-3">Navigation</p>
                    {mainItems.map((item) => {
                        const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.label}
                                to={item.path}
                                className={`relative flex items-center gap-3.5 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                                    isActive
                                        ? 'bg-gradient-to-r from-indigo-50 to-purple-50/50 text-indigo-700'
                                        : 'text-gray-600 hover:bg-gray-50/80 hover:text-gray-900'
                                }`}
                            >
                                {/* Active indicator */}
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-active"
                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"
                                        transition={{ type: 'spring', bounce: 0.3, duration: 0.4 }}
                                    />
                                )}

                                {/* Icon container */}
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 ${
                                    isActive
                                        ? 'bg-gradient-to-br from-indigo-500 to-purple-500 shadow-md shadow-indigo-300/40'
                                        : 'bg-gray-100/80 group-hover:bg-gray-200/60'
                                }`}>
                                    <Icon
                                        size={16}
                                        className={`transition-colors ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}`}
                                        strokeWidth={isActive ? 2.5 : 1.8}
                                    />
                                    {item.badge > 0 && (
                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">
                                            {item.badge}
                                        </span>
                                    )}
                                </div>

                                <span className={`text-sm font-semibold transition-all duration-200 ${isActive ? 'text-indigo-700 font-bold' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}

                </nav>

                {/* Bottom Items */}
                <div className="px-3 pt-4 border-t border-gray-100/80 space-y-0.5 mt-2">
                    {bottomItems.map((item) => {
                        const isActive = currentPath === item.path;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.label}
                                to={item.path}
                                className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                                    isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                }`}
                            >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isActive ? 'bg-indigo-100' : 'bg-gray-100/80 group-hover:bg-gray-200/60'}`}>
                                    <Icon size={15} className={isActive ? 'text-indigo-600' : 'text-gray-500'} strokeWidth={1.8} />
                                </div>
                                <span className="text-sm font-semibold">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </aside>
    );
};

export default DesktopSidebar;
