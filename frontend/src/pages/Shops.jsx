import React, { useEffect, useState, Suspense, lazy } from 'react';
import { MapPin, Store, Star, Loader, Navigation, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAddress } from '../context/AddressContext';

const ShopMap = lazy(() => import('../components/ShopMap'));

const RADIUS_OPTIONS = [
    { label: '1 km', value: 1000 },
    { label: '3 km', value: 3000 },
    { label: '5 km', value: 5000 },
    { label: '10 km', value: 10000 },
];

const Shops = () => {
    const { activeCoords, selectedAddress } = useAddress();
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [radius, setRadius] = useState(5000);
    const [mapView, setMapView] = useState(false);

    useEffect(() => {
        if (!activeCoords) return;
        setLoading(true);
        setError('');
        api.get('/shops', { params: { lat: activeCoords.latitude, lng: activeCoords.longitude, radius } })
            .then(r => setShops(r.data))
            .catch(() => setError('Failed to load nearby shops.'))
            .finally(() => setLoading(false));
    }, [activeCoords, radius]);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Store size={24} className="text-blue-600" /> Nearby Shops
                    </h1>
                    {selectedAddress && (
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                            <MapPin size={13} />
                            {selectedAddress.city || selectedAddress.fullAddress}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm">
                        <SlidersHorizontal size={13} className="text-gray-400" />
                        <select value={radius} onChange={e => setRadius(Number(e.target.value))}
                            className="text-sm font-medium text-gray-700 bg-transparent focus:outline-none cursor-pointer">
                            {RADIUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                    <button onClick={() => setMapView(v => !v)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition border
                            ${mapView ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
                        <MapPin size={14} /> {mapView ? 'List' : 'Map'}
                    </button>
                </div>
            </div>

            {!activeCoords && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
                    <Navigation size={32} className="mx-auto mb-3 text-amber-400" />
                    <p className="font-semibold text-amber-800">No location selected</p>
                    <p className="text-sm text-amber-600 mt-1">Click the address chip in the navbar to set your delivery location.</p>
                </div>
            )}

            {loading && (
                <div className="flex items-center justify-center py-16">
                    <Loader size={28} className="animate-spin text-blue-500" />
                </div>
            )}

            {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm">{error}</div>}

            {!loading && activeCoords && !error && (
                mapView ? (
                    <Suspense fallback={<div className="h-[450px] bg-gray-100 rounded-2xl animate-pulse" />}>
                        <ShopMap shops={shops} userLocation={activeCoords} radius={radius} />
                    </Suspense>
                ) : (
                    shops.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">
                            <Store size={48} className="mx-auto mb-4 text-gray-200" />
                            <p className="font-semibold text-gray-500">No shops found within {radius / 1000} km</p>
                            <p className="text-sm mt-1">Try increasing the radius or changing your address.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {shops.map(shop => (
                                <Link key={shop._id} to={`/shop/${shop._id}`}
                                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-blue-200 transition-all">
                                    <div className="flex items-start gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                                            {shop.shopImage
                                                ? <img src={shop.shopImage} alt={shop.shopName} className="w-full h-full object-cover rounded-xl" />
                                                : <Store size={22} className="text-blue-500" />
                                            }
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-gray-900 truncate">{shop.shopName}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{shop.category}</p>
                                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                                                <span className="flex items-center gap-1"><Star size={11} className="text-amber-400" /> {shop.rating}</span>
                                                {shop.distanceKm != null && (
                                                    <span className="flex items-center gap-1"><MapPin size={11} /> {shop.distanceKm.toFixed(1)} km</span>
                                                )}
                                                {shop.deliveryAvailable && (
                                                    <span className="text-green-600 font-medium">🛵 Delivery</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )
                )
            )}
        </div>
    );
};

export default Shops;
