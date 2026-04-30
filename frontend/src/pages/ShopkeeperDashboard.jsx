import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db, auth } from '../firebase';
import { signOut } from 'firebase/auth';
import {
    collection, doc, setDoc, getDoc, updateDoc, addDoc, deleteDoc,
    query, where, onSnapshot, serverTimestamp, orderBy
} from 'firebase/firestore';
import {
    LayoutDashboard, Package, ShoppingCart, Settings, LogOut,
    Plus, Edit2, Trash2, TrendingUp, Users, DollarSign, Star,
    CheckCircle, XCircle, ArrowUp, ArrowDown, Store,
    MapPin, Phone, Tag, ToggleLeft, ToggleRight, AlertTriangle,
    Menu, X, Loader, Navigation, Image as ImageIcon, Archive,
    Clock, Truck, ChevronRight, Search, RefreshCw, Mail,
    AlertCircle, FileText, BarChart2
} from 'lucide-react';

// ─── Firestore Collections ────────────────────────────────────────────────────
const SHOPS_COL = 'shops';
const PRODUCTS_COL = 'products';
const ORDERS_COL = 'orders';

// ─── Status Config ────────────────────────────────────────────────────────────
const ORDER_STATUSES = ['received', 'preparing', 'ready', 'out_for_delivery', 'completed', 'cancelled'];
const STATUS_LABELS = {
    received: 'Received',
    preparing: 'Preparing',
    ready: 'Ready',
    out_for_delivery: 'On The Way',
    completed: 'Completed',
    cancelled: 'Cancelled',
};
const STATUS_STYLES = {
    received:        { bg: 'bg-amber-100',   text: 'text-amber-800',   dot: 'bg-amber-500', bar: 'from-amber-400 to-orange-400', btn: 'from-amber-500 to-orange-500' },
    preparing:       { bg: 'bg-blue-100',    text: 'text-blue-800',    dot: 'bg-blue-500 animate-pulse', bar: 'from-blue-500 to-indigo-500', btn: 'from-blue-600 to-indigo-600' },
    ready:           { bg: 'bg-green-100',   text: 'text-green-800',   dot: 'bg-green-500', bar: 'from-green-400 to-teal-400', btn: 'from-green-500 to-teal-500' },
    out_for_delivery:{ bg: 'bg-violet-100',  text: 'text-violet-800',  dot: 'bg-violet-500', bar: 'from-violet-500 to-purple-500', btn: 'from-violet-600 to-purple-600' },
    completed:       { bg: 'bg-slate-100',   text: 'text-slate-600',   dot: 'bg-slate-400', bar: 'from-slate-300 to-slate-400', btn: '' },
    cancelled:       { bg: 'bg-red-100',     text: 'text-red-700',     dot: 'bg-red-400', bar: 'from-red-300 to-red-400', btn: '' },
};
const NEXT_STATUS = { received: 'preparing', preparing: 'ready', ready: 'out_for_delivery', out_for_delivery: 'completed' };
const NEXT_BTN_LABEL = { received: 'Start Preparing', preparing: 'Mark Ready', ready: 'Send for Delivery', out_for_delivery: 'Mark Delivered' };

// ─── Small Helpers ────────────────────────────────────────────────────────────
const Avatar = ({ char, size = 'md' }) => {
    const s = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-xl' }[size];
    return (
        <div className={`${s} rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-black text-white shrink-0`}>
            {(char || 'S')[0].toUpperCase()}
        </div>
    );
};

