import React, { useEffect, useState } from 'react';
import { getOrders, acceptOrder, declineOrder } from '../../api/swapKeeperApi';
import { ShoppingBag, CheckCircle, XCircle, Clock, Package } from 'lucide-react';

const STATUS_CONFIG = {
    pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock },
    accepted: { label: 'Accepted', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    declined: { label: 'Declined', color: 'bg-red-100 text-red-700', icon: XCircle },
    completed: { label: 'Completed', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
};

const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
            <Icon size={12} /> {cfg.label}
        </span>
    );
};

const SwapKeeperOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionId, setActionId] = useState(null);

    const loadOrders = () => {
        setLoading(true);
        getOrders()
            .then(setOrders)
            .catch(() => setError('Failed to load orders'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadOrders(); }, []);

    const handleAccept = async (id) => {
        setActionId(id);
        try {
            await acceptOrder(id);
            setOrders(prev => prev.map(o => o._id === id ? { ...o, status: 'accepted' } : o));
        } catch {
            alert('Failed to accept order');
        } finally {
            setActionId(null);
        }
    };

    const handleDecline = async (id) => {
        if (!window.confirm('Decline this order?')) return;
        setActionId(id);
        try {
            await declineOrder(id);
            setOrders(prev => prev.map(o => o._id === id ? { ...o, status: 'declined' } : o));
        } catch {
            alert('Failed to decline order');
        } finally {
            setActionId(null);
        }
    };

    const pendingCount = orders.filter(o => o.status === 'pending').length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {orders.length} total orders
                        {pendingCount > 0 && <span className="ml-2 text-amber-600 font-semibold">· {pendingCount} pending action</span>}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 space-y-4">
                        {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />)}
                    </div>
                ) : error ? (
                    <div className="p-6 text-sm text-red-600 bg-red-50">{error}</div>
                ) : orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
                        <ShoppingBag size={48} className="text-gray-200" />
                        <p className="font-medium">No orders yet</p>
                        <p className="text-sm">Orders will appear here when customers place them</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Item</th>
                                    <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Buyer</th>
                                    <th className="text-center px-4 py-3.5 font-semibold text-gray-600">Status</th>
                                    <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Date</th>
                                    <th className="text-center px-4 py-3.5 font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {orders.map(order => (
                                    <tr key={order._id} className="hover:bg-gray-50/60 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                                                    <Package size={16} className="text-indigo-300" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800">
                                                        {order.itemId?.title || 'Deleted Item'}
                                                    </p>
                                                    {order.itemId?.price && (
                                                        <p className="text-xs text-gray-400">₹{order.itemId.price.toLocaleString()}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <p className="font-medium text-gray-700">{order.buyerId?.name || 'Unknown'}</p>
                                            <p className="text-xs text-gray-400">{order.buyerId?.email || order.buyerId?.phone || ''}</p>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <StatusBadge status={order.status} />
                                        </td>
                                        <td className="px-4 py-4 text-gray-500 text-xs">
                                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                day: '2-digit', month: 'short', year: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-4 py-4">
                                            {order.status === 'pending' ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleAccept(order._id)}
                                                        disabled={actionId === order._id}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors"
                                                    >
                                                        <CheckCircle size={13} /> Accept
                                                    </button>
                                                    <button
                                                        onClick={() => handleDecline(order._id)}
                                                        disabled={actionId === order._id}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-red-100 hover:bg-red-200 disabled:opacity-50 text-red-600 text-xs font-semibold rounded-lg transition-colors"
                                                    >
                                                        <XCircle size={13} /> Decline
                                                    </button>
                                                </div>
                                            ) : (
                                                <p className="text-center text-xs text-gray-400 italic">No action needed</p>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SwapKeeperOrders;
