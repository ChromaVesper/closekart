import React from 'react';
import { Home, Compass, PlaySquare, LayoutGrid, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/explore', icon: Compass, label: 'Explore' },
    { path: '/play', icon: PlaySquare, label: 'Play' },
    { path: '/shops', icon: LayoutGrid, label: 'Shops' },
    { path: '/account', icon: User, label: 'Account' },
];

const MobileNav = () => {
    const location = useLocation();
    const currentPath = location.pathname;

    return (
        <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden fixed bottom-0 left-0 right-0 z-50"
        >
            {/* Blur backdrop */}
            <div className="absolute inset-0 bg-white/80 backdrop-blur-2xl border-t border-white/60 shadow-[0_-8px_32px_-4px_rgba(99,102,241,0.1)]" />

            {/* Nav strip */}
            <div className="relative flex justify-around items-center h-[68px] px-2 pb-safe">
                {navItems.map((item) => {
                    const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.label}
                            to={item.path}
                            className="relative flex flex-col items-center justify-center w-full h-full py-2 group"
                        >
                            {/* Active pill background */}
                            <AnimatePresence>
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-active-pill"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{ type: 'spring', bounce: 0.35, duration: 0.45 }}
                                        className="absolute top-2 w-12 h-8 rounded-2xl bg-gradient-to-br from-indigo-500/15 to-purple-500/15 border border-indigo-200/50"
                                    />
                                )}
                            </AnimatePresence>

                            <motion.div
                                animate={isActive ? { y: -2 } : { y: 0 }}
                                transition={{ type: 'spring', bounce: 0.5 }}
                                className="relative z-10"
                            >
                                <Icon
                                    size={21}
                                    className={`transition-colors duration-300 ${
                                        isActive
                                            ? 'text-indigo-600'
                                            : 'text-gray-400 group-hover:text-gray-600'
                                    }`}
                                    strokeWidth={isActive ? 2.5 : 1.8}
                                />
                            </motion.div>

                            <motion.span
                                animate={{ opacity: isActive ? 1 : 0.65 }}
                                className={`text-[10px] font-bold mt-1 z-10 relative transition-colors duration-300 ${
                                    isActive ? 'text-indigo-600' : 'text-gray-400'
                                }`}
                            >
                                {item.label}
                            </motion.span>

                            {/* Active dot */}
                            {isActive && (
                                <motion.div
                                    layoutId="nav-dot"
                                    className="absolute bottom-1 w-1 h-1 rounded-full bg-indigo-500"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', bounce: 0.5 }}
                                />
                            )}
                        </Link>
                    );
                })}
            </div>
        </motion.div>
    );
};

export default MobileNav;
