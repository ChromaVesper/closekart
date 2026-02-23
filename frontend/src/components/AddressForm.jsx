import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import {
    Home, Briefcase, Hotel, MapPin, Navigation, Loader,
    User, Phone, Hash, Building, Layers, Map as MapIcon,
    X, Check, ChevronLeft, Search
} from 'lucide-react';

const MapPicker = lazy(() => import('./MapPicker'));

// ── Label options ─────────────────────────────────────────────────────────────
const LABELS = [
    { id: 'Home', icon: Home, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-400' },
    { id: 'Work', icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-400' },
    { id: 'Hotel', icon: Hotel, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-400' },
    { id: 'Other', icon: MapPin, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-400' },
];

// ── Small field helper ────────────────────────────────────────────────────────
const Field = ({ label, required, icon: Icon, value, onChange, placeholder, type = 'text', half }) => (
    <div className={half ? '' : 'col-span-2'}>
        <label className="block text-xs font-semibold text-gray-500 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
            {Icon && <Icon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />}
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className={`w-full border border-gray-200 rounded-xl py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white transition ${Icon ? 'pl-8 pr-3' : 'px-3'}`}
            />
        </div>
    </div>
);

const EMPTY = {
    label: 'Home',
    fullName: '', phoneNumber: '',
    houseNumber: '', buildingName: '', floor: '',
    area: '', landmark: '', city: '', state: '', pincode: '', country: '',
    latitude: null, longitude: null,
};

/**
 * AddressForm
 *
 * Props:
 *   initialData  – pre-filled address object for edit mode (null → new address)
 *   onSave(fields) – called with all fields; caller handles API + navigation
 *   onCancel()    – go back
 *   saving        – bool (parent controls spinner)
 *   error         – string
 */
const AddressForm = ({ initialData = null, onSave, onCancel, saving = false, error = '' }) => {
    const isEdit = !!initialData;

    const [form, setForm] = useState(() => {
        if (initialData) {
            return {
                label: initialData.label || 'Home',
                fullName: initialData.fullName || '',
                phoneNumber: initialData.phoneNumber || '',
                houseNumber: initialData.houseNumber || '',
                buildingName: initialData.buildingName || '',
                floor: initialData.floor || '',
                area: initialData.area || '',
                landmark: initialData.landmark || '',
                city: initialData.city || '',
                state: initialData.state || '',
                pincode: initialData.pincode || '',
                country: initialData.country || '',
                latitude: initialData.location?.coordinates?.[1] || null,
                longitude: initialData.location?.coordinates?.[0] || null,
            };
        }
        return { ...EMPTY };
    });

    const [showMap, setShowMap] = useState(false);
    const [detecting, setDetecting] = useState(false);
    const [gpsError, setGpsError] = useState('');

    const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

    // ── GPS detect → auto-fill area/city/state/pincode ─────────────────────────
    const detectGPS = () => {
        if (!navigator.geolocation) { setGpsError('Geolocation not supported'); return; }
        setDetecting(true);
        setGpsError('');
        navigator.geolocation.getCurrentPosition(
            async ({ coords }) => {
                const { latitude, longitude } = coords;
                setForm(f => ({ ...f, latitude, longitude }));
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`);
                    const data = await res.json();
                    const a = data.address || {};
                    setForm(f => ({
                        ...f,
                        area: a.suburb || a.neighbourhood || a.village || a.county || '',
                        city: a.city || a.town || a.county || '',
                        state: a.state || '',
                        pincode: a.postcode || '',
                        country: a.country || '',
                    }));
                } catch { /* silent */ }
                setDetecting(false);
            },
            () => { setGpsError('Location permission denied'); setDetecting(false); }
        );
    };

    // ── MapPicker onSave callback ─────────────────────────────────────────────
    const handleMapSave = ({ fullAddress, latitude, longitude, label }) => {
        // Parse city/state/pincode from fullAddress if we can (Nominatim returns it via MapPicker reverse geocode)
        setForm(f => ({
            ...f,
            latitude,
            longitude,
            label: label || f.label,
        }));
        setShowMap(false);
    };

    // ── Validate & submit ─────────────────────────────────────────────────────
    const handleSubmit = () => {
        if (!form.houseNumber.trim()) { return; }
        if (!form.fullName.trim()) { return; }
        if (!form.phoneNumber.trim()) { return; }
        if (!form.latitude || !form.longitude) { return; }
        onSave(form);
    };

    const canSave = form.houseNumber.trim() && form.fullName.trim() && form.phoneNumber.trim() && form.latitude && form.longitude;

    if (showMap) {
        return (
            <div className="p-3 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                    <button onClick={() => setShowMap(false)} className="text-gray-400 hover:text-gray-600">
                        <ChevronLeft size={18} />
                    </button>
                    <h3 className="font-bold text-gray-900 text-sm">Pick exact location</h3>
                </div>
                <Suspense fallback={<div className="h-[380px] bg-gray-100 rounded-2xl animate-pulse" />}>
                    <MapPicker
                        showLabelPicker={false}
                        saveLabel="Use this location"
                        initialLat={form.latitude || 20.5937}
                        initialLng={form.longitude || 78.9629}
                        onCancel={() => setShowMap(false)}
                        onSave={handleMapSave}
                    />
                </Suspense>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-5">
            {/* Header */}
            <div className="flex items-center gap-2">
                <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
                    <ChevronLeft size={18} />
                </button>
                <h3 className="font-bold text-gray-900 text-base">
                    {isEdit ? 'Edit Address' : 'Add New Address'}
                </h3>
            </div>

            {error && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</div>
            )}

            {/* ── Label ── */}
            <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">Save as</p>
                <div className="flex gap-2 flex-wrap">
                    {LABELS.map(({ id, icon: Icon, color, bg, border }) => (
                        <button
                            key={id}
                            onClick={() => set('label')(id)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-xs font-semibold transition
                                ${form.label === id ? `${bg} ${color} ${border}` : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}
                        >
                            <Icon size={12} /> {id}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Location detected / map ── */}
            <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">Location <span className="text-red-500">*</span></p>
                {form.latitude && form.longitude ? (
                    <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2 text-xs text-green-800">
                        <MapPin size={13} className="text-green-600 shrink-0" />
                        <span className="flex-1">
                            {form.area || form.city
                                ? `${form.area ? form.area + ', ' : ''}${form.city}, ${form.state}`
                                : `${form.latitude.toFixed(5)}, ${form.longitude.toFixed(5)}`
                            }
                        </span>
                        <button onClick={() => setShowMap(true)} className="text-green-700 font-semibold hover:text-green-900 transition text-xs underline">
                            Change
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={detectGPS}
                            disabled={detecting}
                            className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-blue-300 text-blue-600 py-2.5 rounded-xl text-xs font-semibold hover:bg-blue-50 transition"
                        >
                            {detecting ? <Loader size={13} className="animate-spin" /> : <Navigation size={13} />}
                            {detecting ? 'Detecting…' : 'Use GPS'}
                        </button>
                        <button
                            onClick={() => setShowMap(true)}
                            className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-indigo-300 text-indigo-600 py-2.5 rounded-xl text-xs font-semibold hover:bg-indigo-50 transition"
                        >
                            <MapIcon size={13} /> Pick on Map
                        </button>
                    </div>
                )}
                {gpsError && <p className="text-xs text-red-500 mt-1">{gpsError}</p>}
            </div>

            {/* ── Delivery contact ── */}
            <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">Delivery Details</p>
                <div className="grid grid-cols-2 gap-3">
                    <Field label="Full Name" required icon={User} value={form.fullName} onChange={set('fullName')} placeholder="Your full name" />
                    <Field label="Phone Number" required icon={Phone} value={form.phoneNumber} onChange={set('phoneNumber')} placeholder="+91 98765 43210" type="tel" />
                </div>
            </div>

            {/* ── Address details ── */}
            <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">Address Details</p>
                <div className="grid grid-cols-2 gap-3">
                    <Field label="House / Flat No." required icon={Hash} value={form.houseNumber} onChange={set('houseNumber')} placeholder="A-204 / 12B" half />
                    <Field label="Building Name" icon={Building} value={form.buildingName} onChange={set('buildingName')} placeholder="Anand Nagar" half />
                    <Field label="Floor" icon={Layers} value={form.floor} onChange={set('floor')} placeholder="2nd Floor" half />
                    <Field label="Area / Locality" icon={MapPin} value={form.area} onChange={set('area')} placeholder="Koregaon Park" half />
                    <Field label="Nearby Landmark" icon={Search} value={form.landmark} onChange={set('landmark')} placeholder="Near Apollo Hospital" />
                    <Field label="City" icon={MapPin} value={form.city} onChange={set('city')} placeholder="Pune" half />
                    <Field label="State" icon={MapPin} value={form.state} onChange={set('state')} placeholder="Maharashtra" half />
                    <Field label="Pincode" icon={Hash} value={form.pincode} onChange={set('pincode')} placeholder="411001" type="tel" half />
                    <Field label="Country" icon={MapPin} value={form.country} onChange={set('country')} placeholder="India" half />
                </div>
            </div>

            {/* ── Summary hint ── */}
            {!canSave && (
                <p className="text-xs text-gray-400 text-center">
                    Fill in House No., Full Name, Phone and pick a location to save.
                </p>
            )}

            {/* ── Actions ── */}
            <div className="flex gap-3 pt-1">
                <button onClick={onCancel}
                    className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50 transition">
                    Cancel
                </button>
                <button onClick={handleSubmit} disabled={!canSave || saving}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2">
                    {saving ? <Loader size={15} className="animate-spin" /> : <Check size={15} />}
                    {saving ? 'Saving…' : (isEdit ? 'Update Address' : 'Save Address')}
                </button>
            </div>
        </div>
    );
};

export default AddressForm;
