import React, { useState, useEffect } from 'react';
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
    TrendingUp,
    AlertCircle,
    Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import api from '../services/api';

const SellerDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        revenue: 0,
        lowStock: 0
    });
    const [shop, setShop] = useState(null);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchStats = async () => {
            try {
                // Fetch Products, Orders, and Shop details from the MongoDB backend
                const [productsRes, ordersRes, shopRes] = await Promise.all([
                    api.get('/products/seller').catch(() => ({ data: [] })),
                    api.get('/orders/seller').catch(() => ({ data: [] })),
                    api.get('/shops/mine').catch(() => ({ data: null }))
                ]);

                const products = productsRes.data || [];
                const orders = ordersRes.data || [];
                if (shopRes.data) setShop(shopRes.data);

                const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
                const lowStockCount = products.filter(p => !p.availability || (p.stock || 0) < 5).length;

                setStats({
                    totalProducts: products.length,
                    totalOrders: orders.length,
                    revenue: totalRevenue,
                    lowStock: lowStockCount
                });
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user]);

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/login');
    };

    const toggleShopStatus = async () => {
        if (!shop) return;
        setIsUpdatingStatus(true);
        try {
            const res = await api.patch(`/shops/${shop._id}/toggle-status`, { isOpen: !shop.isOpen });
            setShop(prev => ({ ...prev, isOpen: res.data.isOpen }));
        } catch (error) {
            console.error("Failed to toggle shop status:", error);
            alert("Could not update shop status.");
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    return (
        <div>
            {/* Header / Store Status */}
            {shop && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm gap-4">
                    <div>
                        <h2 className="text-xl font-black text-gray-900">{shop.shopName}</h2>
                        <p className="text-gray-500 font-medium text-sm flex items-center gap-2">
                            <Store size={14} /> Partner Dashboard
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-gray-700">Accepting Orders</span>
                        <button 
                            onClick={toggleShopStatus}
                            disabled={isUpdatingStatus}
                            className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:opacity-50 ${
                                shop.isOpen ? 'bg-emerald-500' : 'bg-gray-200'
                            }`}
                        >
                            <span className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                shop.isOpen ? 'translate-x-6' : 'translate-x-0'
                            }`} />
                        </button>
                    </div>
                </div>
            )}

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard 
                    icon={<Package className="text-blue-600" />}
                    label="Total Products"
                    value={stats.totalProducts}
                    bgColor="bg-blue-50"
                />
                <StatCard 
                    icon={<ShoppingBag className="text-emerald-600" />}
                    label="Total Orders"
                    value={stats.totalOrders}
                    bgColor="bg-emerald-50"
                />
                <StatCard 
                    icon={<TrendingUp className="text-indigo-600" />}
                    label="Revenue"
                    value={`₹${stats.revenue}`}
                    bgColor="bg-indigo-50"
                />
                <StatCard 
                    icon={<AlertCircle className="text-orange-600" />}
                    label="Stock Alerts"
                    value={stats.lowStock}
                    bgColor="bg-orange-50"
                    isWarning={stats.lowStock > 0}
                />
            </div>

            {/* Chart / Tables Placeholders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Sales Performance</h3>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 text-sm italic font-medium">
                        MongoDB connected. Interactive Zomato-style sales visualization will appear here soon.
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Notifications</h3>
                    <div className="space-y-4">
                        <NotificationItem 
                            type="order"
                            text="New Zomato-style order incoming"
                            time="Just now"
                        />
                        <NotificationItem 
                            type="stock"
                            text="Check inventory for rapid delivery"
                            time="1 hour ago"
                        />
                        <NotificationItem 
                            type="payment"
                            text="Daily settlement processed"
                            time="2 hours ago"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, bgColor, isWarning }) => (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition group">
        <div className="flex items-start justify-between">
            <div className={`p-3 rounded-2xl ${bgColor} group-hover:scale-110 transition duration-300`}>
                {icon}
            </div>
            {isWarning && <span className="px-2 py-1 bg-red-100 text-red-600 text-[10px] font-bold rounded-full uppercase tracking-wider">Attention</span>}
        </div>
        <div className="mt-4">
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <h2 className="text-2xl font-black text-gray-900 mt-1">{value}</h2>
        </div>
    </div>
);

const NotificationItem = ({ type, text, time }) => (
    <div className="flex gap-4 p-3 hover:bg-gray-50 rounded-2xl transition cursor-pointer">
        <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${
            type === 'order' ? 'bg-emerald-50 text-emerald-600' : 
            type === 'stock' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
        }`}>
            {type === 'order' ? <ShoppingBag size={18} /> : type === 'stock' ? <AlertCircle size={18} /> : <CreditCard size={18} />}
        </div>
        <div>
            <p className="text-sm font-semibold text-gray-800 leading-tight">{text}</p>
            <p className="text-[10px] text-gray-400 font-medium mt-1">{time}</p>
        </div>
    </div>
);

export default SellerDashboard;
