import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAddress } from '../context/AddressContext';
import { MapPin, Navigation, CheckCircle, AlertTriangle, Loader, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';

// ─── Map pin icon (avoids Leaflet default icon breakage in Vite) ──────────────
const sharedPinIcon = L.divIcon({
    className: '',
    html: `<div style="
        width:36px;height:36px;
        background:linear-gradient(135deg,#6366f1,#a855f7);
        border:3px solid white;
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        box-shadow:0 4px 16px rgba(99,102,241,.55);
        position:relative;
    "><div style="
        position:absolute;inset:0;
        display:flex;align-items:center;justify-content:center;
        transform:rotate(45deg);
    "><div style="width:8px;height:8px;background:white;border-radius:50%;"></div></div></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
});

// ─── SetViewOnLoad — ensures Leaflet centers on the coords after mount ─────────
/**
 * Leaflet's MapContainer ignores prop changes to `center` after initial mount.
 * This sub-component uses the `useMap()` hook to force-set the view to the
 * exact coordinates once the map is ready. Without this, if Leaflet has already
 * rendered at a different center (e.g. cached tiles), the pin could appear off.
 */
function SetViewOnLoad({ lat, lng, zoom }) {
    const map = useMap();
    const didSet = useRef(false);
    useEffect(() => {
        if (!didSet.current && isFinite(lat) && isFinite(lng)) {
            map.setView([lat, lng], zoom, { animate: false });
            didSet.current = true;
        }
    }, [map, lat, lng, zoom]);
    return null;
}

// ─── Coordinate Parsing ───────────────────────────────────────────────────────

/**
 * Robustly parse lat/lng from any URL, handling HashRouter and BrowserRouter.
 *
 * HashRouter URL structure (GitHub Pages):
 *   https://chromavesper.github.io/closekart/#/select-address?lat=25.59&lng=85.13
 *
 * The browser treats everything after '#' as the hash fragment.
 * window.location.search is EMPTY in this case.
 * window.location.hash is: "#/select-address?lat=25.59&lng=85.13"
 *
 * We must parse the query string from INSIDE the hash, not from search.
 */
function parseCoordsFromUrl(href) {
    let queryString = '';

    // ── Strategy 1: parse from hash fragment (HashRouter) ─────────────────────
    // window.location.hash = "#/select-address?lat=25.59&lng=85.13"
    const hash = window.location.hash; // always up-to-date, even after navigation
    const hashQIdx = hash.indexOf('?');
    if (hashQIdx !== -1) {
        queryString = hash.slice(hashQIdx + 1);
    }

    // ── Strategy 2: parse from href directly (belt-and-suspenders) ───────────
    if (!queryString) {
        const hashIdx = href.indexOf('#');
        if (hashIdx !== -1) {
            const fragment = href.slice(hashIdx + 1);
            const qIdx = fragment.indexOf('?');
            if (qIdx !== -1) queryString = fragment.slice(qIdx + 1);
        }
    }

    // ── Strategy 3: normal search params (BrowserRouter fallback) ────────────
    if (!queryString && window.location.search) {
        queryString = window.location.search.slice(1);
    }


    if (!queryString) return { lat: NaN, lng: NaN };

    const params = new URLSearchParams(queryString);

    // Support both ?lat=&lng= and ?latitude=&longitude=
    const rawLat = params.get('lat') ?? params.get('latitude');
    const rawLng = params.get('lng') ?? params.get('longitude');

    const lat = rawLat !== null ? parseFloat(rawLat) : NaN;
    const lng = rawLng !== null ? parseFloat(rawLng) : NaN;

    return { lat, lng };
}

function isValidCoords(lat, lng) {
    return (
        typeof lat === 'number' && isFinite(lat) &&
        typeof lng === 'number' && isFinite(lng) &&
        lat >= -90 && lat <= 90 &&
        lng >= -180 && lng <= 180
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

const MAP_ZOOM = 15;

const SelectAddressPage = () => {
    const { addAddress, selectAddress } = useAddress();
    const navigate = useNavigate();

    const [coords, setCoords] = useState({ lat: NaN, lng: NaN });
    const [addressLabel, setAddressLabel] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [geocoding, setGeocoding] = useState(false);
    const [saveError, setSaveError] = useState('');

    useEffect(() => {
        const { lat, lng } = parseCoordsFromUrl(window.location.href);
        setCoords({ lat, lng });

        if (isValidCoords(lat, lng)) {
            setGeocoding(true);
            fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=17&addressdetails=1`
            )
                .then(r => r.json())
                .then(data => {
                    setAddressLabel(data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
                })
                .catch(() => {
                    setAddressLabel(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
                })
                .finally(() => setGeocoding(false));
        }
    }, []);

    const hasCoords = isValidCoords(coords.lat, coords.lng);

    const handleImport = async () => {
        if (!hasCoords) return;
        setSaving(true);
        setSaveError('');
        try {
            const fullAddress = addressLabel || `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
            const addr = await addAddress({
                label: 'Other',
                fullAddress,
                latitude: coords.lat,
                longitude: coords.lng,
            });
            if (addr) selectAddress(addr);
            setSaved(true);
            setTimeout(() => navigate('/'), 1500);
        } catch (err) {
            console.error('[SharedLocation] Failed to save address:', err);
            setSaveError('Could not save address. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    // Open in Google Maps (helpful on mobile)
    const openInMaps = () => {
        if (!hasCoords) return;
        window.open(
            `https://www.google.com/maps?q=${coords.lat},${coords.lng}`,
            '_blank',
            'noopener,noreferrer'
        );
    };

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center gap-6 px-4 py-10">
            {/* Soft gradient background */}
            <div className="fixed inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 -z-10" />

            <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-md"
            >
                <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_24px_64px_-16px_rgba(99,102,241,0.18)] border border-white/80 overflow-hidden">
                    {/* Gradient accent bar */}
                    <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                    <div className="p-6 sm:p-8">

                        {/* ── Icon + Title ── */}
                        <div className="flex items-center gap-3 mb-5">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shrink-0 ${hasCoords
                                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-400/30'
                                : 'bg-gradient-to-br from-gray-400 to-gray-500 shadow-gray-400/20'
                            }`}>
                                <MapPin size={24} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-gray-900 tracking-tight leading-tight">
                                    {hasCoords ? 'Shared Location' : 'Location Unavailable'}
                                </h1>
                                <p className="text-xs text-gray-400 font-medium mt-0.5">
                                    {hasCoords ? 'via CloseKart location share' : 'Invalid or missing coordinates'}
                                </p>
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            {hasCoords ? (
                                <motion.div
                                    key="valid"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    {/* ── Map — always visible, no toggle ── */}
                                    <div
                                        className="rounded-2xl overflow-hidden border border-indigo-100 mb-4 shadow-sm"
                                        style={{ height: 240 }}
                                    >
                                        <MapContainer
                                            center={[coords.lat, coords.lng]}
                                            zoom={MAP_ZOOM}
                                            style={{ height: '100%', width: '100%' }}
                                            zoomControl={true}
                                            scrollWheelZoom={false}
                                            attributionControl={false}
                                        >
                                            <TileLayer
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                attribution='&copy; OpenStreetMap contributors'
                                            />
                                            {/* Force-set the view after mount */}
                                            <SetViewOnLoad lat={coords.lat} lng={coords.lng} zoom={MAP_ZOOM} />
                                            <Marker
                                                position={[coords.lat, coords.lng]}
                                                icon={sharedPinIcon}
                                            />
                                        </MapContainer>
                                    </div>

                                    {/* ── Coordinate badge ── */}
                                    <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2.5 mb-3">
                                        <Navigation size={13} className="text-indigo-500 shrink-0" />
                                        <span className="font-mono text-[11px] text-indigo-700 font-bold">
                                            {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                                        </span>
                                        <button
                                            onClick={openInMaps}
                                            className="ml-auto flex items-center gap-1 text-[10px] font-bold text-indigo-500 hover:text-indigo-700 transition-colors"
                                            title="Open in Google Maps"
                                        >
                                            <ExternalLink size={11} />
                                            Maps
                                        </button>
                                    </div>

                                    {/* ── Address from reverse geocode ── */}
                                    {geocoding ? (
                                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-3 px-1">
                                            <Loader size={12} className="animate-spin shrink-0" />
                                            Resolving address…
                                        </div>
                                    ) : addressLabel ? (
                                        <p className="text-xs text-gray-500 leading-relaxed bg-gray-50 rounded-xl px-3 py-2.5 mb-4 line-clamp-2">
                                            {addressLabel}
                                        </p>
                                    ) : null}

                                    <p className="text-xs text-gray-400 font-medium text-center mb-4">
                                        Save this to your delivery address book?
                                    </p>

                                    {/* ── Save error ── */}
                                    {saveError && (
                                        <p className="text-xs text-red-500 font-medium text-center mb-3">{saveError}</p>
                                    )}

                                    {/* ── Action buttons ── */}
                                    {saved ? (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-sm"
                                        >
                                            <CheckCircle size={16} />
                                            Address saved! Redirecting…
                                        </motion.div>
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
                                                {saving ? (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <Loader size={14} className="animate-spin" /> Saving…
                                                    </span>
                                                ) : 'Save Address'}
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
                                    className="mt-2"
                                >
                                    <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl mb-5">
                                        <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-bold text-amber-800">Shared location unavailable</p>
                                            <p className="text-xs text-amber-600 mt-1 leading-relaxed">
                                                The link doesn't contain valid coordinates. Ask the sender to share their location again.
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
