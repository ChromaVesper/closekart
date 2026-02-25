import React from 'react';
import { Home, Compass, PlaySquare, LayoutGrid, User, ShoppingCart, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DesktopSidebar = () => {
    const location = useLocation();
    const currentPath = location.pathname;
    const { logout, user } = useAuth();

    const navItems = [
        { path: '/', icon: Home, label: 'Home' },
        { path: '/explore', icon: Compass, label: 'Explore' },
        { path: '/play', icon: PlaySquare, label: 'Play' },
        { path: '/categories', icon: LayoutGrid, label: 'Categories' },
        { path: '/cart', icon: ShoppingCart, label: 'Cart', badge: 3 },
        { path: '/profile', icon: User, label: 'Account' },
    ];

    return (
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 h-[calc(100vh-64px)] fixed left-0 top-16 z-40 overflow-y-auto pt-6 pb-4">
            <div className="flex-1 px-4 space-y-2">
                {navItems.map((item) => {
                    const isActive = currentPath === item.path;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.label}
                            to={item.path}
                            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-blue-50 text-brand-primary font-bold'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'
                                }`}
                        >
                            <div className="relative">
                                <Icon size={22} className={`${isActive ? 'text-brand-primary fill-blue-100' : 'text-gray-500 group-hover:text-gray-700'}`} />
                                {item.badge && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center border-2 border-white shadow-sm">
                                        {item.badge}
                                    </span>
                                )}
                            </div>
                            <span className="text-sm">{item.label}</span>
                        </Link>
                    );
                })}
            </div>

            {user && (
                <div className="px-4 mt-auto">
                    <div className="border border-gray-100 rounded-xl p-4 bg-gray-50 flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold">
                                {user.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="flex items-center gap-2 text-sm text-red-600 font-medium bg-white border border-red-100 rounded-lg px-3 py-2 w-full justify-center transition hover:bg-red-50"
                        >
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                </div>
            )}
        </aside>
    );
};

export default DesktopSidebar;
