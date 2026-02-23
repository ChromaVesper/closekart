import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, User, LogOut, Menu, X, Store } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
    { to: '/swapkeeper/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/swapkeeper/items', label: 'My Items', icon: Package },
    { to: '/swapkeeper/orders', label: 'Orders', icon: ShoppingBag },
    { to: '/swapkeeper/profile', label: 'Profile', icon: User },
];

const SwapKeeperLayout = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Brand */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-indigo-700">
                <div className="bg-yellow-400 text-indigo-900 rounded-lg p-1.5">
                    <Store size={20} />
                </div>
                <div>
                    <p className="text-white font-bold text-sm leading-none">SwapKeeper</p>
                    <p className="text-indigo-300 text-xs truncate max-w-[130px]">{user?.name || 'Dashboard'}</p>
                </div>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {navItems.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                            ${isActive
                                ? 'bg-white/15 text-white shadow-sm'
                                : 'text-indigo-200 hover:bg-white/10 hover:text-white'
                            }`
                        }
                    >
                        <Icon size={18} />
                        {label}
                    </NavLink>
                ))}
            </nav>

            {/* Logout */}
            <div className="px-3 py-4 border-t border-indigo-700">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all"
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-64 bg-gradient-to-b from-indigo-900 to-indigo-800 shrink-0 sticky top-0 h-screen overflow-y-auto">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div className="lg:hidden fixed inset-0 z-40 flex">
                    <div
                        className="fixed inset-0 bg-black/50"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <aside className="relative z-50 flex flex-col w-64 bg-gradient-to-b from-indigo-900 to-indigo-800 h-full overflow-y-auto">
                        <SidebarContent />
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Top Bar */}
                <div className="lg:hidden flex items-center justify-between bg-indigo-900 px-4 py-3 sticky top-0 z-30">
                    <div className="flex items-center gap-2">
                        <div className="bg-yellow-400 text-indigo-900 rounded-md p-1">
                            <Store size={16} />
                        </div>
                        <span className="text-white font-bold text-sm">SwapKeeper</span>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-white p-1 rounded"
                    >
                        <Menu size={22} />
                    </button>
                </div>

                <main className="flex-1 p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default SwapKeeperLayout;
