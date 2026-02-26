import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, ShoppingBag, Heart, LogOut, Edit2, Save } from 'lucide-react';
import AvatarUpload from '../components/AvatarUpload';

const API = import.meta.env.VITE_API_URL || 'https://closekart.onrender.com/api';

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ name: '', phone: '' });
    const [orders, setOrders] = useState([]);
    const [wishlistItems, setWishlistItems] = useState([]);
    const [activeTab, setActiveTab] = useState('profile');
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        setForm({ name: user.name || '', phone: user.phone || '' });
        fetchData();
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) return;
        const headers = { Authorization: `Bearer ${token}` };

        try {
            const [ordersRes, wishlistRes] = await Promise.all([
                fetch(`${API}/profile/orders`, { headers }),
                fetch(`${API}/profile/wishlist`, { headers })
            ]);

            if (ordersRes.ok) {
                const ordersData = await ordersRes.json();
                setOrders(Array.isArray(ordersData) ? ordersData : []);
            }

            if (wishlistRes.ok) {
                const wishData = await wishlistRes.json();
                // Handle both { products: [...] } and [...] formats
                setWishlistItems(Array.isArray(wishData) ? wishData : (wishData?.products || []));
            }
        } catch (err) {
            console.error('Profile fetch error:', err);
        }
        setLoading(false);
    };

    const handleUpdate = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API}/user/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                setEditing(false);
                window.location.reload();
            }
        } catch (err) { console.error(err); }
        setSaving(false);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto">
            {/* Profile Header */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 h-32"></div>
                <div className="px-8 pb-6 -mt-12">
                    <div className="flex items-end space-x-6">
                        <AvatarUpload
                            currentAvatar={user.avatar}
                            onUpload={() => window.location.reload()}
                        />
                        <div className="flex-1 pt-14">
                            <h1 className="text-2xl font-bold text-gray-900">{user.name || 'CloseKart User'}</h1>
                            <p className="text-gray-500 text-sm">{user.email || user.phone || ''}</p>
                        </div>
                        <button
                            onClick={() => navigate('/edit-profile', { replace: false })}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition font-medium mt-14 mr-2"
                        >
                            <Edit2 size={16} />
                            <span>Edit</span>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium mt-14"
                        >
                            <LogOut size={16} />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-white rounded-xl shadow-sm p-1 mb-6">
                {[
                    { key: 'profile', label: 'Profile', icon: User },
                    { key: 'orders', label: 'Orders', icon: ShoppingBag },
                    { key: 'wishlist', label: 'Wishlist', icon: Heart },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg font-medium transition ${activeTab === tab.key
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <tab.icon size={18} />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                        <button
                            onClick={() => editing ? handleUpdate() : setEditing(true)}
                            disabled={saving}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                        >
                            {editing ? <Save size={16} /> : <Edit2 size={16} />}
                            <span>{editing ? (saving ? 'Saving...' : 'Save') : 'Edit'}</span>
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                            {editing ? (
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                                />
                            ) : (
                                <p className="text-lg text-gray-900 font-medium">{user.name || '—'}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                            <div className="flex items-center space-x-2">
                                <Mail size={16} className="text-gray-400" />
                                <p className="text-lg text-gray-900">{user.email || '—'}</p>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                            {editing ? (
                                <input
                                    type="tel"
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                                />
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <Phone size={16} className="text-gray-400" />
                                    <p className="text-lg text-gray-900">{user.phone || '—'}</p>
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Account Type</label>
                            <p className="text-lg text-gray-900 capitalize">{user.provider || 'local'}</p>
                        </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <p className="text-sm text-gray-400">Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</p>
                    </div>
                </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">My Orders</h2>
                    {loading ? (
                        <p className="text-center text-gray-400 py-8">Loading orders...</p>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-12">
                            <ShoppingBag size={48} className="text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">No orders yet</p>
                            <p className="text-gray-400 text-sm mt-1">Start shopping to see your orders here</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order, i) => (
                                <div key={order._id || i} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                                    <div className="flex justify-between items-center">
                                        <p className="font-medium">Order #{order._id?.slice(-6)}</p>
                                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium capitalize">{order.status || 'placed'}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}</p>
                                    {order.totalAmount && <p className="text-sm font-bold text-green-600 mt-1">₹{order.totalAmount}</p>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">My Wishlist</h2>
                    {loading ? (
                        <p className="text-center text-gray-400 py-8">Loading wishlist...</p>
                    ) : wishlistItems.length === 0 ? (
                        <div className="text-center py-12">
                            <Heart size={48} className="text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">Your wishlist is empty</p>
                            <p className="text-gray-400 text-sm mt-1">Save items you love for later</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {wishlistItems.map((item, i) => (
                                <div key={i} className="border border-gray-200 rounded-lg p-4 flex items-center space-x-4 hover:shadow-md transition">
                                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                                        ) : (
                                            <Heart size={24} className="text-red-400" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{item.name || 'Product'}</p>
                                        <p className="text-sm text-blue-600 font-bold">₹{item.price || '—'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Profile;
