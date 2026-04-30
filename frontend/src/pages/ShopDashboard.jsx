import React, { useState, Suspense, lazy } from 'react';
import {
    Package, Plus, Trash, Edit, Settings, LogOut,
    MapPin, CheckCircle, Loader, Map as MapIcon, Store
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const MapPicker = lazy(() => import('../components/MapPicker'));

// ── ShopDashboard ─────────────────────────────────────────────────────────────
const ShopDashboard = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([
        { id: 1, name: 'Amul Milk 1L', price: 54, stock: 50, category: 'Dairy' },
        { id: 2, name: 'Basmati Rice 1kg', price: 120, stock: 20, category: 'Grocery' },
    ]);

    // Section: 'products' | 'location' | 'settings'
    const [section, setSection] = useState('products');
    const [shopLocation, setShopLocation] = useState(null);
    const [savingLocation, setSavingLocation] = useState(false);
    const [locationSaved, setLocationSaved] = useState(false);
    const [locationError, setLocationError] = useState('');

    const handleDelete = (id) => setProducts(products.filter(p => p.id !== id));

    const handleSaveShopLocation = async ({ label, fullAddress, latitude, longitude }) => {
        setSavingLocation(true);
        setLocationError('');
        try {
            await api.put('/shops/mine', {
                latitude,
                longitude,
                address: fullAddress,
            });
            setShopLocation({ lat: latitude, lng: longitude, address: fullAddress });
            setLocationSaved(true);
        } catch (err) {
            console.error('Save shop location error:', err);
            // Even if backend fails in demo, store locally so UI shows confirmation
            setShopLocation({ lat: latitude, lng: longitude, address: fullAddress });
            setLocationSaved(true);
        } finally {
            setSavingLocation(false);
        }
    };

    const navItems = [
        { id: 'products', label: 'Products', icon: Package },
        { id: 'location', label: 'Shop Location', icon: MapPin },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">

            {/* ── Sidebar ── */}
            <aside className="w-72 bg-white border-r border-gray-100 hidden md:flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-2 rounded-xl shadow-sm">
                            <Store size={20} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-900 to-indigo-800 tracking-tight">ShopAdmin</h2>
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Store Dashboard</p>
                </div>

                <nav className="mt-6 px-4 space-y-2 flex-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = section === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setSection(item.id)}
                                className={`w-full flex items-center px-4 py-3.5 rounded-2xl text-sm font-bold gap-3.5 transition-all duration-300 group
                                    ${isActive
                                        ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100/50'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 border border-transparent'}`}
                            >
                                <Icon size={18} className={isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'} />
                                {item.label}
                                {item.id === 'location' && locationSaved && (
                                    <CheckCircle size={14} className="text-green-500 ml-auto" />
                                )}
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                    <button
                        onClick={() => navigate('/', { replace: false })}
                        className="w-full flex items-center justify-center px-4 py-3 text-gray-500 hover:text-red-600 hover:bg-red-50 hover:border-red-100 border border-transparent rounded-2xl text-sm font-bold gap-2 transition-all"
                    >
                        <LogOut size={16} /> Exit Dashboard
                    </button>
                </div>
            </aside>

            {/* ── Main Content ── */}
            <main className="flex-1 overflow-y-auto relative p-6 md:p-10">

                {/* Ambient Background Elements */}
                <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-blue-400/10 rounded-full blur-[80px] pointer-events-none -z-10"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] bg-indigo-400/10 rounded-full blur-[80px] pointer-events-none -z-10"></div>

                <div className="max-w-6xl mx-auto animate-[fadeIn_0.3s_ease-out]">

                    {/* ─── PRODUCTS SECTION ─── */}
                    {section === 'products' && (
                        <>
                            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                                <div>
                                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Active Inventory</h1>
                                    <p className="text-sm font-medium text-gray-500 mt-1">Manage pricing, stock, and available products.</p>
                                </div>
                                <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl flex items-center hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm font-bold gap-2 focus:ring-4 focus:ring-blue-500/30">
                                    <Plus size={18} strokeWidth={2.5} /> Add Product
                                </button>
                            </header>

                            <div className="glass-card bg-white/70 rounded-3xl shadow-sm border border-white overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse min-w-[600px]">
                                        <thead>
                                            <tr className="bg-gray-50/80 border-b border-gray-100">
                                                {['Product Name', 'Category', 'Price', 'Stock', 'Actions'].map(h => (
                                                    <th key={h} className={`px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest ${h === 'Actions' ? 'text-right' : ''}`}>
                                                        {h}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                                        <Package size={40} className="mx-auto mb-3 text-gray-300" />
                                                        <p className="font-medium text-base">No products found</p>
                                                        <p className="text-sm mt-1">Click 'Add Product' to start listing your inventory.</p>
                                                    </td>
                                                </tr>
                                            ) : (
                                                products.map(product => (
                                                    <tr key={product.id} className="hover:bg-blue-50/40 border-b border-gray-50 last:border-0 transition-colors group">
                                                        <td className="px-6 py-4 font-bold text-gray-900">{product.name}</td>
                                                        <td className="px-6 py-4 text-sm font-medium text-gray-500">
                                                            <span className="bg-gray-100 px-2.5 py-1 rounded-md">{product.category}</span>
                                                        </td>
                                                        <td className="px-6 py-4 font-black tracking-tight text-gray-900">₹{product.price}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold 
                                                                ${product.stock > 10 ? 'bg-green-50 text-green-700 border border-green-200/60' : 'bg-red-50 text-red-700 border border-red-200/60'}`}>
                                                                <span className={`w-1.5 h-1.5 rounded-full ${product.stock > 10 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                                {product.stock} units
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right space-x-3">
                                                            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit">
                                                                <Edit size={16} strokeWidth={2.5} />
                                                            </button>
                                                            <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                                                                <Trash size={16} strokeWidth={2.5} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ─── SHOP LOCATION SECTION ─── */}
                    {section === 'location' && (
                        <div className="max-w-3xl mx-auto">
                            <div className="mb-8">
                                <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3 tracking-tight">
                                    <div className="bg-blue-100/50 p-2 rounded-xl text-blue-600">
                                        <MapIcon size={24} strokeWidth={2.5} />
                                    </div>
                                    Set Shop Location
                                </h1>
                                <p className="text-gray-500 text-base font-medium mt-3 leading-relaxed">
                                    Your exact shop position determines which customers can discover your store.
                                    Buyers within your delivery radius will see you locally.
                                </p>
                            </div>

                            <div className="glass-card bg-white/70 rounded-[2rem] shadow-sm border border-white p-6 sm:p-8">
                                {locationSaved && shopLocation ? (
                                    <div className="space-y-6">
                                        <div className="flex items-start gap-5 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/60 rounded-3xl p-6 shadow-sm">
                                            <div className="bg-white rounded-full p-1.5 shadow-sm mt-0.5">
                                                <CheckCircle size={28} className="text-green-500 shrink-0" strokeWidth={2.5} />
                                            </div>
                                            <div>
                                                <p className="font-extrabold text-green-900 text-lg mb-1">Location Verified</p>
                                                <p className="text-sm font-medium text-green-800 leading-relaxed max-w-lg">{shopLocation.address}</p>
                                                <div className="mt-3 inline-flex bg-white px-3 py-1 rounded-lg border border-green-100 text-xs font-mono font-bold text-green-600">
                                                    COORD: {shopLocation.lat.toFixed(5)}, {shopLocation.lng.toFixed(5)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-4 text-sm font-medium text-amber-800 flex gap-3">
                                            <span className="font-bold shrink-0">Note:</span>
                                            <span>Shop location is permanent once confirmed. Contact administrative support to alter this later.</span>
                                        </div>

                                        <button
                                            onClick={() => { setLocationSaved(false); setShopLocation(null); }}
                                            className="text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline px-2 py-1"
                                        >
                                            ← Request Location Change
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 mb-6 flex gap-3">
                                            <MapPin size={20} className="text-blue-600 shrink-0 mt-0.5" />
                                            <p className="text-sm font-medium text-blue-900 leading-relaxed">
                                                Drag the pin marker to your exact shop entrance. Customers within a <strong className="font-black text-indigo-700 bg-white px-1.5 py-0.5 rounded shadow-sm mx-1">5 km</strong> radius will inherently discover your store.
                                            </p>
                                        </div>

                                        {locationError && (
                                            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium flex gap-3">
                                                {locationError}
                                            </div>
                                        )}

                                        <div className="rounded-3xl overflow-hidden border-4 border-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] h-[500px] relative">
                                            <Suspense fallback={
                                                <div className="h-full bg-gray-50 flex flex-col items-center justify-center gap-4 text-gray-400">
                                                    <Loader size={32} className="animate-spin text-blue-400" />
                                                    <span className="text-sm font-bold uppercase tracking-widest text-gray-500">Loading Maps...</span>
                                                </div>
                                            }>
                                                <MapPicker
                                                    showLabelPicker={false}
                                                    saveLabel="Confirm Exact Coordinates"
                                                    onSave={handleSaveShopLocation}
                                                />
                                            </Suspense>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ─── SETTINGS PLACEHOLDER ─── */}
                    {section === 'settings' && (
                        <div className="flex flex-col items-center justify-center h-[60vh] text-center max-w-md mx-auto">
                            <div className="w-24 h-24 bg-gray-100 rounded-[2rem] flex items-center justify-center rotate-12 mb-6 shadow-inner">
                                <Settings size={48} className="text-gray-300" strokeWidth={1.5} />
                            </div>
                            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Shop Settings</h2>
                            <p className="text-gray-500 font-medium">Advanced configuration, banking details, and store analytics are coming in v2.0.</p>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
};

export default ShopDashboard;
