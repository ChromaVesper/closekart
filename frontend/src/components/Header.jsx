import React from 'react';
import { MapPin, ChevronDown, Bell, Zap } from 'lucide-react';
import { useUserLocation } from '../context/LocationContext';
import { useAddress } from '../context/AddressContext';

const Header = () => {
    const { locationName } = useUserLocation();
    const { selectedAddress } = useAddress();

    // Prefer selected address label, else GPS name, else fallback
    let displayName = "Mithapur";
    if (selectedAddress) {
        displayName = selectedAddress.label || selectedAddress.fullAddress.split(',')[0];
    } else if (locationName && locationName !== "Detected location") {
        displayName = locationName;
    }

    return (
        <div className="sticky top-0 z-50 bg-blue-500 text-white rounded-b-2xl shadow-md px-4 py-3 flex justify-between items-center transition-all">
            {/* Left Box: Logo & Location */}
            <div className="flex flex-col">
                <div className="flex items-center gap-1 font-extrabold text-xl tracking-tight italic">
                    CloseKart
                </div>
                <div className="flex items-center gap-1 text-xs text-blue-100 mt-0.5">
                    <span className="font-bold text-white uppercase">{selectedAddress ? selectedAddress.label : 'HOME'}</span>
                    <span className="truncate max-w-[120px]">{displayName}</span>
                    <ChevronDown size={14} />
                </div>
            </div>

            {/* Right Box: Coins & Notifications */}
            <div className="flex items-center gap-3">
                <div className="bg-blue-600/50 backdrop-blur-sm border border-blue-400/30 rounded-full px-2 py-1 flex items-center gap-1">
                    <Zap size={14} className="text-yellow-300 fill-yellow-300" />
                    <span className="text-xs font-bold text-white">150</span>
                </div>
            </div>
        </div>
    );
};

export default Header;
