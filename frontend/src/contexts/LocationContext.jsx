import React, { createContext, useState, useEffect, useContext } from 'react';
import { useLoadScript } from '@react-google-maps/api';

const LocationContext = createContext();

const libraries = ['places'];

export const LocationProvider = ({ children }) => {
    const [location, setLocation] = useState(null); // { lat, lng }
    const [address, setAddress] = useState('Anisabad, Patna (Default)');
    const [loadingLocation, setLoadingLocation] = useState(true);
    const [error, setError] = useState(null);

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY", // Replace with valid key
        libraries,
    });

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

                    // If Google Maps API is loaded, try to reverse geocode
                    if (isLoaded && window.google) {
                        const geocoder = new window.google.maps.Geocoder();
                        geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
                            if (status === "OK" && results[0]) {
                                setAddress(results[0].formatted_address);
                            } else {
                                setAddress("Detected Location");
                            }
                        });
                    } else {
                        setAddress("Current Location");
                    }
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
        <LocationContext.Provider value={{ location, address, loadingLocation, error, getCurrentLocation, isMapsLoaded: isLoaded }}>
            {children}
        </LocationContext.Provider>
    );
};

export const useLocation = () => useContext(LocationContext);
