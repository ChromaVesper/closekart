import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAddress } from '../context/AddressContext';
import AddressSelector from '../components/AddressSelector';
import { MapPin } from 'lucide-react';

/**
 * /select-address?lat=X&lng=Y  — shareable link that opens AddressSelector
 * pre-loaded with the shared coordinates so the recipient can save it.
 */
const SelectAddressPage = () => {
    const [searchParams] = useSearchParams();
    const { selectAddress, addAddress } = useAddress();
    const navigate = useNavigate();

    const lat = parseFloat(searchParams.get('lat'));
    const lng = parseFloat(searchParams.get('lng'));

    const hasCoords = !isNaN(lat) && !isNaN(lng);

    const handleImport = async () => {
        if (!hasCoords) return;
        // Reverse geocode to get a human-readable name
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
            );
            const data = await res.json();
            const fullAddress = data.display_name || `${lat}, ${lng}`;
            const addr = await addAddress({ label: 'Other', fullAddress, latitude: lat, longitude: lng });
            selectAddress(addr);
        } catch {
            // fallback: save with raw coords
            const addr = await addAddress({ label: 'Other', fullAddress: `${lat}, ${lng}`, latitude: lat, longitude: lng });
            selectAddress(addr);
        }
        navigate('/');
    };

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center px-4">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 max-w-md w-full shadow-sm">
                <div className="flex justify-center mb-4">
                    <div className="bg-blue-100 text-blue-600 p-4 rounded-full">
                        <MapPin size={32} />
                    </div>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Shared Location</h1>
                {hasCoords ? (
                    <>
                        <p className="text-gray-500 text-sm mb-4">
                            Someone shared a delivery address with you.<br />
                            Save it to your address book?
                        </p>
                        <p className="font-mono text-xs text-gray-400 mb-6 bg-gray-100 rounded-lg px-3 py-2">
                            {lat.toFixed(5)}, {lng.toFixed(5)}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => navigate('/')}
                                className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition"
                            >
                                Skip
                            </button>
                            <button
                                onClick={handleImport}
                                className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition"
                            >
                                Save Address
                            </button>
                        </div>
                    </>
                ) : (
                    <p className="text-red-500 text-sm">Invalid or missing coordinates in the link.</p>
                )}
            </div>

            {/* Also show full selector below so they can choose differently */}
            <div className="w-full max-w-md">
                <AddressSelector inline />
            </div>
        </div>
    );
};

export default SelectAddressPage;
