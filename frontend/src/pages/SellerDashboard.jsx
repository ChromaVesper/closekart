import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, deleteDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { LayoutDashboard, Package, ShoppingCart, Settings, LogOut, Plus, Edit2, Trash2, TrendingUp, Users, DollarSign, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

export default function SellerDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');

    const [isOnline, setIsOnline] = useState(true);
    const [products, setProducts] = useState([]);

    // Zomato style Live Orders Management
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({ revenue: 0, totalOrders: 0, customers: 0 });
    const [loading, setLoading] = useState(true);

    // Modal states
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // Fetch Seller Data
    useEffect(() => {
        if (!user?.uid) return;
        fetchDashboardData();
    }, [user]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch Products
            const q = query(collection(db, 'products'), where('sellerId', '==', user.uid));
            const querySnapshot = await getDocs(q);
            const fetchedProducts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProducts(fetchedProducts);

            // Dummy stats for UI completeness
            setStats({
                revenue: fetchedProducts.reduce((acc, p) => acc + (Number(p.price) || 0) * Math.floor(Math.random() * 5), 0),
                totalOrders: Math.floor(Math.random() * 50) + 10,
                customers: Math.floor(Math.random() * 30) + 5
            });

            // Enhanced Dummy orders for Live Management
            setOrders([
                { id: 'ORD-001', customer: 'Aryan Sharma', item: '2x Masala Dosa', total: 240, status: 'New', time: '2 mins ago' },
                { id: 'ORD-002', customer: 'Priya Patel', item: '1x Paneer Tikka', total: 350, status: 'Preparing', time: '15 mins ago' },
                { id: 'ORD-003', customer: 'Rahul Kumar', item: '3x Cold Coffee', total: 450, status: 'Ready', time: '25 mins ago' },
                { id: 'ORD-004', customer: 'Sneha Gupta', item: '1x Veg Biryani', total: 280, status: 'Dispatched', time: '40 mins ago' },
            ]);

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/seller-login');
    };

    const handleDeleteProduct = async (productId) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            await deleteDoc(doc(db, 'products', productId));
            fetchDashboardData();
        }
    };

    const openProductModal = (product = null) => {
        setEditingProduct(product);
        setIsProductModalOpen(true);
    };

    return (
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 shadow-2xl z-20 shrink-0 hidden md:flex">
                <div className="p-6 pb-2">
                    <div className="flex items-center gap-3 text-white mb-2">
                        <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/30">
                            <LayoutDashboard size={24} />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight">Seller Hub</h1>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
                    {[
                        { id: 'overview', icon: Activity, label: 'Overview' },
                        { id: 'products', icon: Package, label: 'Menu & Inventory' },
                        { id: 'add-product', icon: Plus, label: 'Add Item', action: () => navigate('/seller/add-product') },
                        { id: 'orders', icon: ShoppingCart, label: 'Live Orders' },
                        { id: 'pricing', icon: DollarSign, label: 'Pricing (Soon)' },
                        { id: 'analytics', icon: TrendingUp, label: 'Analytics (Soon)' },
                        { id: 'messages', icon: Users, label: 'Reviews (Soon)' },
                        { id: 'settings', icon: Settings, label: 'Store Settings' }
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => {
                                if (item.action) {
                                    item.action();
                                } else {
                                    setActiveTab(item.id);
                                }
                            }}
                            className={`w-full flex items-center justify-start gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === item.id
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                : 'hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <item.icon size={20} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button onClick={handleLogout} className="w-full flex items-center justify-start gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-slate-800 hover:text-red-300 transition-all font-medium">
                        <LogOut size={20} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-full relative overflow-y-auto no-scrollbar">

                {/* Mobile Header */}
                <header className="md:hidden bg-white px-4 py-4 flex items-center justify-between border-b border-gray-100 shadow-sm sticky top-0 z-30">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-600 rounded-lg"><LayoutDashboard size={20} className="text-white" /></div>
                        <h1 className="font-bold text-gray-900">Seller Hub</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsOnline(!isOnline)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 ${isOnline ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}
                        >
                            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                            {isOnline ? 'Online' : 'Offline'}
                        </button>
                        <button onClick={handleLogout} className="text-gray-500 p-2"><LogOut size={20} /></button>
                    </div>
                </header>

                {/* Mobile Tabs */}
                <div className="md:hidden flex overflow-x-auto gap-2 p-4 bg-[#F8FAFC] sticky top-[60px] z-20 shadow-sm hide-scrollbar">
                    {[{ id: 'overview', label: 'Overview' }, { id: 'products', label: 'Menu & Inventory' }, { id: 'orders', label: 'Live Orders' }].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors border ${activeTab === tab.id ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200'}`}>
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full relative z-10 pb-20">

                    {/* Header Details */}
                    <div className="mb-8 hidden md:flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight capitalize">{activeTab}</h2>
                            <p className="text-slate-500 mt-1 font-medium">Here's what's happening with your store today.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-gray-200 shadow-sm">
                                <span className="text-sm font-bold text-gray-700">Store Status:</span>
                                <button
                                    onClick={() => setIsOnline(!isOnline)}
                                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${isOnline ? 'bg-green-500' : 'bg-gray-300'}`}
                                >
                                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isOnline ? 'translate-x-8' : 'translate-x-1'}`} />
                                </button>
                                <span className={`text-sm font-bold ${isOnline ? 'text-green-600' : 'text-gray-500'}`}>
                                    {isOnline ? 'Accepting Orders' : 'Offline'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <>
                            {/* OVERVIEW TAB */}
                            {activeTab === 'overview' && (
                                <div className="space-y-6">
                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                                        <StatCard icon={DollarSign} title="Total Revenue" value={`₹${stats.revenue.toLocaleString()}`} color="text-emerald-600" bg="bg-emerald-50" />
                                        <StatCard icon={ShoppingCart} title="Orders" value={stats.totalOrders} color="text-blue-600" bg="bg-blue-50" />
                                        <StatCard icon={Users} title="Customers" value={stats.customers} color="text-indigo-600" bg="bg-indigo-50" />
                                    </div>

                                    {/* Recent Orders Overview */}
                                    <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden mt-8">
                                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                            <h3 className="text-xl font-bold text-gray-800">Recent Orders</h3>
                                            <button onClick={() => setActiveTab('orders')} className="text-sm font-bold text-blue-600 hover:text-blue-700">View All</button>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                                                        <th className="p-4 font-bold">Order ID</th>
                                                        <th className="p-4 font-bold">Customer</th>
                                                        <th className="p-4 font-bold">Amount</th>
                                                        <th className="p-4 font-bold">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 text-sm">
                                                    {orders.map((o) => (
                                                        <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                                                            <td className="p-4 font-bold text-slate-800">{o.id}</td>
                                                            <td className="p-4 text-slate-600 font-medium">{o.customer}</td>
                                                            <td className="p-4 font-bold text-slate-800">₹{o.total}</td>
                                                            <td className="p-4">
                                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${o.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                                                    }`}>
                                                                    {o.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* PRODUCTS TAB */}
                            {activeTab === 'products' && (
                                <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 rounded-3xl shadow-sm border border-gray-100 gap-4">
                                        <div>
                                            <h3 className="font-bold text-gray-800 text-lg">Menu & Inventory</h3>
                                            <p className="text-sm text-gray-500">{products.length} Items Listed</p>
                                        </div>
                                        <div className="flex items-center gap-3 w-full sm:w-auto">
                                            {profile?.status === 'pending' ? (
                                                <div className="px-4 py-2.5 bg-amber-50 text-amber-700 rounded-xl text-sm font-bold border border-amber-200/60 w-full text-center sm:w-auto flex items-center justify-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> Pending Approval
                                                </div>
                                            ) : (
                                                <button onClick={() => navigate('/seller/add-product')} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 w-full sm:w-auto">
                                                    <Plus size={18} /> Add Item
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
                                        {products.length === 0 ? (
                                            <div className="col-span-full py-16 text-center bg-white rounded-[2rem] border border-gray-200 border-dashed">
                                                <Package className="mx-auto h-12 w-12 text-gray-300" />
                                                <h3 className="mt-3 text-base font-bold text-gray-900">Your Menu is Empty</h3>
                                                <p className="mt-1 text-sm text-gray-500 font-medium max-w-sm mx-auto">Get started by building your digital catalog so customers can start ordering from your store.</p>
                                            </div>
                                        ) : (
                                            products.map((p, i) => {
                                                // Create alternating default stock states for visual UI simulation since our DB doesn't have an exact boolean
                                                const isInStock = p.stock > 0 || i % 2 !== 0;

                                                return (
                                                    <div key={p.id} className={`bg-white rounded-3xl border ${isInStock ? 'border-gray-100' : 'border-gray-200 bg-gray-50/50 opacity-80'} shadow-sm transition-all overflow-hidden flex flex-col group`}>
                                                        <div className="h-44 bg-slate-100 relative overflow-hidden">
                                                            {p.image ? (
                                                                <img src={p.image} alt={p.name} className={`w-full h-full object-cover transition-transform duration-700 ${isInStock ? 'group-hover:scale-110' : 'grayscale-[50%]'}`} />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center bg-gray-50"><Package size={40} className="text-slate-300" /></div>
                                                            )}
                                                            {!isInStock && (
                                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                                                                    <span className="bg-white text-gray-900 px-4 py-1.5 font-black text-sm rounded-lg shadow-lg tracking-wide uppercase">Out of Stock</span>
                                                                </div>
                                                            )}
                                                            <div className="absolute top-3 left-3 flex gap-2">
                                                                <div className={`p-1 rounded bg-white shadow-sm`} title={p.category === 'Non-Veg' ? 'Non-Vegetarian' : 'Vegetarian'}>
                                                                    <div className={`w-4 h-4 border-2 flex items-center justify-center ${p.category === 'Non-Veg' ? 'border-red-600' : 'border-green-600'}`}>
                                                                        <div className={`w-2 h-2 rounded-full ${p.category === 'Non-Veg' ? 'bg-red-600' : 'bg-green-600'}`}></div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="p-5 flex-1 flex flex-col">
                                                            <h4 className={`font-bold text-lg line-clamp-1 ${isInStock ? 'text-gray-900' : 'text-gray-500 line-through decoration-gray-300'}`}>{p.name}</h4>
                                                            <p className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded inline-block w-max mt-1.5">{p.category}</p>
                                                            <p className="text-sm text-gray-500 mt-2.5 line-clamp-2 leading-relaxed">{p.description}</p>

                                                            <div className="mt-auto pt-5 border-t border-gray-100 mt-5">
                                                                <div className="flex items-center justify-between mb-4">
                                                                    <span className={`font-black tracking-tight text-xl ${isInStock ? 'text-slate-900' : 'text-slate-500'}`}>₹{p.price}</span>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xs font-bold text-gray-500 uppercase">In Stock</span>
                                                                        <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isInStock ? 'bg-green-500' : 'bg-gray-300'}`}>
                                                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isInStock ? 'translate-x-6' : 'translate-x-1'}`} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <button onClick={() => openProductModal(p)} disabled={profile?.status === 'pending'} className="flex-1 py-2.5 text-blue-700 bg-blue-50 font-bold text-sm hover:bg-blue-100 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                                                                        <Edit size={16} /> Edit
                                                                    </button>
                                                                    <button onClick={() => handleDeleteProduct(p.id)} disabled={profile?.status === 'pending'} className="w-12 h-10 flex items-center justify-center text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors disabled:opacity-50">
                                                                        <Trash size={16} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ORDERS TAB */}
                            {activeTab === 'orders' && (
                                <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                                    {/* Orders Header Row */}
                                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                                        <div className="flex gap-4 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 hide-scrollbar">
                                            {['All', 'New', 'Preparing', 'Ready', 'Dispatched'].map(statusFilter => (
                                                <button key={statusFilter} className="px-5 py-2 rounded-xl text-sm font-bold bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors whitespace-nowrap border border-transparent focus:border-blue-200">
                                                    {statusFilter}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="text-sm font-bold text-gray-500 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100 whitespace-nowrap">
                                            <span className="text-blue-600 mr-1.5">{orders.length}</span> Active Live Orders
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 pb-10">
                                        {orders.length === 0 ? (
                                            <div className="col-span-full py-20 text-center">
                                                <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-4 rotate-3">
                                                    <Package size={32} className="text-gray-300" strokeWidth={1.5} />
                                                </div>
                                                <p className="font-bold text-gray-900 text-lg">No active orders</p>
                                                <p className="text-gray-500 text-sm mt-1">When customers place orders, they will appear here live.</p>
                                            </div>
                                        ) : (
                                            orders.map(order => (
                                                <div key={order.id} className={`bg-white border rounded-[2rem] p-6 shadow-sm overflow-hidden relative transition-all duration-300 hover:shadow-md
                                                    ${order.status === 'New' ? 'border-amber-200 shadow-[0_0_15px_rgba(252,211,77,0.15)] ring-1 ring-amber-100' : 'border-gray-100'}
                                                `}>
                                                    {/* Status Badge Line Top */}
                                                    {order.status === 'New' && <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 to-amber-500"></div>}
                                                    {order.status === 'Preparing' && <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500"></div>}
                                                    {order.status === 'Ready' && <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 to-emerald-500"></div>}
                                                    {order.status === 'Dispatched' && <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500"></div>}

                                                    <div className="flex justify-between items-start mb-6">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-lg font-black text-gray-900 tracking-tight">#{order.id.split('-')[1]}</span>
                                                                <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-widest font-black flex items-center gap-1.5
                                                                    ${order.status === 'New' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                                                        order.status === 'Preparing' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                                                            order.status === 'Ready' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                                                                'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                                                    }`
                                                                }>
                                                                    {order.status === 'New' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>}
                                                                    {order.status}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs font-bold text-gray-400 mt-1.5 flex items-center gap-1.5"><Clock size={12} className="text-gray-300" /> {order.time}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-2xl font-black text-gray-900 tracking-tighter">₹{order.total}</div>
                                                            <div className="text-[10px] font-black uppercase tracking-wider text-green-700 bg-green-50 px-2 py-1 rounded mt-1.5 border border-green-200/50 inline-block">Paid Online</div>
                                                        </div>
                                                    </div>

                                                    <div className="bg-gray-50/80 rounded-2xl p-4 mb-6 border border-gray-100/80">
                                                        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200/60">
                                                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm shadow-inner hidden sm:flex">
                                                                {order.customer.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-900">{order.customer}</p>
                                                                <p className="text-xs text-gray-500 font-medium">Customer</p>
                                                            </div>
                                                            <div className="ml-auto">
                                                                <button className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-blue-600 transition-colors shadow-sm">
                                                                    <Phone size={14} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-3">
                                                            <div className="flex justify-between items-start text-sm">
                                                                <div className="flex items-start gap-3">
                                                                    <div className="mt-1 shrink-0 border border-green-500 p-0.5 rounded-sm bg-green-50"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div></div>
                                                                    <span className="font-bold text-gray-800">{order.item}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Zomato Live Action Buttons mapped by Status */}
                                                    <div className="flex gap-3">
                                                        {order.status === 'New' && (
                                                            <>
                                                                <button
                                                                    onClick={() => setOrders(orders.map(o => o.id === order.id ? { ...o, status: 'Preparing' } : o))}
                                                                    className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-amber-500/20 active:scale-[0.98]"
                                                                >
                                                                    Accept Order
                                                                </button>
                                                                <button
                                                                    onClick={() => setOrders(orders.filter(o => o.id !== order.id))}
                                                                    className="px-6 text-gray-500 hover:text-red-700 hover:bg-red-50 hover:border-red-200 bg-white border border-gray-200 py-3.5 rounded-xl font-bold text-sm transition-all shadow-sm active:scale-[0.98]"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </>
                                                        )}
                                                        {order.status === 'Preparing' && (
                                                            <button
                                                                onClick={() => setOrders(orders.map(o => o.id === order.id ? { ...o, status: 'Ready' } : o))}
                                                                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-blue-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
                                                            >
                                                                <Package size={16} /> Mark Food Ready
                                                            </button>
                                                        )}
                                                        {order.status === 'Ready' && (
                                                            <button
                                                                onClick={() => setOrders(orders.map(o => o.id === order.id ? { ...o, status: 'Dispatched' } : o))}
                                                                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-emerald-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
                                                            >
                                                                <CheckCircle size={18} /> Handover to Delivery
                                                            </button>
                                                        )}
                                                        {order.status === 'Dispatched' && (
                                                            <div className="flex-1 bg-indigo-50 border border-indigo-100 text-indigo-700 py-3.5 rounded-xl font-bold text-sm text-center flex items-center justify-center gap-2 shadow-sm">
                                                                <Package size={16} /> Out for Delivery
                                                                <span className="text-[10px] uppercase font-black tracking-widest text-indigo-400 ml-2">En Route</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* PRICING TAB */}
                            {activeTab === 'pricing' && (
                                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">Pricing Strategies</h3>
                                    <div className="text-center py-10 text-gray-500 font-medium">
                                        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <DollarSign size={28} className="text-emerald-500" />
                                        </div>
                                        Bulk update capabilities and dynamic pricing tools coming soon.
                                    </div>
                                </div>
                            )}

                            {/* ANALYTICS TAB */}
                            {activeTab === 'analytics' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <StatCard icon={Package} title="Total Products" value={products.length} color="text-indigo-600" bg="bg-indigo-50" />
                                        <StatCard icon={ShoppingCart} title="Total Orders" value={stats.totalOrders} color="text-blue-600" bg="bg-blue-50" />
                                        <StatCard icon={DollarSign} title="Total Revenue" value={`₹${stats.revenue.toLocaleString()}`} color="text-emerald-600" bg="bg-emerald-50" />
                                        <StatCard icon={Activity} title="Today's Orders" value={Math.floor(Math.random() * 5)} color="text-amber-600" bg="bg-amber-50" />
                                    </div>
                                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 min-h-[300px] flex items-center justify-center">
                                        <p className="text-gray-400 font-bold tracking-wider uppercase text-sm flex items-center gap-2">
                                            <TrendingUp size={18} /> Detailed charts rendering...
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* MESSAGES TAB */}
                            {activeTab === 'messages' && (
                                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">Customer Messages</h3>
                                    <div className="text-center py-12 text-gray-500 font-medium">
                                        <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Users size={28} className="text-purple-500" />
                                        </div>
                                        Respond to customer inquiries and monitor reviews in real-time.
                                    </div>
                                </div>
                            )}

                            {/* SETTINGS TAB */}
                            {activeTab === 'settings' && (
                                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 max-w-2xl">
                                    <h3 className="text-xl font-bold text-gray-800 mb-6">Store Settings</h3>
                                    <form className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Store Name</label>
                                            <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none" defaultValue={`${user?.displayName || 'My'} Store`} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Contact Email</label>
                                            <input type="email" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none" defaultValue={user?.email || ''} />
                                        </div>
                                        <div className="pt-4">
                                            <button type="button" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all">Save Changes</button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            {/* Product Modal */}
            {isProductModalOpen && (
                <ProductModal
                    product={editingProduct}
                    onClose={() => setIsProductModalOpen(false)}
                    onSave={fetchDashboardData}
                    sellerId={user?.uid}
                />
            )}
        </div>
    );
}

// Mini Components
const StatCard = ({ icon: Icon, title, value, color, bg }) => (
    <div className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-all">
        <div className={`p-4 rounded-[1.25rem] ${bg} ${color}`}>
            <Icon size={24} strokeWidth={2.5} />
        </div>
        <div>
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            <h4 className="text-2xl font-black text-slate-800 tracking-tight">{value}</h4>
        </div>
    </div>
);

// Product Modal Component
const ProductModal = ({ product, onClose, onSave, sellerId }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: product?.name || '',
        price: product?.price || '',
        description: product?.description || '',
        category: product?.category || 'General',
        image: product?.image || '',
        stock: product?.stock || 10,
        availability: product?.availability ?? true,
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const productData = {
                ...formData,
                price: Number(formData.price),
                stock: Number(formData.stock),
                sellerId,
                updatedAt: serverTimestamp(),
            };

            if (product?.id) {
                await setDoc(doc(db, 'products', product.id), productData, { merge: true });
            } else {
                productData.createdAt = serverTimestamp();
                // To create a new doc auth gen ID:
                const newDocRef = doc(collection(db, 'products'));
                productData.productId = newDocRef.id;
                await setDoc(newDocRef, productData);
            }
            onSave();
            onClose();
        } catch (error) {
            console.error(error);
            alert("Error saving product");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-[2rem] p-6 sm:p-8 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar">
                <h2 className="text-2xl font-black text-slate-800 mb-6">{product ? 'Edit Product' : 'Add New Product'}</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Product Name</label>
                        <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium" />
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-bold text-slate-700 mb-1">Price (₹)</label>
                            <input type="number" required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-bold text-slate-700 mb-1">Stock</label>
                            <input type="number" required value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
                        <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium">
                            <option>General</option>
                            <option>Fashion</option>
                            <option>Electronics</option>
                            <option>Home</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Image URL</label>
                        <input type="url" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} placeholder="https://..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium" />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                        <textarea rows="3" required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium resize-none"></textarea>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-slate-100">
                        <button type="button" onClick={onClose} className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors">Cancel</button>
                        <button type="submit" disabled={loading} className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50">
                            {loading ? 'Saving...' : 'Save Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
