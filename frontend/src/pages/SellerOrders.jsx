import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Loader2, User, Calendar, ChevronRight } from 'lucide-react';

const SellerOrders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/orders/seller');
            setOrders(res.data);
        } catch (err) {
            console.error('Failed to fetch orders:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let interval;
        if (user) {
            fetchOrders();
            // Poll every 10 seconds for real-time feel
            interval = setInterval(fetchOrders, 10000);
        }
        return () => clearInterval(interval);
    }, [user]);

    const updateStatus = async (orderId, newStatus) => {
        try {
            await api.patch(`/orders/${orderId}/status`, { status: newStatus });
            // Optimistic update
            setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
        } catch (err) {
            console.error('Failed to update status:', err);
            alert('Could not update status');
        }
    };

    // Helper to get exactly what items were bought (since it's an array of products)
    const renderProductsSummary = (products) => {
        if (!products || products.length === 0) return 'Unknown Product';
        if (products.length === 1) return `${products[0].quantity}x ${products[0].name}`;
        return `${products[0].quantity}x ${products[0].name} + ${products.length - 1} more`;
    };

    if (loading) {
        return (
            <div className="h-64 flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-black text-gray-900">Orders Management</h2>
                <p className="text-gray-500 font-medium">Track and process your incoming customer orders.</p>
            </div>

            {orders.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-200 text-center space-y-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-400">
                        <ShoppingBag size={32} />
                    </div>
                    <p className="text-gray-500 font-medium italic">No orders received yet. Your sales will appear here!</p>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Order Details</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Items</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {orders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50 transition group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900">#{order._id.slice(-6).toUpperCase()}</span>
                                                <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium mt-1">
                                                    <Calendar size={10} /> 
                                                    {new Date(order.createdAt).toLocaleTimeString()}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                    <User size={14} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-gray-700">{order.userId?.name || 'Customer'}</span>
                                                    <span className="text-[10px] text-gray-500">{order.userId?.phone || 'No Phone'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-600 max-w-[200px] truncate">
                                            {renderProductsSummary(order.products)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider ${
                                                order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600' : 
                                                order.status === 'cancelled' ? 'bg-red-50 text-red-600' : 
                                                order.status === 'out_for_delivery' ? 'bg-blue-50 text-blue-600' : 
                                                order.status === 'preparing' ? 'bg-purple-50 text-purple-600' :
                                                'bg-orange-50 text-orange-600'
                                            }`}>
                                                {order.status || 'placed'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                            ₹{order.totalAmount || 0}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                            {order.status === 'placed' && (
                                                <button onClick={() => updateStatus(order._id, 'preparing')} className="bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition">
                                                    Accept & Prepare
                                                </button>
                                            )}
                                            {order.status === 'preparing' && (
                                                <button onClick={() => updateStatus(order._id, 'out_for_delivery')} className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-blue-700 transition">
                                                    Out for Delivery
                                                </button>
                                            )}
                                            {order.status === 'out_for_delivery' && (
                                                <button onClick={() => updateStatus(order._id, 'delivered')} className="bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition">
                                                    Mark Delivered
                                                </button>
                                            )}
                                            {['placed', 'preparing'].includes(order.status) && (
                                                <button onClick={() => updateStatus(order._id, 'cancelled')} className="bg-red-50 text-red-600 text-xs font-bold px-2 py-1.5 rounded-lg hover:bg-red-100 transition">
                                                    Cancel
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellerOrders;
