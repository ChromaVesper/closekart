import React, { useState } from 'react';
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import {
    LayoutDashboard, Users, Store, Package,
    ShoppingCart, PieChart, Settings, LogOut, ShieldAlert
} from 'lucide-react';

// Admin Page Sub-Components (Will be separated later if they grow large)
import AdminOverview from './AdminOverview';
import AdminSellers from './AdminSellers';
import AdminProducts from './AdminProducts';
import AdminOrders from './AdminOrders';
import AdminUsers from './AdminUsers';
import AdminReports from './AdminReports';
import AdminSettings from './AdminSettings';

export default function AdminDashboard() {
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await signOut(auth);
        localStorage.removeItem('userRole');
        navigate('/');
    };

    const navItems = [
        { path: '', icon: LayoutDashboard, label: 'Dashboard Overview' },
        { path: 'sellers', icon: Store, label: 'Sellers Verification' },
        { path: 'products', icon: Package, label: 'Product Moderation' },
        { path: 'orders', icon: ShoppingCart, label: 'Order Monitoring' },
        { path: 'users', icon: Users, label: 'User Management' },
        { path: 'reports', icon: PieChart, label: 'Platform Reports' },
        { path: 'settings', icon: Settings, label: 'Platform Settings' }
    ];

    return (
        <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
            {/* Admin Sidebar */}
            <aside className="w-72 bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 shadow-2xl z-20 shrink-0">
                <div className="p-6 border-b border-slate-800">
                    <div className="flex items-center gap-3 text-white mb-2">
                        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/30">
                            <ShieldAlert size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">Admin Console</h1>
                            <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider">CloseKart Master</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
                    {navItems.map(item => {
                        const fullPath = `/admin${item.path ? `/${item.path}` : ''}`;
                        let isActive = location.pathname === fullPath;
                        // Special handling for the base route so it doesn't stay highlighted when on sub-routes
                        if (item.path === '' && location.pathname !== '/admin' && location.pathname !== '/admin/') {
                            isActive = false;
                        }

                        return (
                            <Link
                                key={item.path}
                                to={fullPath}
                                className={`w-full flex items-center justify-start gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                    : 'hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                <item.icon size={20} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800 bg-slate-900">
                    {/* Admin Profile Mini */}
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                            <User size={20} className="text-slate-400" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-white truncate">{profile?.name || 'Administrator'}</p>
                            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                        </div>
                    </div>

                    <button onClick={handleLogout} className="w-full flex items-center justify-start gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all font-bold">
                        <LogOut size={20} />
                        Terminate Session
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-full overflow-y-auto bg-gray-50 relative">
                <div className="p-8 pb-20 max-w-7xl mx-auto w-full">
                    <Routes>
                        <Route path="/" element={<AdminOverview />} />
                        <Route path="/sellers" element={<AdminSellers />} />
                        <Route path="/products" element={<AdminProducts />} />
                        <Route path="/orders" element={<AdminOrders />} />
                        <Route path="/users" element={<AdminUsers />} />
                        <Route path="/reports" element={<AdminReports />} />
                        <Route path="/settings" element={<AdminSettings />} />
                    </Routes>
                </div>
            </main>
        </div>
    );
}

// Ensure you don't crash from missing user icon
const User = ({ size, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
);
