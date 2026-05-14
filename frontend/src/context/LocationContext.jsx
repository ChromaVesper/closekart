import React, { createContext, useContext, useEffect, useState } from "react";

const LocationContext = createContext();
const LS_ADDR_KEY = "ck_delivery_address";

// ─── Smart human-readable name from Nominatim address object ─────────────────
/**
 * Nominatim's display_name often contains highway codes (NH31:NH131A),
 * postal codes, and admin IDs that are confusing to users.
 *
 * We build a short label by picking the most specific *named* locality:
 *   neighbourhood / suburb / village → town / city → state
 *
 * Examples:
 *   { suburb:"Rajendra Nagar", city:"Patna" }  → "Rajendra Nagar, Patna"
 *   { village:"Mithapur", county:"Patna" }      → "Mithapur, Patna"
 *   { town:"Katiahar", state:"Bihar" }          → "Katiahar, Bihar"
 */
function buildReadableName(addr) {
    if (!addr) return "Current Location";

    // Check if a string looks like a road/highway code
    const isRoadCode = (s) =>
        !s || /^NH\d|^\d|:\d{1,3}|^[A-Z]{1,3}\d/i.test(s.trim());

    // Priority list for the specific (neighbourhood-level) part
    const specificCandidates = [
        addr.neighbourhood,
        addr.suburb,
        addr.quarter,
        addr.hamlet,
        addr.village,
        addr.town,
        addr.city_district,
        addr.locality,
    ];

    const specific = specificCandidates.find(
        (c) => c && c.trim() && !isRoadCode(c)
    ) || null;

    // The broader city/state part
    const broad =
        addr.city           ||
        addr.town           ||
        addr.county         ||
        addr.state_district ||
        addr.state          ||
        null;

    if (specific) {
        return broad && broad !== specific ? `${specific}, ${broad}` : specific;
    }
    if (broad) return broad;
    return "Current Location";
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export const LocationProvider = ({ children }) => {
    // Structure: { address: string, city: string, lat: number, lng: number, isGPS: boolean }
    const [deliveryAddress, setDeliveryAddress] = useState(() => {
        try {
            const stored = localStorage.getItem(LS_ADDR_KEY);
            if (!stored) return null;
            const parsed = JSON.parse(stored);
            // Invalidate cached addresses that contain highway codes so the
            // user doesn't keep seeing "NH31:NH131A, Kati..." after the fix.
            const addr = parsed?.address || '';
            if (/NH\d|:\d{1,3}|^[A-Z]{1,3}\d/i.test(addr)) {
                localStorage.removeItem(LS_ADDR_KEY);
                return null;
            }
            return parsed;
        } catch { return null; }
    });

    const [locationName, setLocationName] = useState(
        deliveryAddress ? deliveryAddress.address : "Detecting location..."
    );
    const [coords, setCoords] = useState(
        deliveryAddress?.lat && deliveryAddress?.lng
            ? { latitude: deliveryAddress.lat, longitude: deliveryAddress.lng }
            : null
    );

    const updateDeliveryAddress = (addrObj) => {
        setDeliveryAddress(addrObj);
        try { localStorage.setItem(LS_ADDR_KEY, JSON.stringify(addrObj)); } catch {}
        setLocationName(addrObj.address);
        setCoords({ latitude: addrObj.lat, longitude: addrObj.lng });
    };

    const fetchGPSAddress = () => {
        setLocationName("Detecting location...");
        if (!navigator.geolocation) {
            setLocationName("Current Location");
            return;
        }

        const successCb = async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=16&addressdetails=1`
                );
                const data = await res.json();

                // Build human-readable short name — ignores highway codes
                const readableName = buildReadableName(data.address);
                const city =
                    data.address?.city    ||
                    data.address?.town    ||
                    data.address?.village ||
                    data.address?.state   ||
                    "";

                updateDeliveryAddress({
                    address: readableName,
                    city,
                    lat: latitude,
                    lng: longitude,
                    isGPS: true,
                });
            } catch {
                updateDeliveryAddress({
                    address: "Current Location",
                    city: "",
                    lat: latitude,
                    lng: longitude,
                    isGPS: true,
                });
            }
        };

        const errorCb = () => {
            // Don't show a broken/fallback city — just say "Current Location"
            setLocationName("Current Location");
        };

        navigator.geolocation.getCurrentPosition(successCb, errorCb, {
            enableHighAccuracy: true,
            timeout: 12000,
            maximumAge: 60000, // accept a 1-min cached fix for speed
        });
    };

    // On mount: if no saved address, detect GPS; otherwise restore saved state
    useEffect(() => {
        if (!deliveryAddress) {
            fetchGPSAddress();
        } else {
            setLocationName(deliveryAddress.address);
            setCoords({ latitude: deliveryAddress.lat, longitude: deliveryAddress.lng });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <LocationContext.Provider value={{
            locationName,
            coords,
            deliveryAddress,
            updateDeliveryAddress,
            fetchGPSAddress,
        }}>
            {children}
        </LocationContext.Provider>
    );
};

export const useUserLocation = () => useContext(LocationContext);
