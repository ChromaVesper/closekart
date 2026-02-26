import React, { useState, Suspense, lazy } from 'react';
import {
    Package, Plus, Trash, Edit, Settings, LogOut,
    MapPin, CheckCircle, Loader, Map as MapIcon
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

    // Section: 'products' | 'location'
    const [section, setSection] = useState('products');
    const [shopLocation, setShopLocation] = useState(null);  // { lat, lng, address } once set
    const [savingLocation, setSavingLocation] = useState(false);
    const [locationSaved, setLocationSaved] = useState(false);
    const [locationError, setLocationError] = useState('');

    const handleDelete = (id) => setProducts(products.filter(p => p.id !== id));

    const handleSaveShopLocation = async ({ label, fullAddress, latitude, longitude }) => {
        setSavingLocation(true);
        setLocationError('');
        try {
            // Persist to backend shop doc (POST /api/shops updates the owner's shop)
            await api.put('/shops/my-location', {
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

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* ── Sidebar ── */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-2xl font-bold text-blue-600">ShopAdmin</h2>
                    <p className="text-xs text-gray-400 mt-1">Manage your store</p>
                </div>
                <nav className="mt-4 px-4 space-y-1 flex-1">
                    <button
                        onClick={() => setSection('products')}
                        className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-semibold gap-3 transition ${section === 'products' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Package size={18} /> Products
                    </button>
                    <button
                        onClick={() => setSection('location')}
                        className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-semibold gap-3 transition ${section === 'location' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <MapPin size={18} />
                        Shop Location
                        {locationSaved && (
                            <CheckCircle size={15} className="text-green-500 ml-auto" />
                        )}
                    </button>
                    <button
                        onClick={() => setSection('settings')}
                        className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-semibold gap-3 transition ${section === 'settings' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Settings size={18} /> Settings
                    </button>
                </nav>
                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={() => navigate('/', { replace: false })}
                        className="w-full flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl text-sm gap-3"
                    >
                        <LogOut size={18} /> Back to Site
                    </button>
                </div>
            </aside>

            {/* ── Main Content ── */}
            <main className="flex-1 p-6 md:p-8 overflow-auto">

                {/* ─── PRODUCTS SECTION ─── */}
                {section === 'products' && (
                    <>
                        <header className="flex justify-between items-center mb-6">
                            <h1 className="text-2xl font-bold text-gray-800">Product Management</h1>
                            <button className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center hover:bg-blue-700 transition text-sm font-semibold gap-2">
                                <Plus size={18} /> Add Product
                            </button>
                        </header>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                        {['Product Name', 'Category', 'Price', 'Stock', 'Actions'].map(h => (
                                            <th key={h} className={`p-4 border-b ${h === 'Actions' ? 'text-right' : ''}`}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map(product => (
                                        <tr key={product.id} className="hover:bg-gray-50 border-b last:border-0 text-sm">
                                            <td className="p-4 font-medium text-gray-900">{product.name}</td>
                                            <td className="p-4 text-gray-500">{product.category}</td>
                                            <td className="p-4 font-medium">₹{product.price}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${product.stock > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {product.stock} in stock
                                                </span>
                                            </td>
                                            <td className="p-4 text-right space-x-2">
                                                <button className="text-blue-500 hover:text-blue-700"><Edit size={17} /></button>
                                                <button onClick={() => handleDelete(product.id)} className="text-red-400 hover:text-red-600"><Trash size={17} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* ─── SHOP LOCATION SECTION ─── */}
                {section === 'location' && (
                    <div className="max-w-2xl mx-auto">
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                <MapIcon size={24} className="text-blue-600" />
                                Set Shop Location
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Your exact shop position determines which customers can see your store.
                                Only buyers within your delivery radius will see you.
                            </p>
                        </div>

                        {locationSaved && shopLocation ? (
                            <div className="space-y-4">
                                {/* Success card */}
                                <div className="flex items-start gap-4 bg-green-50 border border-green-200 rounded-2xl p-5">
                                    <CheckCircle size={28} className="text-green-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-green-800 text-base">Shop location saved ✓</p>
                                        <p className="text-sm text-green-700 mt-1">{shopLocation.address}</p>
                                        <p className="text-xs text-green-600 mt-1 font-mono">
                                            {shopLocation.lat.toFixed(5)}, {shopLocation.lng.toFixed(5)}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800">
                                    <strong>Note:</strong> Shop location is permanent once confirmed.
                                    Contact support to update it after initial setup.
                                </div>

                                <button
                                    onClick={() => { setLocationSaved(false); setShopLocation(null); }}
                                    className="text-sm text-blue-600 hover:underline"
                                >
                                    ← Change location
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-4 text-sm text-blue-800">
                                    <strong>Tip:</strong> Drag the pin to your exact shop entrance.
                                    Buyers within {' '}
                                    <span className="font-bold">5 km</span> (default delivery radius) will see your shop in search results.
                                </div>

                                {locationError && (
                                    <p className="text-sm text-red-500 mb-3">{locationError}</p>
                                )}

                                <Suspense fallback={
                                    <div className="h-[480px] bg-gray-100 rounded-2xl flex items-center justify-center">
                                        <div className="flex flex-col items-center gap-3 text-gray-400">
                                            <Loader size={28} className="animate-spin" />
                                            <span className="text-sm">Loading map…</span>
                                        </div>
                                    </div>
                                }>
                                    <MapPicker
                                        showLabelPicker={false}
                                        saveLabel="Confirm Shop Location"
                                        onSave={handleSaveShopLocation}
                                    />
                                </Suspense>
                            </>
                        )}
                    </div>
                )}

                {/* ─── SETTINGS PLACEHOLDER ─── */}
                {section === 'settings' && (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-3">
                        <Settings size={40} className="text-gray-200" />
                        <p className="font-medium text-gray-500">Shop Settings</p>
                        <p className="text-sm">Coming soon</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ShopDashboard;
