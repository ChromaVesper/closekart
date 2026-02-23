import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import {
    Navigation, Search, Check, Loader, MapPin, X,
    Home, Building, Hash, Globe2, Landmark
} from 'lucide-react';

// ── Custom drop-pin icon ─────────────────────────────────────────────────────
const createShopPin = () =>
    L.divIcon({
        className: '',
        html: `<div style="
            width:40px;height:40px;
            background:linear-gradient(135deg,#6366f1,#4f46e5);
            border:3px solid white;
            border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            box-shadow:0 6px 18px rgba(99,102,241,.5);
            position:relative;">
            <div style="
                position:absolute;inset:0;
                display:flex;align-items:center;justify-content:center;
                transform:rotate(45deg);">
                <div style="width:9px;height:9px;background:white;border-radius:50%;"></div>
            </div>
        </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
    });

// ── Map sub-components ────────────────────────────────────────────────────────
const FlyTo = ({ center }) => {
    const map = useMap();
    useEffect(() => { if (center) map.flyTo(center, map.getZoom(), { duration: 0.8 }); }, [center, map]);
    return null;
};
const ClickHandler = ({ onMapClick }) => {
    useMapEvents({ click: (e) => onMapClick(e.latlng) });
    return null;
};

// ── Reverse geocode helper ────────────────────────────────────────────────────
const reverseGeocode = async (lat, lng) => {
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`);
        const data = await res.json();
        const a = data.address || {};
        return {
            fullAddress: data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
            city: a.city || a.town || a.village || a.county || '',
            state: a.state || '',
            pincode: a.postcode || '',
        };
    } catch {
        return { fullAddress: `${lat.toFixed(5)}, ${lng.toFixed(5)}`, city: '', state: '', pincode: '' };
    }
};

// ── ShopLocationPicker ────────────────────────────────────────────────────────
/**
 * Props:
 *   onSave({ fullAddress, landmark, city, state, pincode, latitude, longitude }) → called on confirm
 *   onCancel() → optional back callback
 *   locked (bool) → if true, render a read-only card instead of the picker
 *   savedLocation → object with existing location data to display when locked
 */
