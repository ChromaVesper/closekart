import React from 'react';
import { Home, Compass, PlaySquare, LayoutGrid, User, ShoppingCart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const MobileNav = () => {
    const location = useLocation();
    const currentPath = location.pathname;

    const navItems = [
        { path: '/', icon: Home, label: 'Home' },
        { path: '/explore', icon: Compass, label: 'Explore' },
        { path: '/play', icon: PlaySquare, label: 'Play' },
        { path: '/categories', icon: LayoutGrid, label: 'Categories' },
        { path: '/profile', icon: User, label: 'Account' },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.05)] transition-all">
            <div className="flex justify-around items-center h-16 px-1">
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
                                    className={`${isActive ? 'text-brand-primary fill-blue-50' : 'text-gray-500'} transition-colors duration-300`}
                                />
                                {item.badge && (
                                    <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center border-2 border-white shadow-sm">
                                        {item.badge}
                                    </span>
                                )}
                            </div>
                            <span className={`text-[10px] font-medium mt-1 transition-colors duration-300 ${isActive ? 'text-brand-primary font-bold' : 'text-gray-500'}`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default MobileNav;
