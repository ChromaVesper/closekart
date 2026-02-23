import React, { useState, useEffect, Suspense, lazy } from 'react';
import api from '../services/api';
import { MapPin, ShoppingBag, Store, LayoutGrid, Map, SlidersHorizontal, RefreshCw, Package, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import ShopCard from '../components/ShopCard';
import { useUserLocation } from '../context/LocationContext';
import { useAddress } from '../context/AddressContext';

// Lazy-load so Leaflet only loads when Map View is opened
const ShopMap = lazy(() => import('../components/ShopMap'));

const RADIUS_OPTIONS = [
    { label: '1 km', value: 1000 },
    { label: '3 km', value: 3000 },
    { label: '5 km', value: 5000 },
    { label: '10 km', value: 10000 },
    { label: '20 km', value: 20000 },
];

const Home = () => {
    // AddressContext coords take priority; fall back to raw GPS from LocationContext
    const { coords: gpsCoords, locationName } = useUserLocation();
    const { activeCoords, selectedAddress } = useAddress();
    const coords = activeCoords || gpsCoords;

    const [shops, setShops] = useState([]);
    const [allShops, setAllShops] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [prodLoading, setProdLoading] = useState(false);
    const [mapView, setMapView] = useState(false);
    const [radius, setRadius] = useState(5000);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const params = {};
                if (coords?.latitude && coords?.longitude) {
                    params.lat = coords.latitude;
                    params.lng = coords.longitude;
                    params.radius = radius;
                }
                const res = await api.get('/shops', { params });
                setAllShops(res.data);
                setShops(res.data.slice(0, 6));
            } catch (error) {
                console.error('Error fetching shops', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [coords?.latitude, coords?.longitude, radius, refreshKey]);

    // ── Fetch nearby products ──────────────────────────────────────────────────
    useEffect(() => {
        if (!coords?.latitude || !coords?.longitude) return;
        setProdLoading(true);
        api.get('/products/nearby', {
            params: { lat: coords.latitude, lng: coords.longitude, radius },
        })
            .then(r => setProducts(r.data))
            .catch(() => setProducts([]))
            .finally(() => setProdLoading(false));
    }, [coords?.latitude, coords?.longitude, radius, refreshKey]);

    // Display label — prefer selected address label, else GPS name
    const locationLabel = selectedAddress
        ? `${selectedAddress.label}: ${selectedAddress.fullAddress.split(',')[0]}`
        : locationName;

    return (
        <div className="space-y-8 pb-12">
            {/* Hero */}
            <section className="bg-blue-600 text-white rounded-2xl p-8 md:p-12 shadow-lg relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                    <div className="inline-block bg-blue-700 text-blue-100 text-xs font-bold px-2 py-1 rounded mb-4">
                        NOW LIVE IN YOUR AREA
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
                        Discover What's <br />
                        <span className="text-yellow-300">Closest, Fastest, &amp; Best</span>
                    </h1>
                    <p className="text-lg text-blue-100 mb-8 max-w-lg">
                        Compare prices, check real-time stock, and find delivery options from shops nearby.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link to="/search" className="bg-white text-blue-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition shadow-md flex items-center justify-center">
                            <ShoppingBag className="mr-2" size={20} /> Find Products
                        </Link>
                        <Link to="/search?type=shops" className="bg-blue-700 text-white border border-blue-500 font-bold py-3 px-6 rounded-lg hover:bg-blue-800 transition shadow-md flex items-center justify-center">
                            <Store className="mr-2" size={20} /> Explore Shops
                        </Link>
                    </div>
                </div>
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
                <div className="absolute bottom-0 right-20 -mb-10 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
            </section>

            {/* Categories */}
            <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Shop by Category</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {['Grocery', 'Dairy', 'Electronics', 'Stationery', 'Mobile Repair', 'Fashion'].map((cat) => (
                        <Link key={cat} to={`/search?category=${cat}`}
                            className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 flex flex-col items-center justify-center text-center h-32 group">
                            <div className="bg-blue-50 text-blue-600 p-3 rounded-full mb-2 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <ShoppingBag size={24} />
                            </div>
                            <span className="font-medium text-gray-700 group-hover:text-blue-600 transition-colors">{cat}</span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ── Nearby Products ─────────────────────────────────── */}
            <section>
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <Package size={22} className="text-blue-500" /> Products Near You
                        </h2>
                        {coords && (
                            <p className="text-sm text-gray-500 mt-0.5">
                                {products.length} items from shops within {radius / 1000} km
                            </p>
                        )}
                    </div>
                    <Link to="/search" className="text-blue-600 font-medium hover:underline text-sm">View All →</Link>
                </div>

                {!coords ? (
                    <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl py-10 text-center text-gray-400">
                        <Package size={36} className="mx-auto mb-3 text-gray-200" />
                        <p className="font-medium text-gray-500">Set your delivery address to see nearby products</p>
                    </div>
                ) : prodLoading ? (
                    <div className="flex justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                    </div>
                ) : products.length === 0 ? (
                    <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl py-10 text-center text-gray-400">
                        <Package size={36} className="mx-auto mb-3 text-gray-200" />
                        <p className="font-medium text-gray-500">No products found nearby</p>
                        <p className="text-xs mt-1">Shops in your area may not have listed products yet</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {products.slice(0, 20).map(product => (
                            <Link
                                key={product._id}
                                to={`/shop/${product.shop?._id}`}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all overflow-hidden group"
                            >
                                {/* Product image */}
                                <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                                    {product.image ? (
                                        <img src={product.image} alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    ) : (
                                        <div className="flex flex-col items-center text-gray-200 p-4">
                                            <Package size={32} />
                                        </div>
                                    )}
                                </div>
                                {/* Product info */}
                                <div className="p-3">
                                    <p className="font-bold text-gray-900 text-sm truncate">{product.name}</p>
                                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                        <Tag size={9} /> {product.category}
                                    </p>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-blue-700 font-extrabold text-sm">₹{product.price}</span>
                                        {product.availability
                                            ? <span className="text-xs text-green-600 font-semibold">In stock</span>
                                            : <span className="text-xs text-red-400">Out</span>
                                        }
                                    </div>
                                    {product.shop?.shopName && (
                                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1 truncate">
                                            <Store size={9} /> {product.shop.shopName}
                                            {product.shop.distanceKm != null && ` · ${product.shop.distanceKm} km`}
                                        </p>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* Nearby Shops — Grid/Map Toggle */}
            <section>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                            {mapView ? '🗺️ Map View' : 'Shops Near You'}
                        </h2>
                        {locationLabel && (
                            <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                                <MapPin size={13} className="text-blue-500" />
                                {locationLabel}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Radius filter */}
                        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm text-sm">
                            <SlidersHorizontal size={15} className="text-gray-400" />
                            <select value={radius} onChange={(e) => setRadius(Number(e.target.value))}
                                className="text-sm font-medium text-gray-700 bg-transparent focus:outline-none cursor-pointer">
                                {RADIUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>
                        {/* Refresh */}
                        <button onClick={() => setRefreshKey(k => k + 1)}
                            className="p-2 bg-white border border-gray-200 rounded-xl shadow-sm text-gray-500 hover:text-blue-600 hover:border-blue-300 transition" title="Refresh shops">
                            <RefreshCw size={16} />
                        </button>
                        {/* Grid / Map toggle */}
                        <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1">
                            <button onClick={() => setMapView(false)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition
                                    ${!mapView ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                                <LayoutGrid size={15} /> Grid
                            </button>
                            <button onClick={() => setMapView(true)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition
                                    ${mapView ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                                <Map size={15} /> Map
                            </button>
                        </div>
                    </div>
                </div>

                {!mapView && (
                    <div className="flex justify-end mb-4">
                        <Link to="/search?type=shops" className="text-blue-600 font-medium hover:underline text-sm">View All →</Link>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                    </div>
                ) : mapView ? (
                    <Suspense fallback={
                        <div className="h-[500px] bg-gray-100 rounded-2xl flex items-center justify-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
                        </div>
                    }>
                        {coords
                            ? <ShopMap shops={allShops} userLocation={coords} radius={radius} />
                            : (
                                <div className="h-[500px] bg-gray-50 border border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center gap-3 text-gray-400">
                                    <MapPin size={40} className="text-gray-300" />
                                    <p className="font-medium text-gray-500">Select a delivery address or allow location access</p>
                                    <p className="text-sm">Click the address chip in the navbar to set your location</p>
                                </div>
                            )
                        }
                    </Suspense>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {shops.length > 0
                            ? shops.map(shop => <ShopCard key={shop._id} shop={shop} />)
                            : (
                                <div className="col-span-full text-center text-gray-500 py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <MapPin size={28} className="mx-auto mb-2 text-gray-300" />
                                    <p className="font-medium">No shops found nearby</p>
                                    <p className="text-sm mt-1">Try increasing the radius, or set a delivery address in the navbar</p>
                                </div>
                            )
                        }
                    </div>
                )}
            </section>
        </div>
    );
};

export default Home;
