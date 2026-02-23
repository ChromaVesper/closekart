import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Package, ShoppingBag, Clock, CheckCircle, TrendingUp, ArrowUpRight, Map, LayoutGrid, SlidersHorizontal, MapPin } from 'lucide-react';
import { getDashboard } from '../../api/swapKeeperApi';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUserLocation } from '../../context/LocationContext';
import api from '../../services/api';

// Lazy-load Leaflet map
const ShopMap = lazy(() => import('../../components/ShopMap'));

const RADIUS_OPTIONS = [
    { label: '1 km', value: 1000 },
    { label: '3 km', value: 3000 },
    { label: '5 km', value: 5000 },
    { label: '10 km', value: 10000 },
    { label: '20 km', value: 20000 },
];

const StatCard = ({ label, value, icon: Icon, color, bg, to }) => (
    <Link to={to} className="group relative flex flex-col justify-between p-6 rounded-2xl shadow-sm border border-gray-100 bg-white hover:shadow-md transition-all overflow-hidden">
        <div className="flex items-center justify-between mb-4">
            <div className={`${bg} ${color} p-3 rounded-xl`}>
                <Icon size={22} />
            </div>
            <span className="text-gray-400 group-hover:text-indigo-500 transition-colors">
                <ArrowUpRight size={18} />
            </span>
        </div>
        <div>
            <p className="text-3xl font-extrabold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-1 font-medium">{label}</p>
        </div>
    </Link>
);

const SwapKeeperDashboard = () => {
    const { user } = useAuth();
    const { coords, locationName } = useUserLocation();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mapView, setMapView] = useState(false);
    const [radius, setRadius] = useState(5000);
    const [nearbyShops, setNearbyShops] = useState([]);
    const [shopsLoading, setShopsLoading] = useState(false);

    useEffect(() => {
        getDashboard()
            .then(setStats)
            .catch(() => setError('Failed to load dashboard'))
            .finally(() => setLoading(false));
    }, []);

    // Fetch nearby shops when map view opens or radius changes
    useEffect(() => {
        if (!mapView || !coords) return;
        setShopsLoading(true);
        api.get('/shops', {
            params: { lat: coords.latitude, lng: coords.longitude, radius }
        })
            .then(r => setNearbyShops(r.data))
            .catch(console.error)
            .finally(() => setShopsLoading(false));
    }, [mapView, coords, radius]);

    const cards = [
        { label: 'Total Items', key: 'totalItems', icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-100/80', to: '/swapkeeper/items' },
        { label: 'Total Orders', key: 'totalOrders', icon: ShoppingBag, color: 'text-emerald-600', bg: 'bg-emerald-100/80', to: '/swapkeeper/orders' },
        { label: 'Pending Orders', key: 'pendingOrders', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100/80', to: '/swapkeeper/orders' },
        { label: 'Accepted', key: 'acceptedOrders', icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-100/80', to: '/swapkeeper/orders' },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Welcome back, {user?.name?.split(' ')[0] || 'Keeper'} 👋
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Here's what's happening with your store today.</p>
                </div>
                <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-4 py-2 rounded-xl text-sm font-semibold">
                    <TrendingUp size={16} />
                    SwapKeeper Dashboard
                </div>
            </div>

            {/* Stat Cards */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-36 bg-gray-100 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm">{error}</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                    {cards.map(({ label, key, icon, color, bg, to }) => (
                        <StatCard key={key} label={label} value={stats?.[key] ?? 0} icon={icon} color={color} bg={bg} to={to} />
                    ))}
                </div>
            )}

            {/* ── Nearby Shops Map Section ─────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                {/* Map section header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            {mapView ? '🗺️ Nearby Shops — Map' : 'Nearby Shops'}
                        </h2>
                        {coords && locationName && (
                            <p className="text-sm text-gray-400 mt-0.5 flex items-center gap-1">
                                <MapPin size={12} /> {locationName}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        {mapView && (
                            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm">
                                <SlidersHorizontal size={13} className="text-gray-400" />
                                <select
                                    value={radius}
                                    onChange={(e) => setRadius(Number(e.target.value))}
                                    className="text-sm font-medium text-gray-700 bg-transparent focus:outline-none cursor-pointer"
                                >
                                    {RADIUS_OPTIONS.map(o => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* View toggle */}
                        <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1">
                            <button
                                onClick={() => setMapView(false)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition
                                    ${!mapView ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <LayoutGrid size={13} /> Grid
                            </button>
                            <button
                                onClick={() => setMapView(true)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition
                                    ${mapView ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <Map size={13} /> Map
                            </button>
                        </div>
                    </div>
                </div>

                {mapView ? (
                    /* Map View */
                    <Suspense fallback={
                        <div className="h-[450px] bg-gray-50 rounded-xl flex items-center justify-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
                        </div>
                    }>
                        {coords ? (
                            shopsLoading ? (
                                <div className="h-[450px] bg-gray-50 rounded-xl flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
                                </div>
                            ) : (
                                <ShopMap shops={nearbyShops} userLocation={coords} radius={radius} />
                            )
                        ) : (
                            <div className="h-[450px] bg-gray-50 border border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-3 text-gray-400">
                                <MapPin size={36} className="text-gray-300" />
                                <p className="font-medium text-gray-500">Location permission required</p>
                                <p className="text-sm text-center px-8">Allow location access in your browser to see nearby shops on the map</p>
                            </div>
                        )}
                    </Suspense>
                ) : (
                    /* Quick links grid */
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Link to="/swapkeeper/items" className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md hover:border-indigo-200 transition-all group">
                            <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                <Package size={20} />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800 text-sm">Manage Items</p>
                                <p className="text-xs text-gray-400">Add, edit or remove items</p>
                            </div>
                        </Link>
                        <Link to="/swapkeeper/orders" className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md hover:border-emerald-200 transition-all group">
                            <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                <ShoppingBag size={20} />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800 text-sm">View Orders</p>
                                <p className="text-xs text-gray-400">Accept or decline requests</p>
                            </div>
                        </Link>
                        <Link to="/swapkeeper/profile" className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all group">
                            <div className="bg-blue-100 text-blue-600 p-2 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <Package size={20} />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800 text-sm">Shop Profile</p>
                                <p className="text-xs text-gray-400">Update your store info</p>
                            </div>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SwapKeeperDashboard;
