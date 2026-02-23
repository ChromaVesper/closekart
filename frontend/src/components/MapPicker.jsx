import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, Search, Check, Loader, MapPin, X } from 'lucide-react';

// ── Fix Leaflet default icon (Vite/Webpack asset broken URLs) ─────────────────
const createDraggablePin = () =>
    L.divIcon({
        className: '',
        html: `
            <div style="
                width: 36px; height: 36px;
                background: #2563eb;
                border: 3px solid white;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                box-shadow: 0 4px 14px rgba(37,99,235,.5);
                position: relative;
            ">
                <div style="
                    position: absolute; inset: 0;
                    display: flex; align-items: center; justify-content: center;
                    transform: rotate(45deg);
                ">
                    <div style="width:8px;height:8px;background:white;border-radius:50%;"></div>
                </div>
            </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -38],
    });

// ── Sub-components ────────────────────────────────────────────────────────────

/** Smoothly flies map to center */
const FlyTo = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) map.flyTo(center, map.getZoom(), { duration: 0.8 });
    }, [center, map]);
    return null;
};

/** Listens to map clicks and updates pin position */
const ClickHandler = ({ onMapClick }) => {
    useMapEvents({ click: (e) => onMapClick(e.latlng) });
    return null;
};

// ── Reverse geocode helper ────────────────────────────────────────────────────
const reverseGeocode = async (lat, lng) => {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
        );
        const data = await res.json();
        return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    } catch {
        return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }
};

// ── MapPicker ─────────────────────────────────────────────────────────────────
/**
 * Props:
 *   initialLat, initialLng  — starting pin position (optional)
 *   onSave({ label, fullAddress, latitude, longitude })  — called on Save
 *   onCancel()              — called when user clicks Cancel / Back
 *   label                   — default label passed in from parent (optional)
 *   showLabelPicker         — show Home/Work/Other label picker (default true)
 *   saveLabel               — text on the save button (default "Save Address")
 */
const MapPicker = ({
    initialLat = 20.5937,   // India center fallback
    initialLng = 78.9629,
    onSave,
    onCancel,
    label: initialLabel = 'Home',
    showLabelPicker = true,
    saveLabel = 'Save Address',
}) => {
    const [pin, setPin] = useState({ lat: initialLat, lng: initialLng });
    const [flyTarget, setFlyTarget] = useState(null);
    const [address, setAddress] = useState('');
    const [geocoding, setGeocoding] = useState(false);
    const [detecting, setDetecting] = useState(false);
    const [saving, setSaving] = useState(false);
    const [label, setLabel] = useState(initialLabel);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState('');
    const searchTimer = useRef(null);
    const draggableIcon = useRef(createDraggablePin());

    // ── Reverse geocode whenever pin changes (debounced 600ms) ─────────────────
    const geocodeTimerRef = useRef(null);
    useEffect(() => {
        clearTimeout(geocodeTimerRef.current);
        geocodeTimerRef.current = setTimeout(async () => {
            setGeocoding(true);
            const addr = await reverseGeocode(pin.lat, pin.lng);
            setAddress(addr);
            setGeocoding(false);
        }, 600);
        return () => clearTimeout(geocodeTimerRef.current);
    }, [pin.lat, pin.lng]);

    // ── Detect GPS ──────────────────────────────────────────────────────────────
    const handleDetect = () => {
        if (!navigator.geolocation) { setError('Geolocation not supported.'); return; }
        setDetecting(true);
        setError('');
        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                const next = { lat: coords.latitude, lng: coords.longitude };
                setPin(next);
                setFlyTarget([next.lat, next.lng]);
                setDetecting(false);
            },
            () => { setError('Location permission denied. Move the pin manually.'); setDetecting(false); }
        );
    };

    // ── Forward geocode search ──────────────────────────────────────────────────
    useEffect(() => {
        if (!searchQuery.trim() || searchQuery.length < 3) { setSearchResults([]); return; }
        clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(async () => {
            setSearching(true);
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5`
                );
                setSearchResults(await res.json());
            } catch { setSearchResults([]); }
            finally { setSearching(false); }
        }, 400);
        return () => clearTimeout(searchTimer.current);
    }, [searchQuery]);

    const handleSearchSelect = (result) => {
        const next = { lat: parseFloat(result.lat), lng: parseFloat(result.lon) };
        setPin(next);
        setFlyTarget([next.lat, next.lng]);
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleMapClick = (latlng) => setPin({ lat: latlng.lat, lng: latlng.lng });

    const handleDragEnd = (e) => {
        const { lat, lng } = e.target.getLatLng();
        setPin({ lat, lng });
    };

    // ── Save ────────────────────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!address) return;
        setSaving(true);
        await onSave({ label, fullAddress: address, latitude: pin.lat, longitude: pin.lng });
        setSaving(false);
    };

    return (
        <div className="flex flex-col gap-0 bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-lg">
            {/* Search Bar */}
            <div className="p-3 border-b border-gray-100 bg-gray-50 space-y-2">
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {searching ? <Loader size={14} className="animate-spin" /> : <Search size={14} />}
                    </div>
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search area, street, landmark…"
                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                    />
                    {searchQuery && (
                        <button onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <X size={13} />
                        </button>
                    )}
                </div>

                {/* Forward geocode results */}
                {searchResults.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden max-h-[150px] overflow-y-auto">
                        {searchResults.map((r, i) => (
                            <button key={i} onClick={() => handleSearchSelect(r)}
                                className="w-full text-left px-3 py-2 hover:bg-blue-50 text-xs text-gray-700 border-b border-gray-50 last:border-0 flex items-start gap-2">
                                <MapPin size={12} className="text-gray-400 mt-0.5 shrink-0" />
                                <span className="line-clamp-2">{r.display_name}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* GPS button */}
                <button onClick={handleDetect} disabled={detecting}
                    className="flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-700 transition disabled:opacity-50">
                    {detecting ? <Loader size={13} className="animate-spin" /> : <Navigation size={13} />}
                    {detecting ? 'Detecting GPS…' : 'Use my current location'}
                </button>
                {error && <p className="text-xs text-red-500">{error}</p>}
            </div>

            {/* ── Map ── */}
            <div className="relative" style={{ height: 340 }}>
                <MapContainer
                    center={[pin.lat, pin.lng]}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={true}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <FlyTo center={flyTarget} />
                    <ClickHandler onMapClick={handleMapClick} />
                    <Marker
                        position={[pin.lat, pin.lng]}
                        draggable={true}
                        icon={draggableIcon.current}
                        eventHandlers={{ dragend: handleDragEnd }}
                    />
                </MapContainer>

                {/* Crosshair hint overlay */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur-sm text-xs text-gray-600 px-3 py-1.5 rounded-full shadow font-medium pointer-events-none">
                    Drag the pin or tap to reposition
                </div>
            </div>

            {/* ── Address preview + label + save ── */}
            <div className="p-3 border-t border-gray-100 space-y-3 bg-white">
                {/* Detected address */}
                <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5">
                    {geocoding
                        ? <Loader size={14} className="text-blue-400 animate-spin mt-0.5 shrink-0" />
                        : <MapPin size={14} className="text-blue-600 mt-0.5 shrink-0" />
                    }
                    <p className="text-xs text-gray-700 line-clamp-2">
                        {geocoding ? 'Getting address…' : (address || 'Move the pin to set location')}
                    </p>
                </div>

                {/* Label picker */}
                {showLabelPicker && (
                    <div className="flex gap-2">
                        {['Home', 'Work', 'Other'].map(l => (
                            <button key={l} onClick={() => setLabel(l)}
                                className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition
                                    ${label === l ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                                {l}
                            </button>
                        ))}
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                    {onCancel && (
                        <button onClick={onCancel}
                            className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                            Back
                        </button>
                    )}
                    <button onClick={handleSave} disabled={saving || geocoding || !address}
                        className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2">
                        {saving ? <Loader size={15} className="animate-spin" /> : <Check size={15} />}
                        {saving ? 'Saving…' : saveLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MapPicker;
