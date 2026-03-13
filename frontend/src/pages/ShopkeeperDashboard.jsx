import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db, auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import {
    LayoutDashboard, Package, ShoppingCart, Settings, LogOut,
    Plus, Edit2, Trash2, TrendingUp, Users, DollarSign, Activity,
    Bell, Search, Star, Clock, CheckCircle, XCircle, ArrowUp,
    ArrowDown, BarChart2, Eye, ChevronRight, Zap, Store,
    MapPin, Phone, Mail, Camera, ToggleLeft, ToggleRight,
    Tag, AlertTriangle, RefreshCw, Filter, Download, Calendar,
    MessageSquare, ThumbsUp, Truck, ChevronDown, Menu, X, Map as MapIcon, Loader
} from 'lucide-react';
import api from '../services/api';

const MapPicker = lazy(() => import('../components/MapPicker'));

// ─── Status Config ──────────────────────────────────────────────────────────

const STATUS_CONFIG = {
    New:        { bg: 'bg-amber-100',   text: 'text-amber-800',   border: 'border-amber-200',   dot: 'bg-amber-500',    bar: 'from-amber-400 to-orange-400' },
    Preparing:  { bg: 'bg-blue-100',    text: 'text-blue-800',    border: 'border-blue-200',    dot: 'bg-blue-500',     bar: 'from-blue-500 to-indigo-500' },
    Ready:      { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200', dot: 'bg-emerald-500',  bar: 'from-emerald-400 to-teal-400' },
    Dispatched: { bg: 'bg-violet-100',  text: 'text-violet-800',  border: 'border-violet-200',  dot: 'bg-violet-500',   bar: 'from-violet-500 to-purple-500' },
    Completed:  { bg: 'bg-slate-100',   text: 'text-slate-600',   border: 'border-slate-200',   dot: 'bg-slate-400',    bar: 'from-slate-400 to-slate-400' },
};

// ─── Helper Components ─────────────────────────────────────────────────────

const Avatar = ({ char, size = 'md', color = 'blue' }) => {
    const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg' };
    const colors = { blue: 'from-blue-500 to-indigo-600', amber: 'from-amber-500 to-orange-600', green: 'from-emerald-500 to-teal-600', purple: 'from-purple-500 to-violet-600' };
    return (
        <div className={`${sizes[size] || sizes.md} rounded-full bg-gradient-to-br ${colors[color] || colors.blue} flex items-center justify-center font-black text-white shrink-0 shadow-lg`}>
            {(char || 'S').toUpperCase()}
        </div>
    );
};

const StatCard = ({ icon: Icon, label, value, change, changeType, color, accent, prefix = '' }) => (
    <div className={`bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden`}>
        <div className={`absolute top-0 right-0 w-24 h-24 rounded-full ${accent} opacity-5 -translate-y-4 translate-x-4 group-hover:opacity-10 transition-opacity`} />
        <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl ${accent} bg-opacity-10`}>
                <Icon size={20} className={color} strokeWidth={2.5} />
            </div>
            {change !== undefined && (
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${changeType === 'up' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                    {changeType === 'up' ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                    {change}%
                </div>
            )}
        </div>
        <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
        <h3 className="text-2xl font-black text-gray-900 tracking-tight">{prefix}{value}</h3>
    </div>
);

const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Completed;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${status === 'New' ? 'animate-pulse' : ''}`} />
            {status}
        </span>
    );
};

const Stars = ({ rating }) => (
    <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
            <Star key={i} size={12} className={i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
        ))}
    </div>
);

// ─── Tab Views ─────────────────────────────────────────────────────────────

