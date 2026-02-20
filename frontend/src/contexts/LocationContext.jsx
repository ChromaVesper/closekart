import React, { createContext, useState, useEffect, useContext } from 'react';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
    const [location, setLocation] = useState(null); // { lat, lng }
    const [address, setAddress] = useState('Anisabad, Patna (Default)');
    const [loadingLocation, setLoadingLocation] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Attempt to get user location on load
        getCurrentLocation();
    }, []);

    const getCurrentLocation = () => {
        setLoadingLocation(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setLocation({ lat: latitude, lng: longitude });
                    setAddress("Current Location");
                    setLoadingLocation(false);
                },
                (err) => {
                    console.error("Error getting location: ", err);
                    setError("Location access denied. Using default.");
                    setLoadingLocation(false);
                    // Default to Anisabad coordinates if denied
                    setLocation({ lat: 25.5866, lng: 85.1082 });
                }
            );
        } else {
            setError("Geolocation not supported");
            setLoadingLocation(false);
        }
    };

    return (
        <LocationContext.Provider value={{ location, address, loadingLocation, error, getCurrentLocation }}>
            {children}
        </LocationContext.Provider>
    );
};

export const useLocation = () => useContext(LocationContext);
