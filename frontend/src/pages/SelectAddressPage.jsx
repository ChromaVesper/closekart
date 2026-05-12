import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAddress } from '../context/AddressContext';
import { MapPin, Navigation, CheckCircle, AlertTriangle, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';


// Read-only pin icon for the preview map
const previewIcon = L.divIcon({
    className: '',
    html: `<div style="
        width:32px;height:32px;
        background:#6366f1;
        border:3px solid white;
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        box-shadow:0 4px 12px rgba(99,102,241,.5);
    "></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
});

/**
 * /select-address?lat=X&lng=Y  — shareable link that opens a map preview
 * so the recipient can save the shared coordinates as a delivery address.
 *
 * Works with HashRouter: parses coords from window.location.href directly
 * because HashRouter swallows the query-string inside the hash fragment,
 * making useSearchParams() return null for params that follow the # path.
 *
 * URL forms supported:
 *   /#/select-address?lat=25.5941&lng=85.1376
 *   /#/select-address?latitude=25.5941&longitude=85.1376
 *   /select-address?lat=25.5941&lng=85.1376  (BrowserRouter)
 */

// ─── Coordinate Parsing ───────────────────────────────────────────────────────

/**
 * Robustly parse lat/lng from any URL string, handling both HashRouter and
 * BrowserRouter URL formats.
 */
function parseCoordsFromUrl(href) {
    console.log('[SharedLocation] Location URL:', href);

    // The full URL may look like:
    //   https://chromavesper.github.io/closekart/#/select-address?lat=25.59&lng=85.13
    // After the '#' fragment is: /select-address?lat=25.59&lng=85.13
    // We need to extract the query string from the HASH part.

    let queryString = '';

    // Try to extract query string from the hash fragment first (HashRouter)
    const hashIdx = href.indexOf('#');
    if (hashIdx !== -1) {
        const fragment = href.slice(hashIdx + 1); // e.g. /select-address?lat=25.59&lng=85.13
        const qIdx = fragment.indexOf('?');
        if (qIdx !== -1) {
            queryString = fragment.slice(qIdx + 1);
        }
    }

    // Fallback: try normal URL search params (BrowserRouter)
    if (!queryString) {
        const qIdx = href.indexOf('?');
        if (qIdx !== -1) {
            queryString = href.slice(qIdx + 1);
            // Don't include the hash part
            const hInQ = queryString.indexOf('#');
            if (hInQ !== -1) queryString = queryString.slice(0, hInQ);
        }
    }

    console.log('[SharedLocation] Extracted query string:', queryString || '(empty)');

    if (!queryString) return { lat: null, lng: null };

    const params = new URLSearchParams(queryString);

    // Support both ?lat= and ?latitude=
    const rawLat = params.get('lat') ?? params.get('latitude');
    const rawLng = params.get('lng') ?? params.get('longitude');

    const lat = rawLat !== null ? parseFloat(rawLat) : NaN;
    const lng = rawLng !== null ? parseFloat(rawLng) : NaN;

    console.log('[SharedLocation] Parsed Latitude:', lat);
    console.log('[SharedLocation] Parsed Longitude:', lng);

    return { lat, lng };
}

/**
 * Validate that coordinates are real, finite numbers within geographic bounds.
 */
function isValidCoords(lat, lng) {
    return (
        typeof lat === 'number' && isFinite(lat) &&
        typeof lng === 'number' && isFinite(lng) &&
        lat >= -90 && lat <= 90 &&
        lng >= -180 && lng <= 180
    );
}

// ─── Component ─────────────────────────────────────────────────────────────────

const SelectAddressPage = () => {
    const { addAddress, selectAddress } = useAddress();
    const navigate = useNavigate();

    const [coords, setCoords] = useState({ lat: null, lng: null });
    const [addressLabel, setAddressLabel] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [geocoding, setGeocoding] = useState(false);
    const [showMap, setShowMap] = useState(false);

    // Parse coords once on mount using the robust URL parser
    useEffect(() => {
        const { lat, lng } = parseCoordsFromUrl(window.location.href);
        setCoords({ lat, lng });

        if (isValidCoords(lat, lng)) {
            // Reverse geocode to get a human-readable label
            setGeocoding(true);
            fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
                .then(r => r.json())
                .then(data => {
                    const addr = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
                    setAddressLabel(addr);
                })
                .catch(() => setAddressLabel(`${lat.toFixed(5)}, ${lng.toFixed(5)}`))
                .finally(() => setGeocoding(false));
        }
    }, []);

    const hasCoords = isValidCoords(coords.lat, coords.lng);

    const handleImport = async () => {
        if (!hasCoords) return;
        setSaving(true);
        try {
            const fullAddress = addressLabel || `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`;
            const addr = await addAddress({
                label: 'Other',
                fullAddress,
                latitude: coords.lat,
                longitude: coords.lng,
            });
            if (addr) selectAddress(addr);
            setSaved(true);
            setTimeout(() => navigate('/'), 1200);
        } catch (err) {
            console.error('[SharedLocation] Failed to save address:', err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center gap-6 px-4 py-10">
            <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-md"
            >
                <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_24px_64px_-16px_rgba(99,102,241,0.18)] border border-white/80 overflow-hidden">
                    {/* Top accent bar */}
                    <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                    <div className="p-7 sm:p-8">
                        {/* Icon */}
                        <div className="flex justify-center mb-5">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl ${hasCoords ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-400/30' : 'bg-gradient-to-br from-gray-400 to-gray-500 shadow-gray-400/20'}`}>
                                <MapPin size={30} className="text-white" />
                            </div>
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl font-black text-gray-900 text-center tracking-tight mb-1">
                            {hasCoords ? 'Shared Location' : 'Location Unavailable'}
                        </h1>

                        <AnimatePresence mode="wait">
                            {hasCoords ? (
                                <motion.div
                                    key="valid"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <p className="text-sm text-gray-500 font-medium text-center mb-5">
                                        Someone shared a location with you.<br />
                                        Save it to your delivery address book?
                                    </p>

                                    {/* Coords badge */}
                                    <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-3 mb-4">
                                        <Navigation size={14} className="text-indigo-500 shrink-0" />
                                        <span className="font-mono text-xs text-indigo-700 font-bold">
                                            {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                                        </span>
                                    </div>

                                    {/* Address label from geocoding */}
                                    {geocoding ? (
                                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-5">
                                            <Loader size={13} className="animate-spin" />
                                            Resolving address...
                                        </div>
                                    ) : addressLabel ? (
                                        <p className="text-xs text-gray-500 leading-relaxed bg-gray-50 rounded-xl px-3 py-2.5 mb-5 line-clamp-3">
                                            {addressLabel}
                                        </p>
                                    ) : null}

                                    {/* Map preview toggle */}
                                    <button
                                        type="button"
                                        onClick={() => setShowMap(v => !v)}
                                        className="w-full text-sm font-bold text-indigo-600 hover:text-indigo-700 py-2 mb-4 transition-colors"
                                    >
                                        {showMap ? '▲ Hide Map' : '▼ Preview on Map'}
                                    </button>

                                    <AnimatePresence>
                                        {showMap && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 260 }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="overflow-hidden rounded-2xl mb-5"
                                            >
                                                <div style={{ height: 260 }} className="rounded-2xl overflow-hidden border border-indigo-100">
                                                    <MapContainer
                                                        center={[coords.lat, coords.lng]}
                                                        zoom={15}
                                                        style={{ height: '100%', width: '100%' }}
                                                        zoomControl={false}
                                                        dragging={false}
                                                        scrollWheelZoom={false}
                                                        doubleClickZoom={false}
                                                        attributionControl={false}
                                                    >
                                                        <TileLayer
                                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                        />
                                                        <Marker
                                                            position={[coords.lat, coords.lng]}
                                                            icon={previewIcon}
                                                        />
                                                    </MapContainer>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Action buttons */}
                                    {saved ? (
                                        <div className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-sm">
                                            <CheckCircle size={16} />
                                            Address saved! Redirecting…
                                        </div>
                                    ) : (
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => navigate('/')}
                                                className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                                            >
                                                Skip
                                            </button>
                                            <button
                                                onClick={handleImport}
                                                disabled={saving}
                                                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-black text-sm shadow-lg shadow-indigo-400/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none"
                                            >
                                                {saving ? 'Saving…' : 'Save Address'}
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="invalid"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="mt-3"
                                >
                                    {/* Friendly error UI */}
                                    <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl mb-6">
                                        <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-bold text-amber-800">Shared location unavailable</p>
                                            <p className="text-xs text-amber-600 mt-1 leading-relaxed">
                                                The link is missing valid coordinates. Ask the sender to share the location again.
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => navigate('/')}
                                        className="w-full py-3 rounded-2xl bg-gradient-to-r from-gray-700 to-gray-900 text-white font-black text-sm shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                                    >
                                        Go to Home
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SelectAddressPage;