const OverviewTab = ({ orders, products, setActiveTab }) => {
    const totalRev = products.reduce((acc, p) => acc + (Number(p.price) || 0) * (p.sales || 0), 0);
    const activeOrders = orders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled').length;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={DollarSign} label="Total Revenue" value={totalRev.toLocaleString()} prefix="₹" change={12.4} changeType="up" color="text-emerald-600" accent="bg-emerald-500" />
                <StatCard icon={ShoppingCart} label="Active Orders" value={activeOrders} change={8.1} changeType="up" color="text-blue-600" accent="bg-blue-500" />
                <StatCard icon={Users} label="Total Customers" value={new Set(orders.map(o => o.customerId)).size} change={5.3} changeType="up" color="text-violet-600" accent="bg-violet-500" />
                <StatCard icon={Star} label="Avg. Rating" value="4.6" change={2.1} changeType="up" color="text-amber-500" accent="bg-amber-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-black text-gray-900">Revenue Overview</h3>
                            <p className="text-sm text-gray-400 mt-0.5">Performance trends</p>
                        </div>
                    </div>
                    <div className="h-48 bg-slate-50/50 rounded-xl border border-dashed border-gray-200 flex items-center justify-center">
                        <p className="text-gray-400 font-bold text-sm">Revenue analytics loading...</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="font-black text-gray-900">Top Products</h3>
                        <button onClick={() => setActiveTab('products')} className="text-xs text-blue-600 font-bold hover:underline">See all</button>
                    </div>
                    <div className="space-y-4">
                        {products.length === 0 ? (
                            <p className="text-gray-400 text-sm italic py-4">No products listed</p>
                        ) : products.sort((a, b) => (b.sales || 0) - (a.sales || 0)).slice(0, 4).map((p, i) => (
                            <div key={p.id} className="flex items-center gap-3">
                                <span className="text-xs font-black text-gray-300 w-4">{i + 1}</span>
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center shrink-0">
                                    <Package size={16} className="text-blue-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-900 truncate">{p.name}</p>
                                    <p className="text-xs text-gray-400">{p.sales || 0} sold</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-50 flex items-center justify-between">
                    <h3 className="font-black text-gray-900">Recent Orders</h3>
                    <button onClick={() => setActiveTab('orders')} className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                        View all <ChevronRight size={16} />
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50/80">
                                {['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Action'].map(h => (
                                    <th key={h} className="px-5 py-3 text-left text-xs font-black text-gray-400 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {orders.sort((a,b) => b.createdAt?.seconds - a.createdAt?.seconds).slice(0, 4).map(order => (
                                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-5 py-4 text-sm font-black text-gray-800">#{order.id.slice(-6).toUpperCase()}</td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2">
                                            <Avatar char={order.customerName} size="sm" />
                                            <span className="text-sm font-bold text-gray-700">{order.customerName || 'Customer'}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-sm text-gray-500 font-medium max-w-[180px] truncate">{order.items?.[0]?.name || 'Item'}{order.items?.length > 1 && ` +${order.items.length - 1}`}</td>
                                    <td className="px-5 py-4 text-sm font-black text-gray-900">₹{order.total?.toLocaleString()}</td>
                                    <td className="px-5 py-4"><StatusBadge status={order.status} /></td>
                                    <td className="px-5 py-4">
                                        <button onClick={() => setActiveTab('orders')} className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">Manage</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const OrdersTab = ({ orders }) => {
    const [filter, setFilter] = useState('All');
    const filtered = filter === 'All' ? orders : orders.filter(o => o.status === filter);

    const advance = async (id, currentStatus) => {
        const next = { New: 'Preparing', Preparing: 'Ready', Ready: 'Dispatched', Dispatched: 'Completed' };
        const nextStatus = next[currentStatus];
        if (!nextStatus) return;

        try {
            await updateDoc(doc(db, 'orders', id), { 
                status: nextStatus,
                updatedAt: serverTimestamp()
            });
        } catch (err) {
            console.error("Order status update error:", err);
        }
    };

    const reject = async (id) => {
        if (window.confirm("Reject this order?")) {
            try {
                await updateDoc(doc(db, 'orders', id), { 
                    status: 'Cancelled',
                    updatedAt: serverTimestamp()
                });
            } catch (err) {
                console.error("Order reject error:", err);
            }
        }
    };

    const actionLabel = { New: 'Accept Order', Preparing: 'Mark Ready', Ready: 'Hand to Delivery', Dispatched: 'Mark Delivered' };
    const actionColor = {
        New: 'from-amber-500 to-orange-500 shadow-amber-500/20',
        Preparing: 'from-blue-600 to-indigo-600 shadow-blue-500/20',
        Ready: 'from-emerald-500 to-teal-500 shadow-emerald-500/20',
        Dispatched: 'from-violet-600 to-purple-600 shadow-violet-500/20',
    };

    return (
        <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                    {['All', 'New', 'Preparing', 'Ready', 'Dispatched', 'Completed'].map(s => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${filter === s
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100'}`}
                        >
                            {s} {s === 'All' ? `(${orders.length})` : `(${orders.filter(o => o.status === s).length})`}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filtered.length === 0 ? (
                    <div className="col-span-full bg-white rounded-3xl border border-dashed border-gray-200 py-20 text-center">
                        <ShoppingCart size={40} className="text-gray-200 mx-auto mb-3" strokeWidth={1.5} />
                        <p className="font-bold text-gray-500">No matching orders</p>
                    </div>
                ) : filtered.map(order => (
                    <div key={order.id} className={`bg-white rounded-3xl border shadow-sm overflow-hidden hover:shadow-md transition-all ${order.status === 'New' ? 'border-amber-200 ring-1 ring-amber-100' : 'border-gray-100'}`}>
                        <div className={`h-1.5 w-full bg-gradient-to-r ${STATUS_CONFIG[order.status]?.bar || 'from-gray-400 to-gray-400'}`} />
                        <div className="p-5">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-lg font-black text-gray-900">#{order.id.slice(-6).toUpperCase()}</span>
                                        <StatusBadge status={order.status} />
                                    </div>
                                    <p className="text-xs font-bold text-gray-400">Order Placed: {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleTimeString() : 'Recently'}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-black text-gray-900">₹{order.total?.toLocaleString()}</div>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-50 text-green-700">PAID ONLINE</span>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-4 mb-4 space-y-3">
                                <div className="flex items-center gap-3">
                                    <Avatar char={order.customerName} size="sm" />
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-gray-900">{order.customerName || 'Customer'}</p>
                                        <p className="text-xs text-gray-400 truncate">{order.address || 'HSR Layout, Bengaluru'}</p>
                                    </div>
                                    <button className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-blue-600 shadow-sm">
                                        <Phone size={13} />
                                    </button>
                                </div>
                                <div className="border-t border-gray-100 pt-3 space-y-1.5">
                                    {order.items?.map((item, i) => (
                                        <div key={i} className="flex items-center justify-between text-sm">
                                            <span className="font-medium text-gray-700">{item.name} x {item.quantity || 1}</span>
                                            <span className="font-bold text-gray-900">₹{(item.price * (item.quantity || 1)).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {order.status !== 'Completed' && order.status !== 'Cancelled' && (
                                    <>
                                        <button
                                            onClick={() => advance(order.id, order.status)}
                                            className={`flex-1 bg-gradient-to-r ${actionColor[order.status] || 'from-gray-500 to-gray-600'} text-white py-3.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-[0.95]`}
                                        >
                                            {actionLabel[order.status]}
                                        </button>
                                        <button
                                            onClick={() => reject(order.id)}
                                            className="px-5 text-red-500 hover:bg-red-50 bg-white border border-gray-200 py-3.5 rounded-xl font-bold transition-all shadow-sm active:scale-[0.95]"
                                        >
                                            ✕
                                        </button>
                                    </>
                                )}
                                {order.status === 'Completed' && (
                                    <div className="flex-1 bg-emerald-50 text-emerald-700 py-3.5 rounded-xl font-bold text-sm text-center border border-emerald-100 flex items-center justify-center gap-2">
                                        <CheckCircle size={16} /> Delivered Successfully
                                    </div>
                                )}
                                {order.status === 'Cancelled' && (
                                    <div className="flex-1 bg-red-50 text-red-700 py-3.5 rounded-xl font-bold text-sm text-center border border-red-100 flex items-center justify-center gap-2">
                                        <XCircle size={16} /> Order Rejected
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ProductsTab = ({ products, setEditingProduct, setIsProductModalOpen }) => {
    const [search, setSearch] = useState('');
    const filtered = products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()));

    const toggleStock = async (id, currentVal) => {
        try {
            await updateDoc(doc(db, 'products', id), { 
                inStock: !currentVal,
                stock: !currentVal ? 25 : 0 
            });
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete product?")) {
            try { await deleteDoc(doc(db, 'products', id)); } catch (err) { console.error(err); }
        }
    };

    const openEdit = (p) => { setEditingProduct(p); setIsProductModalOpen(true); };
    const openAdd = () => { setEditingProduct(null); setIsProductModalOpen(true); };

    return (
        <div className="space-y-5">
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search items..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 shadow-sm outline-none"
                    />
                </div>
                <button
                    onClick={openAdd}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-md flex items-center gap-2 transition-all active:scale-[0.98]"
                >
                    <Plus size={18} /> Add Product
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map(p => (
                    <div key={p.id} className={`bg-white rounded-3xl border shadow-sm overflow-hidden transition-all hover:shadow-md group ${!p.inStock ? 'opacity-80' : ''}`}>
                        <div className="h-40 bg-slate-100 relative overflow-hidden">
                            {p.image ? (
                                <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-50"><Package size={48} className="text-slate-200" /></div>
                            )}
                            <div className="absolute top-3 right-3">
                                <span className="bg-white/90 backdrop-blur px-2.5 py-1 rounded-lg text-xs font-bold text-amber-500 flex items-center gap-1 shadow-sm">
                                    <Star size={12} className="fill-amber-400" /> {p.rating || 4.5}
                                </span>
                            </div>
                        </div>
                        <div className="p-5">
                            <h4 className="font-bold text-gray-900 truncate">{p.name}</h4>
                            <p className="text-xs text-gray-400 font-medium mb-4">{p.category || 'General'}</p>
                            <div className="flex items-center justify-between mb-5">
                                <span className="text-xl font-black text-gray-900">₹{p.price?.toLocaleString()}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-gray-400 uppercase">Stock</span>
                                    <button
                                        onClick={() => toggleStock(p.id, p.inStock)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${p.inStock ? 'bg-emerald-500' : 'bg-gray-300'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${p.inStock ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => openEdit(p)} className="flex-1 py-2.5 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
                                    <Edit2 size={14} /> Edit
                                </button>
                                <button onClick={() => handleDelete(p.id)} className="w-12 h-11 flex items-center justify-center text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const AnalyticsTab = ({ products, stats }) => {
    const totalRev = stats.revenue || 0;
    const categoryData = totalRev === 0 ? [] : [
        { category: 'General', revenue: totalRev, percent: 100 },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Package} label="Total Products" value={products.length} color="text-indigo-600" accent="bg-indigo-500" />
                <StatCard icon={TrendingUp} label="Total Orders" value={stats.totalOrders} color="text-blue-600" accent="bg-blue-500" />
                <StatCard icon={DollarSign} label="Total Revenue" value={totalRev.toLocaleString()} prefix="₹" color="text-emerald-600" accent="bg-emerald-500" />
                <StatCard icon={Users} label="Daily Users" value={stats.customers} color="text-amber-600" accent="bg-amber-500" />
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 sm:p-8">
                <h3 className="font-black text-gray-900 mb-6 flex items-center gap-2"><Activity size={20} className="text-blue-500" /> Performance Analytics</h3>
                <div className="h-64 bg-slate-50/50 rounded-3xl border border-dashed border-gray-200 flex flex-col items-center justify-center gap-3">
                    <TrendingUp size={48} className="text-slate-200" />
                    <p className="text-slate-400 font-bold text-sm">Detailed performance charts coming soon</p>
                </div>
                
                {categoryData.length > 0 && (
                    <div className="mt-8 space-y-4">
                        <h4 className="font-bold text-gray-900 border-t border-gray-50 pt-6 mb-4">Market Share by Category</h4>
                        {categoryData.map(c => (
                            <div key={c.category} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="font-bold text-gray-700">{c.category}</span>
                                    <span className="font-black text-gray-900">₹{c.revenue.toLocaleString()} ({c.percent}%)</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${c.percent}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const LocationTab = () => {
    const [shopLocation, setShopLocation] = useState(null);
    const [locationSaved, setLocationSaved] = useState(false);

    const handleSaveShopLocation = async ({ label, fullAddress, latitude, longitude }) => {
        try {
            await api.put('/shops/my-location', { latitude, longitude, address: fullAddress });
            setShopLocation({ lat: latitude, lng: longitude, address: fullAddress });
            setLocationSaved(true);
        } catch (err) {
            console.error(err);
            setShopLocation({ lat: latitude, lng: longitude, address: fullAddress });
            setLocationSaved(true);
        }
    };

    return (
        <div className="max-w-3xl animate-[fadeIn_0.4s_ease-out]">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                        <div className="bg-blue-100 p-2.5 rounded-2xl text-blue-600 shadow-sm flex items-center justify-center"><MapIcon size={24} /></div>
                        Shop Location
                    </h1>
                    <p className="text-gray-500 text-sm font-medium mt-3">Pinpoint your store to reach more customers nearby.</p>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-gray-100 p-1 overflow-hidden relative">
                {locationSaved && shopLocation ? (
                    <div className="p-8 space-y-6">
                        <div className="flex items-start gap-5 bg-emerald-50 border border-emerald-100 rounded-3xl p-6 shadow-tiny">
                            <CheckCircle size={28} className="text-emerald-500 shrink-0 mt-1" />
                            <div>
                                <p className="font-black text-emerald-900 text-lg mb-1">Position Locked</p>
                                <p className="text-sm font-medium text-emerald-800 leading-relaxed">{shopLocation.address}</p>
                            </div>
                        </div>
                        <button onClick={() => setLocationSaved(false)} className="px-6 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-100 transition-all">Relocate Store</button>
                    </div>
                ) : (
                    <div className="h-[550px] relative rounded-[2.2rem] overflow-hidden">
                        <Suspense fallback={<div className="h-full bg-slate-50 flex items-center justify-center"><Loader className="animate-spin text-blue-400" /></div>}>
                            <MapPicker onSave={handleSaveShopLocation} saveLabel="Verify & Save Location" />
                        </Suspense>
                    </div>
                )}
            </div>
        </div>
    );
};

const ReviewsTab = () => (
    <div className="max-w-4xl mx-auto space-y-6 opacity-60">
        <div className="bg-white rounded-[2rem] border border-dashed border-gray-200 py-20 text-center">
            <MessageSquare size={48} className="mx-auto text-slate-200 mb-4" />
            <h3 className="text-xl font-black text-slate-400">Reviews Feature Coming Soon</h3>
            <p className="text-sm text-slate-400 font-medium max-w-xs mx-auto mt-2">Collect and display customer feedback directly on your profile dashboard.</p>
        </div>
    </div>
);

const SettingsTab = ({ user, isOnline, setIsOnline }) => (
    <div className="max-w-2xl space-y-6">
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-7">
            <h3 className="font-black text-gray-900 mb-6 flex items-center gap-2"><Zap size={20} className="text-amber-500" /> Store Availability</h3>
            <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 group transition-all">
                <div>
                    <p className="font-black text-gray-900">Accepting Orders</p>
                    <p className="text-xs text-gray-500 mt-0.5">Offline stores are hidden from search</p>
                </div>
                <button
                    onClick={() => setIsOnline(!isOnline)}
                    className={`relative inline-flex h-9 w-16 items-center rounded-full transition-all focus:outline-none ${isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`}
                >
                    <span className={`inline-block h-7 w-7 transform rounded-full bg-white shadow-md transition-transform ${isOnline ? 'translate-x-[30px]' : 'translate-x-1'}`} />
                </button>
            </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-7">
            <h3 className="font-black text-gray-900 mb-6">Profile Details</h3>
            <div className="space-y-4">
                {[
                    { label: 'Store Name', val: user?.displayName || 'My Shop', icon: Store },
                    { label: 'Email Address', val: user?.email, icon: Mail },
                    { label: 'Merchant Category', val: 'Retail', icon: Tag },
                ].map(f => (
                    <div key={f.label}>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">{f.label}</label>
                        <div className="relative">
                            <f.icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                            <input readOnly value={f.val || ''} className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-bold text-gray-600 outline-none" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const ProductModal = ({ product, onClose, sellerId }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: product?.name || '',
        price: product?.price || '',
        description: product?.description || '',
        category: product?.category || 'General',
        image: product?.image || '',
        stock: product?.stock || 50,
        inStock: product?.inStock ?? true,
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = { ...formData, price: Number(formData.price), stock: Number(formData.stock), sellerId, updatedAt: serverTimestamp() };
            if (product) {
                await updateDoc(doc(db, 'products', product.id), data);
            } else {
                const newDoc = doc(collection(db, 'products'));
                await setDoc(newDoc, { ...data, createdAt: serverTimestamp(), sales: 0, rating: 4.5 });
            }
            onClose();
        } catch (err) { alert("Save error"); } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 sm:p-8 flex-1 overflow-y-auto no-scrollbar">
                    <h2 className="text-2xl font-black text-gray-900 mb-6">{product ? 'Update Item' : 'Create New Item'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Product Title</label>
                            <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Price (₹)</label>
                                <input type="number" required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Inventory Count</label>
                                <input type="number" required value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Banner Image URL</label>
                            <input value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none placeholder:text-gray-300" placeholder="https://..." />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Product Info</label>
                            <textarea rows="3" required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none resize-none" />
                        </div>
                        <div className="flex gap-3 pt-6 border-t border-slate-50">
                            <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black text-sm transition-all">Dismiss</button>
                            <button disabled={loading} className="flex-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-500/30 transition-all disabled:opacity-50">
                                {loading ? 'Saving...' : 'Deploy Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default function ShopkeeperDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [isOnline, setIsOnline] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ revenue: 0, totalOrders: 0, customers: 0 });
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    useEffect(() => {
        if (!user?.uid) { navigate('/seller-login'); return; }
        
        const qProducts = query(collection(db, 'products'), where('sellerId', '==', user.uid));
        const unsubProducts = onSnapshot(qProducts, (snap) => {
            const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setProducts(items);
            setStats(prev => ({ ...prev, revenue: items.reduce((acc, p) => acc + (Number(p.price) || 0) * (p.sales || 0), 0) }));
            setLoading(false);
        }, (err) => { console.error(err); setLoading(false); });

        const qOrders = query(collection(db, 'orders'), where('sellerId', '==', user.uid));
        const unsubOrders = onSnapshot(qOrders, (snap) => {
            const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setOrders(items);
            setStats(prev => ({ ...prev, totalOrders: items.length, customers: new Set(items.map(o => o.customerId)).size }));
        }, (err) => { console.error(err); });

        return () => { unsubProducts(); unsubOrders(); };
    }, [user, navigate]);

    const handleLogout = async () => { await signOut(auth); navigate('/seller-login'); };

    const navItems = [
        { id: 'overview',  icon: LayoutDashboard, label: 'Overview' },
        { id: 'orders',    icon: ShoppingCart,    label: 'Live Orders',   badge: orders.filter(o => o.status === 'New').length },
        { id: 'products',  icon: Package,         label: 'Catalog & Stock' },
        { id: 'location',  icon: MapPin,          label: 'Shop Location' },
        { id: 'analytics', icon: BarChart2,       label: 'Performance' },
        { id: 'settings',  icon: Settings,        label: 'Settings' },
    ];

    const tabComponents = {
        overview:  <OverviewTab orders={orders} products={products} setActiveTab={setActiveTab} />,
        orders:    <OrdersTab orders={orders} />,
        products:  <ProductsTab products={products} setEditingProduct={setEditingProduct} setIsProductModalOpen={setIsProductModalOpen} />,
        location:  <LocationTab />,
        analytics: <AnalyticsTab products={products} stats={stats} />,
        settings:  <SettingsTab user={user} isOnline={isOnline} setIsOnline={setIsOnline} />,
    };

    if (loading) return (
        <div className="h-screen w-full flex flex-col items-center justify-center gap-4 bg-slate-50">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin shadow-lg"></div>
            <p className="text-slate-400 font-black text-sm uppercase tracking-widest animate-pulse">Initializing Dashboard...</p>
        </div>
    );

    return (
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
            {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-[60] md:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />}
            <aside className={`fixed md:static inset-y-0 left-0 z-[70] w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col shadow-2xl transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/30 text-white"><Store size={22} /></div>
                    <div><h1 className="text-lg font-black text-white leading-tight">Partner Hub</h1><p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">CloseKart</p></div>
                </div>
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto no-scrollbar pt-6">
                    {navItems.map(item => (
                        <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm ${activeTab === item.id ? 'bg-white/10 text-white shadow-tiny border border-white/5' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                            <item.icon size={18} /> {item.label}
                            {item.badge > 0 && <span className="ml-auto text-[10px] font-black px-2 py-0.5 rounded-full bg-red-500 text-white shadow-sm">{item.badge}</span>}
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t border-slate-800 mt-auto bg-slate-900/50 backdrop-blur">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all font-bold text-sm"><LogOut size={18} /> Sign Out</button>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-tiny px-6 py-4 flex items-center gap-4 shrink-0 z-50">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-2.5 rounded-xl hover:bg-gray-100 text-slate-600 border border-slate-100"><Menu size={20} /></button>
                    <div><h2 className="text-xl font-black text-slate-900 tracking-tight capitalize">{activeTab.replace('-', ' ')}</h2><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5 hidden sm:block">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p></div>
                    <div className="ml-auto flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-2xl">
                           <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                           <span className="text-xs font-black text-slate-600 uppercase tracking-widest">{isOnline ? 'Active' : 'Offline'}</span>
                        </div>
                        <Avatar char={user?.displayName} size="sm" />
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
                    <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full pb-28">
                        {tabComponents[activeTab]}
                    </div>
                </main>
            </div>
            {isProductModalOpen && <ProductModal product={editingProduct} onClose={() => setIsProductModalOpen(false)} sellerId={user.uid} />}
        </div>
    );
}
