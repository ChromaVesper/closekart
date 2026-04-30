import React, { useEffect, useState } from 'react';
import { ShoppingBag, Package, Clock, CheckCircle, XCircle, Loader, ChevronRight, MapPin, Navigation } from 'lucide-react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const STATUS_CONFIG = {
    placed: { label: 'Placed', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: Clock },
    preparing: { label: 'Preparing', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', icon: Clock },
    out_for_delivery: { label: 'Out for Delivery', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: Navigation },
    delivered: { label: 'Delivered', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', icon: XCircle },
};

const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.placed;
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.color} ${cfg.bg} ${cfg.border} uppercase tracking-wider`}>
            <Icon size={12} strokeWidth={2.5} /> {cfg.label}
        </span>
    );
};

const Orders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }
        api.get('/orders/me')
            .then(r => {
                setOrders(r.data);
            })
            .catch(err => {
                console.error("Failed to load orders:", err);
                setError('Failed to load your orders.');
            })
            .finally(() => setLoading(false));
    }, [user]);

    if (!user) {
        return (
            <div className="max-w-lg mx-auto text-center py-16 px-4">
                <ShoppingBag size={48} className="mx-auto mb-4 text-gray-300 drop-shadow-sm" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Track Your Orders</h2>
                <p className="font-medium text-gray-500 mb-6">Sign in to see your recent Zomato-style orders.</p>
                <Link to="/login" className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                    Sign In to Continue
                </Link>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 min-h-[50vh]">
                <Loader size={32} className="animate-spin text-blue-600 mb-4" />
                <p className="text-gray-500 font-medium animate-pulse">Fetching your orders...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-2xl mx-auto p-4">
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-6 font-medium text-center shadow-sm">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 px-4 py-8 mb-20 md:mb-8 font-sans">
            <div>
                <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
                    <ShoppingBag size={28} className="text-blue-600" /> My Orders
                </h1>
                <p className="text-gray-500 font-medium mt-1 ml-10">Track the status of your recent purchases.</p>
            </div>

            {orders.length === 0 ? (
                <div className="bg-white border text-center py-16 px-4 text-gray-500 rounded-3xl shadow-sm border-gray-100">
                    <Package size={56} className="mx-auto mb-4 text-gray-300 font-light" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h3>
                    <p className="text-sm font-medium mb-8 max-w-sm mx-auto">Looks like you haven't placed any orders. Start exploring nearby stores now!</p>
                    <Link to="/" className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                        Discover Nearby Stores
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map(order => (
                        <div key={order._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition duration-300 group">
                            {/* Order Header */}
                            <div className="p-5 sm:p-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-white rounded-2xl border border-gray-100 shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                                        <Package className="text-blue-600" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-gray-900 text-lg">Order #{order._id.slice(-6).toUpperCase()}</h3>
                                        <p className="text-xs text-gray-500 font-medium mt-1 flex items-center gap-1.5">
                                            <Clock size={12} />
                                            {new Date(order.createdAt).toLocaleString('en-IN', { 
                                                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between">
                                    <StatusBadge status={order.status} />
                                    <span className="text-lg font-black text-gray-900 mt-2 sm:mt-1 tracking-tight">₹{order.totalAmount}</span>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="p-5 sm:p-6 space-y-4">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Items in your order</h4>
                                {order.products?.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between group/item">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 border border-gray-100 overflow-hidden">
                                                {item.image
                                                    ? <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform" />
                                                    : <Package size={20} className="text-gray-300" />
                                                }
                                            </div>
                                            <div>
                                                <p className="text-gray-900 font-bold text-sm sm:text-base leading-tight">{item.name}</p>
                                                <p className="text-gray-500 font-medium text-xs mt-1">₹{item.price} each</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="bg-blue-50 text-blue-700 text-xs font-black px-2.5 py-1 rounded-lg">Qty: {item.quantity}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Delivery Info */}
                            {order.deliveryLocation && (
                                <div className="bg-gray-50/50 p-4 sm:p-5 border-t border-gray-100">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 mt-0.5">
                                            <MapPin size={16} className="text-indigo-500" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-900 mb-0.5">Delivery Coordinates</h4>
                                            <p className="text-xs text-gray-500 font-medium">Lat: {order.deliveryLocation.lat}, Lng: {order.deliveryLocation.lng}</p>
                                            <p className="text-[10px] text-indigo-600 font-bold mt-1 uppercase tracking-wider">Fast Delivery Active</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Orders;
