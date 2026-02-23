import React, { useEffect, useState } from 'react';
import { ShoppingBag, Package, Clock, CheckCircle, XCircle, Loader, ChevronRight, MapPin } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const STATUS_CONFIG = {
    pending: { label: 'Pending', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: Clock },
    accepted: { label: 'Accepted', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: CheckCircle },
    delivered: { label: 'Delivered', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', icon: XCircle },
    declined: { label: 'Declined', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', icon: XCircle },
};

const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
            <Icon size={11} /> {cfg.label}
        </span>
    );
};

const Orders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user) return;
        api.get('/orders/my')
            .then(r => setOrders(r.data))
            .catch(() => setError('Failed to load orders.'))
            .finally(() => setLoading(false));
    }, [user]);

    if (!user) return (
        <div className="max-w-lg mx-auto text-center py-16">
            <ShoppingBag size={48} className="mx-auto mb-4 text-gray-200" />
            <p className="font-semibold text-gray-600">Sign in to see your orders</p>
            <Link to="/login" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
                Sign In
            </Link>
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <ShoppingBag size={24} className="text-blue-600" /> My Orders
            </h1>

            {loading && (
                <div className="flex items-center justify-center py-16">
                    <Loader size={28} className="animate-spin text-blue-500" />
                </div>
            )}

            {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm">{error}</div>}

            {!loading && !error && orders.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                    <Package size={48} className="mx-auto mb-4 text-gray-200" />
                    <p className="font-semibold text-gray-500">No orders yet</p>
                    <p className="text-sm mt-1">Your placed orders will appear here.</p>
                    <Link to="/" className="mt-4 inline-block bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
                        Start Shopping
                    </Link>
                </div>
            )}

            <div className="space-y-4">
                {orders.map(order => (
                    <div key={order._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                        {/* Order header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-bold text-gray-900 text-sm">
                                    Order #{order._id.slice(-6).toUpperCase()}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                            </div>
                            <StatusBadge status={order.status} />
                        </div>

                        {/* Items */}
                        <div className="space-y-2">
                            {order.items?.slice(0, 3).map((item, i) => (
                                <div key={i} className="flex items-center gap-3 text-sm">
                                    <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                                        {item.image
                                            ? <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                                            : <Package size={14} className="text-gray-400" />
                                        }
                                    </div>
                                    <span className="flex-1 text-gray-700 font-medium truncate">{item.name || item.productName}</span>
                                    <span className="text-gray-500 text-xs shrink-0">×{item.quantity}</span>
                                    <span className="text-gray-800 font-semibold text-xs shrink-0">₹{item.price}</span>
                                </div>
                            ))}
                            {order.items?.length > 3 && (
                                <p className="text-xs text-gray-400">+{order.items.length - 3} more items</p>
                            )}
                        </div>

                        {/* Delivery address */}
                        {order.deliveryAddress && (
                            <div className="bg-gray-50 rounded-xl px-3 py-2 text-xs text-gray-500 flex items-start gap-2">
                                <MapPin size={12} className="text-gray-400 shrink-0 mt-0.5" />
                                <span className="line-clamp-2">{order.deliveryAddress.fullAddress || order.deliveryAddress}</span>
                            </div>
                        )}

                        {/* Total */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <span className="text-sm text-gray-500">Total</span>
                            <span className="font-bold text-gray-900">₹{order.totalAmount || order.total || '—'}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Orders;
