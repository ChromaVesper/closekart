import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUserLocation } from '../context/LocationContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Store, MapPin, Phone, Tag, Image as ImageIcon, CheckCircle, Navigation } from 'lucide-react';

const SetupShop = () => {
    const { user } = useAuth();
    const { coords } = useUserLocation();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [hasShop, setHasShop] = useState(false);
    const [shopData, setShopData] = useState({
        shopName: '',
        address: '',
        city: '',
        phone: '',
        category: 'Grocery',
        shopImage: '',
        latitude: '',
        longitude: ''
    });

    const navigate = useNavigate();

    useEffect(() => {
        if (!user) return;
        const fetchShop = async () => {
            try {
                const snap = await getDoc(doc(db, 'shops', user.uid));
                if (snap.exists()) {
                    setHasShop(true);
                    setShopData({
                        ...snap.data()
                    });
                }
            } catch (err) {
                console.error("Error fetching shop:", err);
            }
        };
        fetchShop();
    }, [user]);

    const handleChange = (e) => {
        setShopData({ ...shopData, [e.target.name]: e.target.value });
    };

    const useAutoLocation = () => {
        if (coords) {
            setShopData(prev => ({
                ...prev,
                latitude: coords.latitude,
                longitude: coords.longitude
            }));
        } else {
            alert("Location not detected. Please enable location services in your browser.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!shopData.shopName?.trim() || !shopData.category?.trim() || !shopData.phone?.trim()) {
            alert("Please fill out all required fields.");
            return;
        }

        setLoading(true);
        try {
            const finalData = {
                ...shopData,
                ownerId: user.uid,
                updatedAt: serverTimestamp()
            };

            if (hasShop) {
                await updateDoc(doc(db, 'shops', user.uid), finalData);
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            } else {
                await setDoc(doc(db, 'shops', user.uid), {
                    ...finalData,
                    isOpen: true,
                    createdAt: serverTimestamp()
                });
                setHasShop(true);
                setSuccess(true);
            }
        } catch (error) {
            console.error("Error saving shop:", error);
            alert(`Error saving shop details: ${error.message || "System error"}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                        <Store size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900">Setup Your Shop</h2>
                        <p className="text-gray-500 font-medium">Configure your store details and PIN point your location.</p>
                    </div>
                </div>

                {success && (
                    <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center gap-3 font-bold border border-emerald-100 animate-in fade-in slide-in-from-top-4">
                        <CheckCircle size={20} />
                        Your shop details have been saved successfully!
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Shop Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <Store size={14} className="text-gray-400" /> Shop Name
                            </label>
                            <input 
                                type="text" 
                                name="shopName"
                                value={shopData.shopName}
                                onChange={handleChange}
                                placeholder="E.g. Fresh Mart"
                                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition font-medium"
                                required
                            />
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <Tag size={14} className="text-gray-400" /> Shop Category
                            </label>
                            <select 
                                name="category"
                                value={shopData.category}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition font-medium"
                                required
                            >
                                <option>Grocery</option>
                                <option>Electronics</option>
                                <option>Fashion</option>
                                <option>Pharmacy</option>
                                <option>Bakery</option>
                                <option>Restaurant</option>
                                <option>Others</option>
                            </select>
                        </div>

                        {/* Store Location Group */}
                        <div className="md:col-span-2 bg-blue-50/50 border border-blue-100 p-6 rounded-3xl space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <h3 className="font-bold text-gray-900">Pinpoint Shop Location <span className="text-red-500">*</span></h3>
                                    <p className="text-xs text-gray-500">Required for customers to find you nearby.</p>
                                </div>
                                <button type="button" onClick={useAutoLocation} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg flex items-center font-bold hover:bg-blue-700 transition">
                                    <Navigation size={12} className="mr-1" /> Use My Location
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <input type="number" step="any" required name="latitude" value={shopData.latitude} onChange={handleChange} placeholder="Latitude (e.g. 28.6139)" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none font-medium text-sm" />
                                <input type="number" step="any" required name="longitude" value={shopData.longitude} onChange={handleChange} placeholder="Longitude (e.g. 77.2090)" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none font-medium text-sm" />
                            </div>
                        </div>

                        {/* Address */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <MapPin size={14} className="text-gray-400" /> Shop Address
                            </label>
                            <input 
                                type="text" 
                                name="address"
                                value={shopData.address}
                                onChange={handleChange}
                                placeholder="Street name, Area, City..."
                                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition font-medium"
                                required
                            />
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <Phone size={14} className="text-gray-400" /> Phone Number
                            </label>
                            <input 
                                type="tel" 
                                name="phone"
                                value={shopData.phone}
                                onChange={handleChange}
                                placeholder="Contact number for orders"
                                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition font-medium"
                                required
                            />
                        </div>

                        {/* Logo Link */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <ImageIcon size={14} className="text-gray-400" /> Shop Banner URL
                            </label>
                            <input 
                                type="text" 
                                name="shopImage"
                                value={shopData.shopImage}
                                onChange={handleChange}
                                placeholder="https://image-url..."
                                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition font-medium"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex w-full justify-end">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full md:w-auto py-4 px-10 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : hasShop ? 'Update Store Settings' : 'Create Store'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SetupShop;
