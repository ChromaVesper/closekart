import React from 'react';
import { Home, Gamepad2, LayoutGrid, User, ShoppingCart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const BottomNav = () => {
    const location = useLocation();
    const currentPath = location.pathname;

    const navItems = [
        { path: '/', icon: Home, label: 'Home' },
        { path: '/play', icon: Gamepad2, label: 'Play' },
        { path: '/categories', icon: LayoutGrid, label: 'Categories' },
        { path: '/profile', icon: User, label: 'Account' },
        { path: '/cart', icon: ShoppingCart, label: 'Cart', badge: 3 },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.05)] transition-all">
            <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
                {navItems.map((item) => {
                    const isActive = currentPath === item.path;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.label}
                            to={item.path}
                            className="flex flex-col items-center justify-center w-full h-full relative group"
                        >
                            <div className={`relative flex items-center justify-center transition-all duration-300 ${isActive ? '-translate-y-1' : ''}`}>
                                <Icon
                                    size={22}
                                    className={`${isActive ? 'text-blue-600 fill-blue-100' : 'text-gray-600'} transition-colors duration-300`}
                                />
                                {item.badge && (
                                    <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center border-2 border-white shadow-sm">
                                        {item.badge}
                                    </span>
                                )}
                            </div>
                            <span className={`text-[10px] sm:text-xs font-medium mt-1 transition-colors duration-300 ${isActive ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomNav;
