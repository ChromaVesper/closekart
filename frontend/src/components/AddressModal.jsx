import React, { useState } from 'react';
import { useUserLocation } from '../context/LocationContext';
import { MapPin, Navigation, Search, X, Loader2 } from 'lucide-react';

const AddressModal = ({ isOpen, onClose }) => {
    const { fetchGPSAddress, updateDeliveryAddress } = useUserLocation();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        
        setLoading(true);
        try {
            // Using Nominatim for free forward geocoding
            const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&addressdetails=1&limit=5`);
            const data = await res.json();
            setSearchResults(data);
        } catch (err) {
            console.error("Geocoding failed:", err);
            alert("Failed to search location. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectManualAddress = (result) => {
        const city = result.address?.city || result.address?.town || result.address?.village || result.address?.state || "";
        updateDeliveryAddress({
            address: result.display_name,
            city: city,
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon),
            isGPS: false
        });
        onClose();
    };

    const handleUseGPS = () => {
        fetchGPSAddress();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                        <MapPin className="text-blue-600" /> Select Delivery Location
                    </h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 flex-1 overflow-y-auto">
                    {/* GPS Option */}
                    <button 
                        onClick={handleUseGPS}
                        className="w-full flex items-center gap-3 p-4 bg-blue-50 text-blue-700 rounded-2xl font-bold hover:bg-blue-100 transition border border-blue-100 group"
                    >
                        <Navigation size={20} className="group-hover:animate-pulse" />
                        <div className="flex flex-col items-start">
                            <span>Use Current Location</span>
                            <span className="text-xs font-medium text-blue-500">Detect via GPS automatically</span>
                        </div>
                    </button>

                    <div className="relative flex py-5 items-center">
                        <div className="flex-grow border-t border-gray-100"></div>
                        <span className="shrink-0 mx-4 text-gray-400 text-xs font-bold uppercase tracking-widest">OR ENTER MANUALLY</span>
                        <div className="flex-grow border-t border-gray-100"></div>
                    </div>

                    {/* Search Form */}
                    <form onSubmit={handleSearch} className="relative mb-4">
                        <input 
                            type="text" 
                            placeholder="Enter delivery area, city, or pincode"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition font-medium"
                        />
                        <Search size={20} className="absolute left-4 top-3.5 text-gray-400" />
                        <button type="submit" disabled={loading || !searchQuery.trim()} className="absolute right-2 top-2 bottom-2 bg-blue-600 text-white px-4 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition">
                            {loading ? <Loader2 size={16} className="animate-spin" /> : "Search"}
                        </button>
                    </form>

                    {/* Search Results */}
                    {searchResults.length > 0 && (
                        <div className="space-y-2 mt-2">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Suggested Locations</h3>
                            {searchResults.map((result, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => handleSelectManualAddress(result)}
                                    className="w-full text-left p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition flex items-start gap-3"
                                >
                                    <MapPin size={18} className="text-gray-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 line-clamp-1">{result.name || result.display_name.split(',')[0]}</p>
                                        <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{result.display_name}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddressModal;
