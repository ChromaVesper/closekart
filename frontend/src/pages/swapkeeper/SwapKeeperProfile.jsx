import React, { useEffect, useState, Suspense, lazy } from 'react';
import { getProfile, updateProfile } from '../../api/swapKeeperApi';
import api from '../../services/api';
import {
    Store, User, Mail, Phone, MapPin, CheckCircle, Save,
    Image as ImageIcon, Lock, Loader, Map as MapIcon
} from 'lucide-react';

const ShopLocationPicker = lazy(() => import('../../components/ShopLocationPicker'));

// ── Small reusable text input ─────────────────────────────────────────────────
const InputField = ({ label, icon: Icon, disabled, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
        <div className="relative">
            {Icon && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"><Icon size={16} /></span>}
            <input
                {...props}
                disabled={disabled}
                className={`w-full border border-gray-200 rounded-xl py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition
                    ${Icon ? 'pl-10 pr-4' : 'px-4'}
                    ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-white'}`}
            />
        </div>
    </div>
);

// ── Section header ─────────────────────────────────────────────────────────────
const SectionHeader = ({ icon: Icon, title, subtitle }) => (
    <div className="flex items-start gap-3 mb-5">
        <div className="bg-indigo-100 text-indigo-600 p-2.5 rounded-xl shrink-0"><Icon size={20} /></div>
        <div>
            <h2 className="font-bold text-gray-900 text-base">{title}</h2>
            {subtitle && <p className="text-gray-400 text-xs mt-0.5">{subtitle}</p>}
        </div>
    </div>
);

// ── SwapKeeperProfile ─────────────────────────────────────────────────────────
const SwapKeeperProfile = () => {
    const [form, setForm] = useState({
        shopName: '', ownerName: '', email: '', phone: '',
        address: '', city: '', state: '', pincode: '', avatar: '',
    });
    const [shopData, setShopData] = useState(null);   // raw shop doc
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [locationSuccess, setLocationSuccess] = useState('');
    const [shopImageUploading, setShopImageUploading] = useState(false);

    // ── Load profile + shop doc ─────────────────────────────────────────────
    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [profile, shopRes] = await Promise.allSettled([
                    getProfile(),
                    api.get('/swapkeeper/shop'),
                ]);
                if (profile.status === 'fulfilled') {
                    const d = profile.value;
                    setForm({
                        shopName: d.shopName || '',
                        ownerName: d.ownerName || '',
                        email: d.email || '',
                        phone: d.phone || '',
                        address: d.address || '',
                        city: d.city || '',
                        state: d.state || '',
                        pincode: d.pincode || '',
                        avatar: d.avatar || '',
                    });
                }
                if (shopRes.status === 'fulfilled') {
                    setShopData(shopRes.value.data);
                }
            } catch {
                setError('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess(false);
        try {
            await updateProfile(form);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch { setError('Failed to update profile'); }
        finally { setSaving(false); }
    };

    // ── Save shop location ────────────────────────────────────────────────────
    const handleSaveLocation = async (locationData) => {
        try {
            const res = await api.post('/swapkeeper/save-location', locationData);
            setShopData(res.data.shop);
            setLocationSuccess('Shop location saved and locked successfully!');
            setTimeout(() => setLocationSuccess(''), 4000);
        } catch (err) {
            const msg = err?.response?.data?.msg || 'Failed to save location.';
            setError(msg);
        }
    };

    // ── Shop image upload ─────────────────────────────────────────────────────
    const handleShopImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setShopImageUploading(true);
        try {
            const fd = new FormData();
            fd.append('file', file);
            const res = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            const imageUrl = res.data.url || res.data.filePath || res.data.path || '';
            if (imageUrl) {
                await api.put('/swapkeeper/profile', { shopImage: imageUrl });
                setShopData(prev => ({ ...prev, shopImage: imageUrl }));
            }
        } catch { setError('Image upload failed. Try again.'); }
        finally { setShopImageUploading(false); }
    };

    // ── Derive location state ─────────────────────────────────────────────────
    const isLocked = shopData?.isLocationLocked === true;
    const savedLoc = isLocked ? {
        fullAddress: shopData?.fullAddress || '',
        landmark: shopData?.landmark || '',
        city: shopData?.city || '',
        state: shopData?.state || '',
        pincode: shopData?.pincode || '',
        latitude: shopData?.location?.coordinates?.[1] || 0,
        longitude: shopData?.location?.coordinates?.[0] || 0,
    } : null;

    if (loading) return (
        <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
        </div>
    );

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Shop Profile</h1>
                <p className="text-gray-500 text-sm mt-1">Manage your store details, location, and image</p>
            </div>

            {/* ── Avatar + shop image card ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <SectionHeader icon={ImageIcon} title="Shop Image" subtitle="Upload your storefront photo (shown to buyers)" />
                <div className="flex items-center gap-6">
                    {/* Image preview */}
                    <div className="w-24 h-24 rounded-2xl bg-indigo-100 flex items-center justify-center overflow-hidden border-2 border-indigo-200 shrink-0">
                        {shopData?.shopImage
                            ? <img src={shopData.shopImage} alt="Shop" className="w-full h-full object-cover" />
                            : (form.avatar
                                ? <img src={form.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                : <Store size={32} className="text-indigo-400" />)
                        }
                    </div>
                    <div className="space-y-2 flex-1">
                        <p className="font-bold text-gray-900 text-lg">{form.shopName || 'Your Shop'}</p>
                        <p className="text-gray-500 text-sm">{form.ownerName || 'Owner'}</p>
                        {(shopData?.city || form.city) && (
                            <p className="text-gray-400 text-xs flex items-center gap-1">
                                <MapPin size={11} /> {shopData?.city || form.city}
                                {(shopData?.state || form.state) && `, ${shopData?.state || form.state}`}
                            </p>
                        )}
                        {/* Upload button */}
                        <label className="inline-flex items-center gap-2 cursor-pointer bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-semibold px-3 py-2 rounded-xl transition border border-indigo-200">
                            {shopImageUploading ? <Loader size={13} className="animate-spin" /> : <ImageIcon size={13} />}
                            {shopImageUploading ? 'Uploading…' : 'Upload Shop Image'}
                            <input type="file" accept="image/*" className="hidden" onChange={handleShopImageUpload} />
                        </label>
                    </div>
                </div>
            </div>

            {/* ── Basic info form ── */}
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                <SectionHeader icon={Store} title="Store Information" subtitle="Basic contact and address details" />

                {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}
                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
                        <CheckCircle size={16} /> Profile updated!
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField label="Shop Name" icon={Store} type="text" name="shopName" value={form.shopName} onChange={handleChange} placeholder="My Awesome Shop" />
                    <InputField label="Owner Name" icon={User} type="text" name="ownerName" value={form.ownerName} onChange={handleChange} placeholder="Your full name" />
                    <InputField label="Email" icon={Mail} type="email" name="email" value={form.email} onChange={handleChange} placeholder="shop@example.com" />
                    <InputField label="Phone" icon={Phone} type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" />
                </div>

                {/* Short address note */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Short Address</label>
                    <div className="relative">
                        <span className="absolute left-3.5 top-3 text-gray-400"><MapPin size={16} /></span>
                        <textarea name="address" value={form.address} onChange={handleChange}
                            placeholder="Street address, locality..."
                            rows={2}
                            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <InputField label="City" type="text" name="city" value={form.city} onChange={handleChange} placeholder="Mumbai" />
                    <InputField label="State" type="text" name="state" value={form.state} onChange={handleChange} placeholder="Maharashtra" />
                    <InputField label="Pincode" type="text" name="pincode" value={form.pincode} onChange={handleChange} placeholder="400001" />
                </div>

                <div className="flex justify-end pt-2">
                    <button type="submit" disabled={saving}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm">
                        <Save size={16} />
                        {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                </div>
            </form>

            {/* ── Shop Location section ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <SectionHeader
                    icon={isLocked ? Lock : MapIcon}
                    title="Shop Location"
                    subtitle={isLocked
                        ? 'Location is permanently locked — visible to nearby buyers'
                        : 'Set your exact shop position so buyers can find you'}
                />

                {locationSuccess && (
                    <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
                        <CheckCircle size={16} /> {locationSuccess}
                    </div>
                )}

                <Suspense fallback={
                    <div className="h-[380px] bg-gray-100 rounded-2xl flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3 text-gray-400">
                            <Loader size={26} className="animate-spin text-indigo-400" />
                            <span className="text-sm">Loading map…</span>
                        </div>
                    </div>
                }>
                    <ShopLocationPicker
                        locked={isLocked}
                        savedLocation={savedLoc}
                        onSave={handleSaveLocation}
                    />
                </Suspense>
            </div>
        </div>
    );
};

export default SwapKeeperProfile;
