import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Upload, User, Loader2, Mail, MapPin, Calendar, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const EditProfile = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [dataLoading, setDataLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        name: '',
        phone: '',
        avatar: '',
        city: '',
        state: '',
        country: '',
        gender: '',
        dob: ''
    });

    useEffect(() => {
        if (!user && !authLoading) {
            navigate('/login');
            return;
        }

        const fetchProfile = async () => {
            if (!user) return;
            try {
                const docRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setForm({
                        name: data.name || user.displayName || '',
                        phone: data.phone || user.phoneNumber || '',
                        avatar: data.avatar || user.photoURL || '',
                        city: data.city || '',
                        state: data.state || '',
                        country: data.country || '',
                        gender: data.gender || '',
                        dob: data.dob || ''
                    });
                } else {
                    setForm(prev => ({
                        ...prev,
                        name: user.displayName || '',
                        phone: user.phoneNumber || '',
                        avatar: user.photoURL || ''
                    }));
                }
            } catch (err) {
                console.error("Error fetching profile:", err);
                setError('Failed to load profile data');
            } finally {
                setDataLoading(false);
            }
        };

        if (user) {
            fetchProfile();
        }
    }, [user, authLoading, navigate]);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!user) return;

        setSaving(true);
        setError('');
        setSuccess(false);

        try {
            const docRef = doc(db, 'users', user.uid);
            const profileData = {
                ...form,
                email: user.email,
                updatedAt: new Date().toISOString()
            };

            await setDoc(docRef, profileData, { merge: true });

            setSuccess(true);
            setTimeout(() => navigate('/account'), 1500);
        } catch (err) {
            console.error("Error saving profile:", err);
            setError('Failed to save profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (authLoading || dataLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <User className="text-blue-600 opacity-50" size={20} />
                    </div>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl -z-10 animate-float"></div>
            <div className="absolute top-[40%] right-[-10%] w-72 h-72 bg-blue-400/10 rounded-full blur-3xl -z-10 animate-float" style={{ animationDelay: '2s' }}></div>

            <div className="max-w-2xl mx-auto relative z-10">
                <button
                    onClick={() => navigate('/account')}
                    className="group flex items-center space-x-2 text-gray-500 hover:text-blue-600 mb-6 transition-all font-medium bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 shadow-sm hover:shadow"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Back to Profile</span>
                </button>

                <div className="glass-card rounded-[2rem] p-8 shadow-xl">
                    <div className="flex items-center space-x-3 mb-8">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                            <User size={24} />
                        </div>
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Edit details</h2>
                    </div>

                    {success && (
                        <div className="bg-green-50/80 backdrop-blur-sm text-green-700 p-4 rounded-2xl mb-6 text-sm font-medium border border-green-200 flex items-center shadow-sm animate-[fadeIn_0.5s_ease-out]">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                            Profile perfectly updated! Taking you back...
                        </div>
                    )}
                    {error && (
                        <div className="bg-red-50/80 backdrop-blur-sm text-red-600 p-4 rounded-2xl mb-6 text-sm font-medium border border-red-200 flex items-center shadow-sm">
                            <span className="mr-2">⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSave} className="space-y-8">

                        {/* Avatar Upload Frame */}
                        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8 bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                            <div className="relative group cursor-pointer">
                                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                <div className="h-28 w-28 bg-white rounded-full flex justify-center items-center overflow-hidden border-4 border-white shadow-lg shrink-0 relative z-10 group-hover:scale-105 transition-transform duration-300">
                                    {form.avatar ? (
                                        <img src={form.avatar} alt="Avatar" className="h-full w-full object-cover" />
                                    ) : (
                                        <User size={40} className="text-blue-300" />
                                    )}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Upload className="text-white" size={24} />
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 w-full text-center sm:text-left">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Avatar Link</label>
                                <div className="relative">
                                    <input
                                        type="url"
                                        value={form.avatar}
                                        onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                                        className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm bg-white/70 backdrop-blur-sm shadow-inner"
                                        placeholder="https://example.com/avatar.jpg"
                                    />
                                    <Upload className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                </div>
                                <p className="text-xs text-gray-400 mt-2">Paste a direct image URL to update your profile picture.</p>
                            </div>
                        </div>

                        {/* Form Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-gray-700 ml-1">Full Name</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white/70 hover:bg-white"
                                        placeholder="Your full name"
                                    />
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-gray-700 ml-1">Phone Number</label>
                                <div className="relative">
                                    <input
                                        type="tel"
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white/70 hover:bg-white"
                                        placeholder="+91 98765 43210"
                                    />
                                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-gray-700 ml-1">Gender</label>
                                <select
                                    value={form.gender}
                                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white/70 hover:bg-white appearance-none cursor-pointer"
                                >
                                    <option value="" disabled>Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                    <option value="Prefer not to say">Prefer not to say</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-gray-700 ml-1">Birth Date</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={form.dob}
                                        onChange={(e) => setForm({ ...form, dob: e.target.value })}
                                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white/70 hover:bg-white cursor-text"
                                    />
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                </div>
                            </div>
                        </div>

                        {/* Location Panel */}
                        <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 mt-8">
                            <div className="flex items-center space-x-2 mb-6 text-gray-800">
                                <MapPin size={20} className="text-blue-500" />
                                <h3 className="text-lg font-bold">Location Details</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">City</label>
                                    <input
                                        type="text"
                                        value={form.city}
                                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm bg-white"
                                        placeholder="Mumbai"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">State</label>
                                    <input
                                        type="text"
                                        value={form.state}
                                        onChange={(e) => setForm({ ...form, state: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm bg-white"
                                        placeholder="Maharashtra"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Country</label>
                                    <input
                                        type="text"
                                        value={form.country}
                                        onChange={(e) => setForm({ ...form, country: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm bg-white"
                                        placeholder="India"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Read-only Global Info */}
                        <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100 flex flex-col sm:flex-row items-center sm:space-x-4 space-y-3 sm:space-y-0 text-center sm:text-left">
                            <div className="p-3 bg-white rounded-full text-blue-500 shadow-sm shrink-0">
                                <Mail size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">{user.email || 'No email attached'}</p>
                                <p className="text-xs text-gray-500 mt-0.5">Primary login email address. This cannot be modified directly.</p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="border-t border-gray-100 pt-8 mt-8 flex flex-col sm:flex-row gap-4">
                            <button
                                type="button"
                                onClick={() => navigate('/account')}
                                className="w-full sm:w-1/3 py-3.5 rounded-xl border-2 border-gray-200 text-gray-700 font-bold hover:bg-gray-50 hover:border-gray-300 transition-all focus:ring-4 focus:ring-gray-100"
                            >
                                Discard
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full sm:w-2/3 flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3.5 rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none focus:ring-4 focus:ring-blue-200"
                            >
                                {saving ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Save size={20} />
                                )}
                                <span>{saving ? 'Syncing...' : 'Save Profile Details'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditProfile;
