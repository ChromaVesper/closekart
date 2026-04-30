import React, { createContext, useContext, useEffect, useState } from "react";

const LocationContext = createContext();
const LS_ADDR_KEY = "ck_delivery_address";

export const LocationProvider = ({ children }) => {
    // Structure: { address: string, city: string, lat: number, lng: number, isGPS: boolean }
    const [deliveryAddress, setDeliveryAddress] = useState(() => {
        const stored = localStorage.getItem(LS_ADDR_KEY);
        return stored ? JSON.parse(stored) : null;
    });

    // Provide legacy properties to avoid massive refactoring of all components
    const [locationName, setLocationName] = useState(deliveryAddress ? deliveryAddress.address : "Detecting location...");
    const [coords, setCoords] = useState(
        deliveryAddress?.lat && deliveryAddress?.lng 
        ? { latitude: deliveryAddress.lat, longitude: deliveryAddress.lng } 
        : null
    );

    const updateDeliveryAddress = (addrObj) => {
        setDeliveryAddress(addrObj);
        localStorage.setItem(LS_ADDR_KEY, JSON.stringify(addrObj));
        setLocationName(addrObj.address);
        setCoords({ latitude: addrObj.lat, longitude: addrObj.lng });
    };

    const fetchGPSAddress = () => {
        setLocationName("Detecting location...");
        if (!navigator.geolocation) {
            setLocationName("Geolocation not supported");
            return;
        }

        const successCb = async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
                const data = await res.json();
                const city = data.address?.city || data.address?.town || data.address?.village || data.address?.state || "";
                const fullAddress = data.display_name || "Current Location";

                updateDeliveryAddress({
                    address: fullAddress,
                    city: city,
                    lat: latitude,
                    lng: longitude,
                    isGPS: true
                });
            } catch {
                updateDeliveryAddress({
                    address: "Current Location",
                    city: "",
                    lat: latitude,
                    lng: longitude,
                    isGPS: true
                });
            }
        };

        const errorCb = () => {
            setLocationName("Location unavailable - Defaulting to New Delhi");
            updateDeliveryAddress({
                address: "New Delhi (Fallback Location)",
                city: "New Delhi",
                lat: 28.6139,
                lng: 77.2090,
                isGPS: false
            });
        };

        navigator.geolocation.getCurrentPosition(successCb, errorCb, { timeout: 10000 });
    };

    // Initialization
    useEffect(() => {
        // If there is no saved address, default to finding GPS right away
        if (!deliveryAddress) {
            fetchGPSAddress();
        } else {
            // Already have a saved address in state, ensuring coords/name match
            setLocationName(deliveryAddress.address);
            setCoords({ latitude: deliveryAddress.lat, longitude: deliveryAddress.lng });
        }
    }, [deliveryAddress]);

    return (
        <LocationContext.Provider value={{ 
            locationName, 
            coords, 
            deliveryAddress, 
            updateDeliveryAddress, 
            fetchGPSAddress 
        }}>
            {children}
        </LocationContext.Provider>
    );
};

export const useUserLocation = () => {
    return useContext(LocationContext);
};
