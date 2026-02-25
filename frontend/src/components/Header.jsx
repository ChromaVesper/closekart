import React from 'react';
import { Search, User, MapPin, ChevronDown } from 'lucide-react';
import { useUserLocation } from '../context/LocationContext';
import { useAddress } from '../context/AddressContext';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
    const { locationName } = useUserLocation();
    const { selectedAddress } = useAddress();
    const navigate = useNavigate();

    // Prefer selected address label, else GPS name, else fallback
    let displayName = "Mithapur";
    if (selectedAddress) {
        displayName = selectedAddress.label || selectedAddress.fullAddress.split(',')[0];
    } else if (locationName && locationName !== "Detected location") {
        displayName = locationName;
    }

    return (
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] transition-all">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

                {/* Left: Logo & Location (Mobile and Desktop) */}
                <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                    <Link to="/" className="text-2xl font-black bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent tracking-tight">
                        CloseKart
                    </Link>

                    <div className="hidden sm:flex flex-col cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg transition" onClick={() => navigate('/select-address')}>
                        <div className="flex items-center gap-1 text-[10px] text-brand-primary font-bold uppercase tracking-wider">
                            <MapPin size={10} /> {selectedAddress ? selectedAddress.label : 'Delivery to'}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-800 font-semibold">
                            <span className="truncate max-w-[160px]">{displayName}</span>
                            <ChevronDown size={14} className="text-gray-400" />
                        </div>
                    </div>
                </div>

                {/* Center: Search Bar (Hidden on Mobile, full width on Desktop) */}
                <div className="hidden md:flex flex-1 max-w-2xl mx-6">
                    <div className="relative w-full">
                        <input
                            type="text"
                            placeholder="Search products, brands and categories..."
                            className="w-full bg-gray-50 border border-transparent hover:border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary block pl-11 pt-2.5 pb-2.5 outline-none transition-all shadow-sm"
                            onClick={() => navigate('/search')}
                            readOnly
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                            <Search size={16} className="text-gray-400" />
                        </div>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3 shrink-0">
                    {/* Mobile Search Icon */}
                    <button className="md:hidden p-2 text-gray-600 hover:bg-gray-50 rounded-full transition" onClick={() => navigate('/search')}>
                        <Search size={22} className="text-gray-700" />
                    </button>

                    <Link to="/profile" className="p-2 sm:px-4 sm:py-2 bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-brand-primary rounded-xl transition flex items-center gap-2 font-medium shadow-sm">
                        <User size={18} />
                        <span className="hidden sm:block text-sm">Account</span>
                    </Link>
                </div>
            </div>

            {/* Mobile Location Strip (Shown under header on tiny screens) */}
            <div className="sm:hidden px-4 py-2 border-t border-gray-100 bg-white flex justify-between items-center cursor-pointer active:bg-gray-50" onClick={() => navigate('/select-address')}>
                <div className="flex items-center gap-1.5">
                    <div className="bg-brand-primary/10 p-1 rounded-full">
                        <MapPin size={12} className="text-brand-primary" />
                    </div>
                    <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">{selectedAddress ? selectedAddress.label : 'Delivery'}</span>
                    <span className="text-xs text-gray-800 font-semibold truncate max-w-[180px]">{displayName}</span>
                </div>
                <ChevronDown size={14} className="text-gray-400" />
            </div>
        </header>
    );
};

export default Header;
