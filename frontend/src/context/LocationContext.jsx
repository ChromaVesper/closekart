import React, { createContext, useContext, useEffect, useState } from "react";

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
    const [locationName, setLocationName] = useState("Detecting location...");
    const [coords, setCoords] = useState(null);

    useEffect(() => {
        if (!navigator.geolocation) {
            setLocationName("Geolocation not supported");
            return;
        }

        navigator.permissions.query({ name: "geolocation" })
            .then((permission) => {
                if (permission.state === "denied") {
                    setLocationName("Permission denied");
                    return;
                }

                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;
                        setCoords({ latitude, longitude });

                        try {
                            const res = await fetch(
                                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
                            );
                            const data = await res.json();
                            const city =
                                data.address?.city ||
                                data.address?.town ||
                                data.address?.village ||
                                data.address?.state ||
                                "Unknown location";
                            setLocationName(city);
                        } catch {
                            setLocationName("Location unavailable");
                        }
                    },
                    (error) => {
                        if (error.code === 1) {
                            setLocationName("Permission denied");
                        } else {
                            setLocationName("Location unavailable");
                        }
                    }
                );
            })
            .catch(() => {
                // Fallback for browsers that don't support permissions API (e.g. Firefox)
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;
                        setCoords({ latitude, longitude });
                        try {
                            const res = await fetch(
                                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
                            );
                            const data = await res.json();
                            setLocationName(
                                data.address?.city || data.address?.town || data.address?.village || data.address?.state || "Unknown location"
                            );
                        } catch {
                            setLocationName("Location unavailable");
                        }
                    },
                    () => setLocationName("Permission denied")
                );
            });
    }, []);

    return (
        <LocationContext.Provider value={{ locationName, coords }}>
            {children}
        </LocationContext.Provider>
    );
};

export const useUserLocation = () => {
    return useContext(LocationContext);
};