const ShopLocationPicker = ({ onSave, onCancel, locked = false, savedLocation = null }) => {
    const [pin, setPin] = useState({ lat: 20.5937, lng: 78.9629 });
    const [flyTarget, setFlyTarget] = useState(null);
    const [geocoding, setGeocoding] = useState(false);
    const [detecting, setDetecting] = useState(false);
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        fullAddress: '',
        landmark: '',
        city: '',
        state: '',
        pincode: '',
    });
    const pinIcon = useRef(createShopPin());
    const geocodeTimerRef = useRef(null);
    const searchTimer = useRef(null);

    // Auto-detect GPS on mount
    useEffect(() => {
        if (locked) return;
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(({ coords }) => {
                const next = { lat: coords.latitude, lng: coords.longitude };
                setPin(next);
                setFlyTarget([next.lat, next.lng]);
            }, () => { /* denied — keep India center */ });
        }
    }, [locked]);

    // Reverse geocode when pin moves
    useEffect(() => {
        if (locked) return;
        clearTimeout(geocodeTimerRef.current);
        geocodeTimerRef.current = setTimeout(async () => {
            setGeocoding(true);
            const geo = await reverseGeocode(pin.lat, pin.lng);
            setForm(f => ({ ...f, fullAddress: geo.fullAddress, city: geo.city, state: geo.state, pincode: geo.pincode }));
            setGeocoding(false);
        }, 700);
        return () => clearTimeout(geocodeTimerRef.current);
    }, [pin.lat, pin.lng, locked]);

    // Forward geocode search
    useEffect(() => {
        if (!searchQuery.trim() || searchQuery.length < 3) { setSearchResults([]); return; }
        clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(async () => {
            setSearching(true);
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5`);
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

    const handleSave = async () => {
        if (!form.fullAddress || geocoding) return;
        setSaving(true);
        await onSave({ ...form, latitude: pin.lat, longitude: pin.lng });
        setSaving(false);
    };

    // ── LOCKED STATE ──────────────────────────────────────────────────────────
    if (locked && savedLocation) {
        return (
            <div className="space-y-4">
                <div className="flex items-start gap-4 bg-green-50 border border-green-200 rounded-2xl p-5">
                    <Check size={28} className="text-green-600 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                        <p className="font-bold text-green-800 text-base">Location locked ✓</p>
                        <p className="text-sm text-green-700 mt-1 break-words">{savedLocation.fullAddress}</p>
                        {savedLocation.landmark && <p className="text-xs text-green-600 mt-0.5">Landmark: {savedLocation.landmark}</p>}
                        <div className="flex gap-4 mt-2 text-xs text-green-600 flex-wrap">
                            {savedLocation.city && <span>🏙 {savedLocation.city}</span>}
                            {savedLocation.state && <span>📍 {savedLocation.state}</span>}
                            {savedLocation.pincode && <span>📮 {savedLocation.pincode}</span>}
                        </div>
                        <p className="text-xs font-mono text-green-500 mt-2">
                            {savedLocation.latitude?.toFixed(5)}, {savedLocation.longitude?.toFixed(5)}
                        </p>
                    </div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800">
                    <strong>Shop location is locked and cannot be edited.</strong> Contact support for changes.
                </div>
                {/* Static map preview */}
                <div style={{ height: 200, borderRadius: 16, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                    <MapContainer
                        center={[savedLocation.latitude, savedLocation.longitude]}
                        zoom={16}
                        style={{ height: '100%', width: '100%' }}
                        zoomControl={false}
                        dragging={false}
                        scrollWheelZoom={false}
                        doubleClickZoom={false}
                    >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker
                            position={[savedLocation.latitude, savedLocation.longitude]}
                            icon={pinIcon.current}
                        />
                    </MapContainer>
                </div>
            </div>
        );
    }

    // ── EDITABLE STATE ────────────────────────────────────────────────────────
    return (
        <div className="space-y-4">
            {/* Search */}
            <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {searching ? <Loader size={14} className="animate-spin" /> : <Search size={14} />}
                </div>
                <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search area, street, landmark…"
                    className="w-full pl-9 pr-9 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                />
                {searchQuery && (
                    <button onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        <X size={13} />
                    </button>
                )}
            </div>

            {searchResults.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-[140px] overflow-y-auto -mt-2">
                    {searchResults.map((r, i) => (
                        <button key={i} onClick={() => handleSearchSelect(r)}
                            className="w-full text-left px-3 py-2 hover:bg-indigo-50 text-xs text-gray-700 border-b border-gray-50 last:border-0 flex items-start gap-2">
                            <MapPin size={12} className="text-gray-400 mt-0.5 shrink-0" />
                            <span className="line-clamp-2">{r.display_name}</span>
                        </button>
                    ))}
                </div>
            )}

            <button onClick={handleDetect} disabled={detecting}
                className="flex items-center gap-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 disabled:opacity-50">
                {detecting ? <Loader size={13} className="animate-spin" /> : <Navigation size={13} />}
                {detecting ? 'Detecting GPS…' : 'Use my current GPS location'}
            </button>
            {error && <p className="text-xs text-red-500">{error}</p>}

            {/* Map */}
            <div style={{ height: 300, borderRadius: 16, overflow: 'hidden', border: '1px solid #e5e7eb', position: 'relative' }}>
                <MapContainer
                    center={[pin.lat, pin.lng]}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={true}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
                    />
                    <FlyTo center={flyTarget} />
                    <ClickHandler onMapClick={({ lat, lng }) => setPin({ lat, lng })} />
                    <Marker
                        position={[pin.lat, pin.lng]}
                        draggable={true}
                        icon={pinIcon.current}
                        eventHandlers={{ dragend: (e) => { const { lat, lng } = e.target.getLatLng(); setPin({ lat, lng }); } }}
                    />
                </MapContainer>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur-sm text-xs text-gray-600 px-3 py-1.5 rounded-full shadow pointer-events-none font-medium">
                    Drag pin or tap to reposition
                </div>
            </div>

            {/* Address preview (auto-filled) */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex items-start gap-2">
                {geocoding
                    ? <Loader size={14} className="text-indigo-400 animate-spin mt-0.5 shrink-0" />
                    : <MapPin size={14} className="text-indigo-600 mt-0.5 shrink-0" />
                }
                <p className="text-xs text-gray-700 line-clamp-3">
                    {geocoding ? 'Getting address…' : (form.fullAddress || 'Move the pin to set location')}
                </p>
            </div>

            {/* Coordinates display */}
            <p className="text-xs font-mono text-gray-400 text-center">
                {pin.lat.toFixed(5)}, {pin.lng.toFixed(5)}
            </p>

            {/* Editable fields */}
            <div className="grid grid-cols-1 gap-3">
                <Field label="Landmark (optional)" icon={Landmark}
                    value={form.landmark} onChange={v => setForm(f => ({ ...f, landmark: v }))}
                    placeholder="Near City Mall, Opp. Park…" />
                <div className="grid grid-cols-3 gap-3">
                    <Field label="City" icon={Building}
                        value={form.city} onChange={v => setForm(f => ({ ...f, city: v }))} placeholder="Mumbai" />
                    <Field label="State" icon={Globe2}
                        value={form.state} onChange={v => setForm(f => ({ ...f, state: v }))} placeholder="Maharashtra" />
                    <Field label="Pincode" icon={Hash}
                        value={form.pincode} onChange={v => setForm(f => ({ ...f, pincode: v }))} placeholder="400001" />
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
                {onCancel && (
                    <button onClick={onCancel}
                        className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                        Back
                    </button>
                )}
                <button onClick={handleSave} disabled={saving || geocoding || !form.fullAddress}
                    className="flex-1 bg-indigo-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition flex items-center justify-center gap-2">
                    {saving ? <Loader size={15} className="animate-spin" /> : <Check size={15} />}
                    {saving ? 'Saving…' : 'Confirm & Lock Shop Location'}
                </button>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-xs text-amber-700">
                ⚠️ Location will be <strong>locked permanently</strong> after saving. Buyers within your delivery radius will see your shop.
            </div>
        </div>
    );
};

// ── Tiny field helper ─────────────────────────────────────────────────────────
const Field = ({ label, icon: Icon, value, onChange, placeholder }) => (
    <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
        <div className="relative">
            {Icon && <Icon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />}
            <input
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full border border-gray-200 rounded-xl py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition bg-white pl-8 pr-3"
            />
        </div>
    </div>
);

export default ShopLocationPicker;
