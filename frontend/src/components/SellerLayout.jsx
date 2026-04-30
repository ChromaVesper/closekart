import React, { useState } from 'react';
import { 
    LayoutDashboard, 
    Store, 
    PlusCircle, 
    Package, 
    ShoppingBag, 
    Warehouse, 
    BarChart3, 
    CreditCard, 
    Settings, 
    LogOut,
    Menu,
    X,
    Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';

const SellerLayout = () => {
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/login');
    };

    const menuItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/seller-dashboard' },
        { icon: <Store size={20} />, label: 'My Shop', path: '/seller/setup-shop' },
        { icon: <PlusCircle size={20} />, label: 'Add Product', path: '/seller/add-product' },
        { icon: <Package size={20} />, label: 'Manage Products', path: '/seller/products' },
        { icon: <ShoppingBag size={20} />, label: 'Orders', path: '/seller/orders' },
        { icon: <Warehouse size={20} />, label: 'Inventory', path: '/seller/inventory' },
        { icon: <BarChart3 size={20} />, label: 'Analytics', path: '/seller/analytics' },
        { icon: <CreditCard size={20} />, label: 'Payments', path: '/seller/payments' },
        { icon: <Settings size={20} />, label: 'Store Settings', path: '/seller/settings' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-white transition-all duration-300 flex flex-col fixed inset-y-0 z-50`}>
                <div className="p-4 flex items-center justify-between border-b border-white/10">
                    {isSidebarOpen ? (
                         <span className="text-xl font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Seller Panel</span>
                    ) : (
                        <Store className="text-blue-400 mx-auto" />
                    )}
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 hover:bg-white/10 rounded-lg">
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <nav className="flex-1 mt-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
                    {menuItems.map((item) => (
                        <Link 
                            key={item.label}
                            to={item.path}
                            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition group relative ${
                                isActive(item.path) 
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <span className="shrink-0">{item.icon}</span>
                            {isSidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                            {!isSidebarOpen && (
                                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition">
                                    {item.label}
                                </div>
                            )}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl transition">
                        <LogOut size={20} />
                        {isSidebarOpen && <span className="text-sm font-bold">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`${isSidebarOpen ? 'ml-64' : 'ml-20'} flex-1 transition-all duration-300`}>
                <header className="bg-white border-b border-gray-100 h-16 flex items-center justify-between px-8 sticky top-0 z-40">
                    <h1 className="text-lg font-bold text-gray-800">
                        {menuItems.find(item => isActive(item.path))?.label || 'Seller Portal'}
                    </h1>
                    <div className="flex items-center gap-4">
                        <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-full relative">
                            <Bell size={20} />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs ring-2 ring-blue-50">
                            {user?.email?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default SellerLayout;
