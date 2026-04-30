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
            <div className="absolute top-[0%] left-[-5%] w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10 animate-float"></div>
            <div className="absolute top-[40%] right-[-10%] w-72 h-72 bg-blue-500/10 rounded-full blur-3xl -z-10 animate-float" style={{ animationDelay: '2s' }}></div>

            <div className="max-w-3xl mx-auto relative z-10">
                <button
                    onClick={() => navigate('/account')}
                    className="group flex items-center space-x-2 text-gray-500 hover:text-brand-primary mb-8 transition-all font-medium bg-white/70 backdrop-blur-xl px-5 py-2.5 rounded-full border border-white/50 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Back to Profile</span>
                </button>

                <div className="glass-card rounded-[2.5rem] p-8 sm:p-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-brand-primary/5 to-transparent rounded-bl-full pointer-events-none"></div>
                    <div className="flex items-center space-x-5 mb-10 relative z-10">
                        <div className="p-4 bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 text-brand-primary rounded-[1.25rem] shadow-sm border border-white/60">
                            <User size={28} />
                        </div>
                        <div>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-gradient tracking-tight">Edit Details</h2>
                            <p className="text-gray-500 mt-1.5 text-sm font-medium">Update your personal information</p>
                        </div>
                    </div>

                    {success && (
                        <div className="bg-green-50/80 backdrop-blur-sm text-green-700 p-4 rounded-2xl mb-8 text-sm font-medium border border-green-200 flex items-center shadow-sm animate-[fadeIn_0.5s_ease-out] relative z-10">
                            <div className="w-2.5 h-2.5 bg-green-500 rounded-full mr-3 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]"></div>
                            Profile perfectly updated! Taking you back...
                        </div>
                    )}
                    {error && (
                        <div className="bg-red-50/80 backdrop-blur-sm text-red-600 p-4 rounded-2xl mb-8 text-sm font-medium border border-red-200 flex items-center shadow-sm relative z-10">
                            <span className="mr-3 text-lg">⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSave} className="space-y-10 relative z-10">

                        {/* Avatar Upload Frame */}
                        <div className="flex flex-col sm:flex-row items-center space-y-6 sm:space-y-0 sm:space-x-8 bg-gray-50/40 p-6 sm:p-8 rounded-[2rem] border border-white/60 shadow-sm group hover:shadow-md transition-all">
                            <div className="relative cursor-pointer">
                                <div className="absolute -inset-2 bg-gradient-to-tr from-brand-primary to-brand-accent rounded-full blur-md opacity-20 group-hover:opacity-60 transition-opacity duration-500"></div>
                                <div className="h-32 w-32 bg-white rounded-full flex justify-center items-center overflow-hidden border-[5px] border-white shadow-xl shrink-0 relative z-10 group-hover:scale-105 transition-transform duration-500">
                                    {form.avatar ? (
                                        <img src={form.avatar} alt="Avatar" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 h-full w-full flex items-center justify-center">
                                            <User size={48} className="text-gray-300" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px]">
                                        <Upload className="text-white mb-1" size={24} />
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 w-full text-center sm:text-left">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Avatar URL String</label>
                                <div className="relative group/input">
                                    <input
                                        type="url"
                                        value={form.avatar}
                                        onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                                        className="w-full pl-5 pr-12 py-3.5 rounded-2xl border border-white/60 focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary/30 outline-none transition-all text-sm bg-white/70 backdrop-blur-xl shadow-inner font-medium text-gray-700 hover:bg-white/90"
                                        placeholder="https://example.com/avatar.jpg"
                                    />
                                    <Upload className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-brand-primary transition-colors" size={18} />
                                </div>
                                <p className="text-xs text-gray-500 mt-2.5 font-medium ml-1">Paste a direct image URL.</p>
                            </div>
                        </div>

                        {/* Form Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700 ml-1">Full Name</label>
                                <div className="relative group/input">
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-white/60 focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary/30 outline-none transition-all bg-white/70 backdrop-blur-xl hover:bg-white/90 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] font-medium text-gray-800"
                                        placeholder="Your full name"
                                    />
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-brand-primary transition-colors" size={18} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700 ml-1">Phone Number</label>
                                <div className="relative group/input">
                                    <input
                                        type="tel"
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-white/60 focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary/30 outline-none transition-all bg-white/70 backdrop-blur-xl hover:bg-white/90 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] font-medium text-gray-800"
                                        placeholder="+91 98765 43210"
                                    />
                                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-brand-primary transition-colors" size={18} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700 ml-1">Gender</label>
                                <select
                                    value={form.gender}
                                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                                    className="w-full px-5 py-3.5 rounded-2xl border border-white/60 focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary/30 outline-none transition-all bg-white/70 backdrop-blur-xl hover:bg-white/90 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] font-medium text-gray-800 appearance-none cursor-pointer"
                                >
                                    <option value="" disabled>Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                    <option value="Prefer not to say">Prefer not to say</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700 ml-1">Birth Date</label>
                                <div className="relative group/input">
                                    <input
                                        type="date"
                                        value={form.dob}
                                        onChange={(e) => setForm({ ...form, dob: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-white/60 focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary/30 outline-none transition-all bg-white/70 backdrop-blur-xl hover:bg-white/90 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] font-medium text-gray-800 cursor-pointer"
                                    />
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-brand-primary transition-colors" size={18} />
                                </div>
                            </div>
                        </div>

                        {/* Location Panel */}
                        <div className="bg-gray-50/40 p-6 sm:p-8 rounded-[2rem] border border-white/60 shadow-sm mt-10">
                            <div className="flex items-center space-x-3 mb-6 text-gray-800">
                                <div className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-100">
                                    <MapPin size={22} className="text-brand-primary" />
                                </div>
                                <h3 className="text-xl font-bold tracking-tight">Location Details</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">City</label>
                                    <input
                                        type="text"
                                        value={form.city}
                                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                                        className="w-full px-5 py-3.5 rounded-xl border border-white/60 focus:border-brand-primary/30 focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all text-sm font-medium bg-white/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] hover:bg-white/90"
                                        placeholder="Mumbai"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">State</label>
                                    <input
                                        type="text"
                                        value={form.state}
                                        onChange={(e) => setForm({ ...form, state: e.target.value })}
                                        className="w-full px-5 py-3.5 rounded-xl border border-white/60 focus:border-brand-primary/30 focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all text-sm font-medium bg-white/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] hover:bg-white/90"
                                        placeholder="Maharashtra"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Country</label>
                                    <input
                                        type="text"
                                        value={form.country}
                                        onChange={(e) => setForm({ ...form, country: e.target.value })}
                                        className="w-full px-5 py-3.5 rounded-xl border border-white/60 focus:border-brand-primary/30 focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all text-sm font-medium bg-white/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] hover:bg-white/90"
                                        placeholder="India"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Read-only Global Info */}
                        <div className="bg-gradient-to-r from-brand-primary/5 to-brand-accent/5 rounded-2xl p-6 border border-brand-primary/10 flex flex-col sm:flex-row items-center sm:space-x-5 space-y-4 sm:space-y-0 text-center sm:text-left">
                            <div className="p-3.5 bg-white rounded-2xl text-brand-primary shadow-sm border border-brand-primary/10 shrink-0">
                                <Mail size={22} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-base font-bold text-gray-900 truncate">{user.email || 'No email attached'}</p>
                                <p className="text-sm text-gray-500 mt-1 font-medium">Primary login email address. Cannot be directly modified.</p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-6 mt-10 flex flex-col-reverse sm:flex-row gap-4">
                            <button
                                type="button"
                                onClick={() => navigate('/account')}
                                className="w-full sm:w-1/3 py-4 rounded-2xl border-2 border-gray-200/80 bg-white/50 backdrop-blur-sm text-gray-700 font-bold hover:bg-white hover:border-gray-300 hover:shadow-sm transition-all focus:ring-4 focus:ring-gray-100"
                            >
                                Discard
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full sm:w-2/3 flex items-center justify-center space-x-2 bg-gradient-to-r from-brand-primary to-brand-accent text-white font-bold py-4 rounded-2xl shadow-lg shadow-brand-primary/30 hover:shadow-xl hover:shadow-brand-primary/40 hover:-translate-y-1 transition-all duration-300 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none focus:ring-4 focus:ring-brand-primary/30"
                            >
                                {saving ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <Save size={22} />
                                )}
                                <span className="text-lg">{saving ? 'Syncing...' : 'Save Changes'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditProfile;