const StatCard = ({ icon: Icon, label, value, prefix = '', change, up, color, bg }) => (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-start justify-between mb-3">
            <div className={`p-3 rounded-xl ${bg}`}><Icon size={20} className={color} strokeWidth={2.5} /></div>
            {change !== undefined && (
                <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${up ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                    {up ? <ArrowUp size={10} /> : <ArrowDown size={10} />}{change}%
                </span>
            )}
        </div>
        <p className="text-sm font-medium text-gray-400 mb-1">{label}</p>
        <h3 className="text-2xl font-black text-gray-900">{prefix}{typeof value === 'number' ? value.toLocaleString() : value}</h3>
    </div>
);

const StatusBadge = ({ status }) => {
    const s = STATUS_STYLES[status] || STATUS_STYLES.cancelled;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${s.bg} ${s.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{STATUS_LABELS[status] || status}
        </span>
    );
};

const Input = ({ label, icon: Icon, ...props }) => (
    <div className="space-y-1.5">
        {label && <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>}
        <div className="relative">
            {Icon && <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />}
            <input className={`w-full ${Icon ? 'pl-11' : 'pl-4'} pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300`} {...props} />
        </div>
    </div>
);

const Select = ({ label, children, ...props }) => (
    <div className="space-y-1.5">
        {label && <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>}
        <select className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-sm outline-none focus:ring-2 focus:ring-blue-500/20" {...props}>{children}</select>
    </div>
);

const Textarea = ({ label, ...props }) => (
    <div className="space-y-1.5">
        {label && <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>}
        <textarea className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-sm outline-none focus:ring-2 focus:ring-blue-500/20 resize-none" {...props} />
    </div>
);

// ─── OVERVIEW TAB ─────────────────────────────────────────────────────────────
const OverviewTab = ({ orders, products, shop, setActiveTab }) => {
    const revenue = orders.filter(o => o.status === 'completed').reduce((s, o) => s + (o.total || 0), 0);
    const activeOrders = orders.filter(o => !['completed', 'cancelled'].includes(o.status)).length;
    const customers = new Set(orders.map(o => o.customerId)).size;

    return (
        <div className="space-y-6">
            {/* Store status banner */}
            {shop && !shop.isOpen && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 text-amber-800">
                    <AlertCircle size={20} className="shrink-0" />
                    <p className="font-bold text-sm">Your store is <strong>Offline</strong> — customers cannot see or place orders. Toggle it open in Settings.</p>
                </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={DollarSign} label="Total Revenue" value={revenue} prefix="₹" change={12} up color="text-emerald-600" bg="bg-emerald-50" />
                <StatCard icon={ShoppingCart} label="Active Orders" value={activeOrders} change={8} up color="text-blue-600" bg="bg-blue-50" />
                <StatCard icon={Users} label="Customers" value={customers} change={5} up color="text-violet-600" bg="bg-violet-50" />
                <StatCard icon={Package} label="Products" value={products.length} color="text-amber-600" bg="bg-amber-50" />
            </div>

            {/* Top products */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="font-black text-gray-900">Recent Orders</h3>
                        <button onClick={() => setActiveTab('orders')} className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1">View all <ChevronRight size={14} /></button>
                    </div>
                    {orders.length === 0 ? (
                        <div className="py-12 text-center"><ShoppingCart size={36} className="text-gray-200 mx-auto mb-2" /><p className="text-gray-400 font-medium text-sm">No orders yet</p></div>
                    ) : (
                        <div className="space-y-3">
                            {orders.slice(0, 5).map(o => (
                                <div key={o.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                                    <Avatar char={o.customerName} size="sm" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-800 truncate">{o.customerName || 'Customer'}</p>
                                        <p className="text-xs text-gray-400">{(o.items || []).map(i => i.name).join(', ')}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-sm font-black text-gray-900">₹{o.total?.toLocaleString()}</p>
                                        <StatusBadge status={o.status} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="font-black text-gray-900">Top Products</h3>
                        <button onClick={() => setActiveTab('products')} className="text-xs text-blue-600 font-bold hover:underline">See all</button>
                    </div>
                    {products.length === 0 ? (
                        <div className="py-12 text-center"><Package size={36} className="text-gray-200 mx-auto mb-2" /><p className="text-gray-400 text-sm">No products yet</p></div>
                    ) : (
                        <div className="space-y-4">
                            {products.slice(0, 5).map((p, i) => (
                                <div key={p.id} className="flex items-center gap-3">
                                    <span className="text-xs font-black text-gray-300 w-4">{i + 1}</span>
                                    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                                        {p.image ? <img src={p.image} className="w-full h-full object-cover rounded-xl" alt="" /> : <Package size={16} className="text-blue-400" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-900 truncate">{p.name}</p>
                                        <p className="text-xs text-gray-400">₹{p.price?.toLocaleString()}</p>
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.inStock ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>{p.inStock ? 'In Stock' : 'Out'}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─── MY SHOP TAB ──────────────────────────────────────────────────────────────
const MyShopTab = ({ user, shop, onShopSave }) => {
    const [form, setForm] = useState({
        shopName: '', ownerName: '', phone: '', category: 'Grocery',
        address: '', city: '', pincode: '', shopImage: '', lat: '', lng: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [locating, setLocating] = useState(false);

    useEffect(() => {
        if (shop) {
            setForm({
                shopName: shop.shopName || '',
                ownerName: shop.ownerName || '',
                phone: shop.phone || '',
                category: shop.category || 'Grocery',
                address: shop.address || '',
                city: shop.city || '',
                pincode: shop.pincode || '',
                shopImage: shop.shopImage || '',
                lat: shop.lat || '',
                lng: shop.lng || '',
            });
        }
    }, [shop]);

    const autoLocate = () => {
        if (!navigator.geolocation) { alert('Geolocation not supported'); return; }
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            pos => { setForm(f => ({ ...f, lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) })); setLocating(false); },
            () => { alert('Could not get location. Please enable location access.'); setLocating(false); }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const shopRef = doc(db, SHOPS_COL, user.uid);
            const data = { ...form, ownerId: user.uid, updatedAt: serverTimestamp() };
            const snap = await getDoc(shopRef);
            if (snap.exists()) {
                await updateDoc(shopRef, data);
            } else {
                await setDoc(shopRef, { ...data, isOpen: true, createdAt: serverTimestamp() });
            }
            setSuccess(true);
            onShopSave({ id: user.uid, ...form, isOpen: snap.exists() ? shop?.isOpen : true });
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error(err);
            alert('Error saving shop. Check console.');
        } finally { setLoading(false); }
    };

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    return (
        <div className="max-w-3xl">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-blue-50 rounded-2xl"><Store size={24} className="text-blue-600" /></div>
                <div><h2 className="text-2xl font-black text-gray-900">My Shop</h2><p className="text-sm text-gray-400 mt-0.5">Configure your store profile and location</p></div>
            </div>

            {success && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-700 font-bold text-sm">
                    <CheckCircle size={18} /> Shop details saved successfully!
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Input label="Shop Name" icon={Store} required value={form.shopName} onChange={e => set('shopName', e.target.value)} placeholder="e.g. Fresh Mart" />
                    <Input label="Owner Name" icon={Tag} required value={form.ownerName} onChange={e => set('ownerName', e.target.value)} placeholder="Your full name" />
                    <Input label="Phone Number" icon={Phone} required type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" />
                    <Select label="Shop Category" value={form.category} onChange={e => set('category', e.target.value)}>
                        {['Grocery', 'Electronics', 'Fashion', 'Pharmacy', 'Bakery', 'Restaurant', 'Stationary', 'Others'].map(c => <option key={c}>{c}</option>)}
                    </Select>
                    <div className="md:col-span-2">
                        <Input label="Street Address" icon={MapPin} required value={form.address} onChange={e => set('address', e.target.value)} placeholder="Street name, Area, Landmark..." />
                    </div>
                    <Input label="City" required value={form.city} onChange={e => set('city', e.target.value)} placeholder="e.g. Bengaluru" />
                    <Input label="Pincode" required type="text" value={form.pincode} onChange={e => set('pincode', e.target.value)} placeholder="e.g. 560001" />
                    <div className="md:col-span-2">
                        <Input label="Shop Banner Image URL" icon={ImageIcon} value={form.shopImage} onChange={e => set('shopImage', e.target.value)} placeholder="https://..." />
                    </div>
                </div>

                {/* Location Section */}
                <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-black text-gray-800 flex items-center gap-2"><MapPin size={16} className="text-blue-500" />Shop Location <span className="text-red-500">*</span></h4>
                            <p className="text-xs text-gray-500 mt-0.5">Required for nearby buyers to find your shop</p>
                        </div>
                        <button type="button" onClick={autoLocate} disabled={locating} className="flex items-center gap-2 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl transition disabled:opacity-60">
                            {locating ? <Loader size={13} className="animate-spin" /> : <Navigation size={13} />}
                            {locating ? 'Detecting...' : 'Use My Location'}
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Latitude" type="number" step="any" required value={form.lat} onChange={e => set('lat', e.target.value)} placeholder="e.g. 28.6139" />
                        <Input label="Longitude" type="number" step="any" required value={form.lng} onChange={e => set('lng', e.target.value)} placeholder="e.g. 77.2090" />
                    </div>
                    {form.lat && form.lng && (
                        <p className="text-xs text-emerald-700 font-bold flex items-center gap-1"><CheckCircle size={12} />Location set: {Number(form.lat).toFixed(4)}, {Number(form.lng).toFixed(4)}</p>
                    )}
                </div>

                <div className="flex justify-end pt-2">
                    <button type="submit" disabled={loading} className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-blue-500/20 transition disabled:opacity-50">
                        {loading ? 'Saving...' : shop ? 'Update Shop' : 'Create Shop'}
                    </button>
                </div>
            </form>
        </div>
    );
};

// ─── ADD PRODUCT TAB ──────────────────────────────────────────────────────────
const AddProductTab = ({ user, editingProduct, setEditingProduct }) => {
    const blank = { name: '', price: '', category: 'General', description: '', image: '', stock: 50, inStock: true };
    const [form, setForm] = useState(blank);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (editingProduct) setForm({ ...blank, ...editingProduct });
        else setForm(blank);
    }, [editingProduct]);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = { ...form, price: Number(form.price), stock: Number(form.stock), shopId: user.uid, updatedAt: serverTimestamp() };
            if (editingProduct?.id) {
                await updateDoc(doc(db, PRODUCTS_COL, editingProduct.id), data);
            } else {
                await addDoc(collection(db, PRODUCTS_COL), { ...data, createdAt: serverTimestamp() });
            }
            setSuccess(true);
            setForm(blank);
            setEditingProduct(null);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error(err);
            alert('Error saving product.');
        } finally { setLoading(false); }
    };

    return (
        <div className="max-w-2xl">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-indigo-50 rounded-2xl"><Plus size={24} className="text-indigo-600" /></div>
                <div>
                    <h2 className="text-2xl font-black text-gray-900">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
                    <p className="text-sm text-gray-400 mt-0.5">Add items your customers can order</p>
                </div>
                {editingProduct && <button onClick={() => { setEditingProduct(null); setForm(blank); }} className="ml-auto text-sm text-gray-500 hover:text-gray-700 font-bold px-3 py-2 rounded-xl bg-gray-100">Cancel Edit</button>}
            </div>

            {success && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-700 font-bold text-sm">
                    <CheckCircle size={18} />Product {editingProduct ? 'updated' : 'added'} successfully!
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-5">
                <Input label="Product Name" required value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Butter Chicken" />
                <div className="grid grid-cols-2 gap-5">
                    <Input label="Price (₹)" type="number" required min="0" value={form.price} onChange={e => set('price', e.target.value)} placeholder="e.g. 250" />
                    <Input label="Stock Count" type="number" required min="0" value={form.stock} onChange={e => set('stock', e.target.value)} placeholder="e.g. 50" />
                </div>
                <Select label="Category" value={form.category} onChange={e => set('category', e.target.value)}>
                    {['General', 'Food', 'Grocery', 'Electronics', 'Fashion', 'Beverages', 'Snacks', 'Dairy', 'Others'].map(c => <option key={c}>{c}</option>)}
                </Select>
                <Input label="Product Image URL" icon={ImageIcon} value={form.image} onChange={e => set('image', e.target.value)} placeholder="https://..." />
                <Textarea label="Description" required rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Briefly describe the product..." />
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div><p className="font-bold text-gray-800 text-sm">Available in Stock</p><p className="text-xs text-gray-400">Toggle off to hide from customers</p></div>
                    <button type="button" onClick={() => set('inStock', !form.inStock)} className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${form.inStock ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${form.inStock ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
                <div className="flex justify-end pt-2">
                    <button type="submit" disabled={loading} className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-indigo-500/20 transition disabled:opacity-50">
                        {loading ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
                    </button>
                </div>
            </form>
        </div>
    );
};

// ─── MANAGE PRODUCTS TAB ──────────────────────────────────────────────────────
const ManageProductsTab = ({ products, onEdit }) => {
    const [search, setSearch] = useState('');
    const filtered = products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()));

    const toggleStock = async (id, current) => {
        try { await updateDoc(doc(db, PRODUCTS_COL, id), { inStock: !current, updatedAt: serverTimestamp() }); }
        catch (e) { console.error(e); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this product?')) return;
        try { await deleteDoc(doc(db, PRODUCTS_COL, id)); }
        catch (e) { console.error(e); }
    };

    return (
        <div className="space-y-5">
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 shadow-sm outline-none" />
                </div>
                <span className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-500 shadow-sm flex items-center">{filtered.length} items</span>
            </div>

            {filtered.length === 0 ? (
                <div className="bg-white rounded-3xl border border-dashed border-gray-200 py-20 text-center">
                    <Package size={40} className="text-gray-200 mx-auto mb-3" strokeWidth={1.5} />
                    <p className="font-bold text-gray-400">No products found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filtered.map(p => (
                        <div key={p.id} className={`bg-white rounded-3xl border shadow-sm overflow-hidden hover:shadow-md transition-all ${!p.inStock ? 'opacity-75' : 'border-gray-100'}`}>
                            <div className="h-40 bg-slate-100 relative overflow-hidden">
                                {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-50"><Package size={48} className="text-slate-200" /></div>
                                )}
                                <div className="absolute top-3 right-3">
                                    <button onClick={() => toggleStock(p.id, p.inStock)} className={`px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm ${p.inStock ? 'bg-emerald-500 text-white' : 'bg-red-100 text-red-600'}`}>
                                        {p.inStock ? 'In Stock' : 'Out of Stock'}
                                    </button>
                                </div>
                            </div>
                            <div className="p-5">
                                <h4 className="font-bold text-gray-900 truncate">{p.name}</h4>
                                <p className="text-xs text-gray-400 mb-3">{p.category} · Stock: {p.stock}</p>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xl font-black text-gray-900">₹{p.price?.toLocaleString()}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => onEdit(p)} className="flex-1 py-2.5 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-100 transition flex items-center justify-center gap-2">
                                        <Edit2 size={14} />Edit
                                    </button>
                                    <button onClick={() => handleDelete(p.id)} className="w-11 h-10 flex items-center justify-center text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition">
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ─── ORDERS TAB ───────────────────────────────────────────────────────────────
const OrdersTab = ({ orders }) => {
    const [filter, setFilter] = useState('all');
    const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

    const advanceStatus = async (id, current) => {
        const next = NEXT_STATUS[current];
        if (!next) return;
        try { await updateDoc(doc(db, ORDERS_COL, id), { status: next, updatedAt: serverTimestamp() }); }
        catch (e) { console.error(e); }
    };

    const cancelOrder = async (id) => {
        if (!window.confirm('Cancel this order?')) return;
        try { await updateDoc(doc(db, ORDERS_COL, id), { status: 'cancelled', updatedAt: serverTimestamp() }); }
        catch (e) { console.error(e); }
    };

    const counts = ORDER_STATUSES.reduce((acc, s) => ({ ...acc, [s]: orders.filter(o => o.status === s).length }), { all: orders.length });

    return (
        <div className="space-y-5">
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm overflow-x-auto">
                <div className="flex gap-2 min-w-max">
                    {[['all', 'All'], ...ORDER_STATUSES.map(s => [s, STATUS_LABELS[s]])].map(([val, label]) => (
                        <button key={val} onClick={() => setFilter(val)} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${filter === val ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-100'}`}>
                            {label} ({counts[val] || 0})
                        </button>
                    ))}
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="bg-white rounded-3xl border border-dashed border-gray-200 py-20 text-center">
                    <ShoppingCart size={40} className="text-gray-200 mx-auto mb-3" strokeWidth={1.5} />
                    <p className="font-bold text-gray-400">No {filter === 'all' ? '' : STATUS_LABELS[filter]?.toLowerCase()} orders</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {filtered.map(order => {
                        const s = STATUS_STYLES[order.status] || STATUS_STYLES.cancelled;
                        const isActive = !['completed', 'cancelled'].includes(order.status);
                        return (
                            <div key={order.id} className={`bg-white rounded-3xl border shadow-sm overflow-hidden hover:shadow-md transition-all ${order.status === 'received' ? 'border-amber-200 ring-1 ring-amber-100' : 'border-gray-100'}`}>
                                <div className={`h-1.5 w-full bg-gradient-to-r ${s.bar}`} />
                                <div className="p-5 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-lg font-black text-gray-900">#{order.id.slice(-6).toUpperCase()}</p>
                                            <p className="text-xs text-gray-400 font-medium mt-0.5">
                                                {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString('en-IN') : 'Just now'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-black text-gray-900">₹{order.total?.toLocaleString()}</p>
                                            <StatusBadge status={order.status} />
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                                        <div className="flex items-center gap-3 mb-3">
                                            <Avatar char={order.customerName} size="sm" />
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{order.customerName || 'Customer'}</p>
                                                <p className="text-xs text-gray-400 truncate">{order.deliveryAddress || 'Address not specified'}</p>
                                            </div>
                                        </div>
                                        <div className="border-t border-gray-100 pt-3 space-y-1">
                                            {(order.items || []).map((item, i) => (
                                                <div key={i} className="flex justify-between text-sm">
                                                    <span className="text-gray-700 font-medium">{item.name} × {item.quantity || 1}</span>
                                                    <span className="font-bold text-gray-900">₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {isActive && (
                                        <div className="flex gap-2">
                                            {NEXT_STATUS[order.status] && (
                                                <button onClick={() => advanceStatus(order.id, order.status)} className={`flex-1 bg-gradient-to-r ${s.btn} text-white py-3.5 rounded-xl font-bold text-sm shadow-md transition active:scale-[0.97]`}>
                                                    {NEXT_BTN_LABEL[order.status]}
                                                </button>
                                            )}
                                            <button onClick={() => cancelOrder(order.id)} className="px-4 text-red-500 hover:bg-red-50 bg-white border border-gray-200 rounded-xl font-bold transition">✕</button>
                                        </div>
                                    )}
                                    {order.status === 'completed' && (
                                        <div className="flex items-center justify-center gap-2 py-3 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-sm border border-emerald-100">
                                            <CheckCircle size={16} />Delivered Successfully
                                        </div>
                                    )}
                                    {order.status === 'cancelled' && (
                                        <div className="flex items-center justify-center gap-2 py-3 bg-red-50 text-red-700 rounded-xl font-bold text-sm border border-red-100">
                                            <XCircle size={16} />Order Cancelled
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// ─── INVENTORY TAB ────────────────────────────────────────────────────────────
const InventoryTab = ({ products }) => {
    const updateStock = async (id, newStock) => {
        const n = parseInt(newStock, 10);
        if (isNaN(n) || n < 0) return;
        try { await updateDoc(doc(db, PRODUCTS_COL, id), { stock: n, inStock: n > 0, updatedAt: serverTimestamp() }); }
        catch (e) { console.error(e); }
    };

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-50 flex items-center justify-between">
                    <h3 className="font-black text-gray-900 flex items-center gap-2"><Archive size={18} className="text-blue-500" />Inventory Management</h3>
                    <span className="text-xs font-bold text-gray-400">{products.length} items</span>
                </div>
                {products.length === 0 ? (
                    <div className="py-20 text-center"><Package size={40} className="text-gray-200 mx-auto mb-3" /><p className="text-gray-400 font-medium">No products to manage</p></div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {products.map(p => (
                            <div key={p.id} className="flex items-center gap-4 p-5 hover:bg-gray-50/50 transition">
                                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                                    {p.image ? <img src={p.image} alt="" className="w-full h-full object-cover" /> : <Package size={18} className="text-gray-400" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-900 truncate">{p.name}</p>
                                    <p className="text-xs text-gray-400">{p.category} · ₹{p.price?.toLocaleString()}</p>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <input
                                        type="number" min="0"
                                        defaultValue={p.stock}
                                        onBlur={e => updateStock(p.id, e.target.value)}
                                        className="w-20 text-center py-2 bg-white border border-gray-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                                    />
                                    <button onClick={() => updateStock(p.id, p.inStock ? 0 : 25)} className={`px-3 py-2 rounded-xl text-xs font-bold transition ${p.inStock ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>
                                        {p.inStock ? 'In Stock' : 'Out of Stock'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── SETTINGS TAB ─────────────────────────────────────────────────────────────
const SettingsTab = ({ user, shop, isOnline, setIsOnline }) => {
    const toggleShop = async () => {
        const newVal = !isOnline;
        setIsOnline(newVal);
        try { await updateDoc(doc(db, SHOPS_COL, user.uid), { isOpen: newVal, updatedAt: serverTimestamp() }); }
        catch (e) { setIsOnline(!newVal); console.error(e); }
    };

    return (
        <div className="max-w-2xl space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
                <h3 className="font-black text-gray-900 mb-6 flex items-center gap-2"><ToggleRight size={20} className="text-blue-500" />Store Availability</h3>
                <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                        <p className="font-black text-gray-900">Accepting Orders</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {isOnline ? 'Your store is live and accepting orders from nearby customers.' : 'Your store is offline — hidden from search.'}
                        </p>
                    </div>
                    <button onClick={toggleShop} className={`relative inline-flex h-9 w-16 items-center rounded-full transition-all ${isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                        <span className={`inline-block h-7 w-7 transform rounded-full bg-white shadow-md transition-transform ${isOnline ? 'translate-x-[30px]' : 'translate-x-1'}`} />
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
                <h3 className="font-black text-gray-900 mb-6">Account Details</h3>
                <div className="space-y-4">
                    {[
                        { label: 'Store Name', val: shop?.shopName || 'Not set', icon: Store },
                        { label: 'Email Address', val: user?.email || '', icon: Mail },
                        { label: 'Category', val: shop?.category || 'Not set', icon: Tag },
                        { label: 'City', val: shop?.city || 'Not set', icon: MapPin },
                    ].map(f => (
                        <div key={f.label}>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">{f.label}</label>
                            <div className="relative">
                                <f.icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                <input readOnly value={f.val} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-gray-600 outline-none" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export default function ShopkeeperDashboard() {
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [shop, setShop] = useState(null);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOnline, setIsOnline] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // Guard: seller only
    useEffect(() => {
        if (!user) { navigate('/seller-login'); return; }
    }, [user, navigate]);

    // Live shop data
    useEffect(() => {
        if (!user) return;
        const shopRef = doc(db, SHOPS_COL, user.uid);
        const unsub = onSnapshot(shopRef, snap => {
            if (snap.exists()) {
                const d = { id: snap.id, ...snap.data() };
                setShop(d);
                setIsOnline(d.isOpen ?? false);
            } else {
                setShop(null);
                // Immediately navigate unconfigured sellers to creation portal
                navigate('/setup-shop', { replace: true });
            }
            setLoading(false);
        }, err => { console.error(err); setLoading(false); });
        return unsub;
    }, [user]);

    // Live products
    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, PRODUCTS_COL), where('shopId', '==', user.uid));
        const unsub = onSnapshot(q, snap => {
            setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        }, console.error);
        return unsub;
    }, [user]);

    // Live orders
    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, ORDERS_COL), where('shopId', '==', user.uid), orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q, snap => {
            setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        }, err => {
            // Fallback without orderBy (no composite index needed)
            const q2 = query(collection(db, ORDERS_COL), where('shopId', '==', user.uid));
            onSnapshot(q2, s2 => setOrders(s2.docs.map(d => ({ id: d.id, ...d.data() }))));
        });
        return unsub;
    }, [user]);

    const handleLogout = async () => { await signOut(auth); navigate('/seller-login'); };

    const newOrderCount = orders.filter(o => o.status === 'received').length;

    const navItems = [
        { id: 'overview',   icon: LayoutDashboard, label: 'Overview' },
        { id: 'myshop',     icon: Store,           label: 'My Shop' },
        { id: 'addproduct', icon: Plus,            label: 'Add Product' },
        { id: 'products',   icon: Package,         label: 'Manage Products' },
        { id: 'orders',     icon: ShoppingCart,    label: 'Orders', badge: newOrderCount },
        { id: 'inventory',  icon: Archive,         label: 'Inventory' },
        { id: 'settings',   icon: Settings,        label: 'Settings' },
    ];

    const tabContent = {
        overview:   <OverviewTab orders={orders} products={products} shop={shop} setActiveTab={setActiveTab} />,
        myshop:     <MyShopTab user={user} shop={shop} onShopSave={setShop} />,
        addproduct: <AddProductTab user={user} editingProduct={editingProduct} setEditingProduct={setEditingProduct} />,
        products:   <ManageProductsTab products={products} onEdit={p => { setEditingProduct(p); setActiveTab('addproduct'); }} />,
        orders:     <OrdersTab orders={orders} />,
        inventory:  <InventoryTab products={products} />,
        settings:   <SettingsTab user={user} shop={shop} isOnline={isOnline} setIsOnline={setIsOnline} />,
    };

    if (loading) return (
        <div className="h-screen w-full flex flex-col items-center justify-center gap-4 bg-slate-50">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin shadow-lg" />
            <p className="text-slate-400 font-black text-sm uppercase tracking-widest animate-pulse">Loading Dashboard...</p>
        </div>
    );

    return (
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
            {/* Sidebar overlay */}
            {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-[60] md:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />}

            {/* Sidebar */}
            <aside className={`fixed md:static inset-y-0 left-0 z-[70] w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col shadow-2xl transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg text-white"><Store size={22} /></div>
                    <div><h1 className="text-lg font-black text-white leading-tight">Partner Hub</h1><p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">CloseKart</p></div>
                </div>

                {/* Shop status pill */}
                <div className="px-4 py-3 border-b border-slate-800">
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold ${isOnline ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                        <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                        {isOnline ? 'Store Online' : 'Store Offline'}
                    </div>
                </div>

                <nav className="flex-1 p-3 space-y-1 overflow-y-auto pt-4">
                    {navItems.map(item => (
                        <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm ${activeTab === item.id ? 'bg-white/10 text-white border border-white/5' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                            <item.icon size={18} />{item.label}
                            {item.badge > 0 && <span className="ml-auto text-[10px] font-black px-2 py-0.5 rounded-full bg-red-500 text-white">{item.badge}</span>}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                    <div className="flex items-center gap-3 px-3 py-2 mb-3">
                        <Avatar char={user?.displayName || user?.email} size="sm" />
                        <div className="min-w-0"><p className="text-xs font-black text-white truncate">{user?.displayName || 'Shopkeeper'}</p><p className="text-[10px] text-slate-400 truncate">{user?.email}</p></div>
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-400 hover:bg-red-500/10 font-bold text-sm transition">
                        <LogOut size={16} />Sign Out
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center gap-4 shrink-0 z-50">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-2.5 rounded-xl hover:bg-gray-100 text-slate-600 border border-slate-100"><Menu size={20} /></button>
                    <div>
                        <h2 className="text-xl font-black text-slate-900 capitalize">{navItems.find(n => n.id === activeTab)?.label || activeTab}</h2>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest hidden sm:block">
                            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                    <div className="ml-auto flex items-center gap-3">
                        {newOrderCount > 0 && (
                            <button onClick={() => setActiveTab('orders')} className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-100 rounded-xl text-red-700 font-bold text-sm animate-pulse">
                                <ShoppingCart size={15} />{newOrderCount} New Order{newOrderCount > 1 ? 's' : ''}!
                            </button>
                        )}
                        <Avatar char={user?.displayName || user?.email} size="sm" />
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
                    <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full pb-28">
                        {!shop && activeTab !== 'myshop' && (
                            <div className="mb-6 p-5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-800">
                                <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-black text-sm">Shop not set up yet</p>
                                    <p className="text-xs mt-0.5 font-medium">Please <button onClick={() => setActiveTab('myshop')} className="underline font-black">set up your shop</button> first before adding products or receiving orders.</p>
                                </div>
                            </div>
                        )}
                        {tabContent[activeTab]}
                    </div>
                </main>
            </div>
        </div>
    );
}
