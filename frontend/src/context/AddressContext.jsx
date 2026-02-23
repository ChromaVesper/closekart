import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const AddressContext = createContext();

const LS_KEY = 'ck_selected_address';

export const AddressProvider = ({ children }) => {
    const { user } = useAuth();
    const [addressList, setAddressList] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(() => {
        try { return JSON.parse(localStorage.getItem(LS_KEY)) || null; } catch { return null; }
    });
    const [loading, setLoading] = useState(false);

    // ── Fetch saved addresses when user logs in ────────────────────────────────
    const fetchAddresses = useCallback(async () => {
        if (!user) { setAddressList([]); return; }
        try {
            const res = await api.get('/address/my');
            setAddressList(res.data);
            // Auto-select default if nothing selected yet
            if (!selectedAddress) {
                const def = res.data.find(a => a.isDefault) || res.data[0];
                if (def) selectAddress(def);
            }
        } catch (err) {
            console.error('fetchAddresses error:', err);
        }
    }, [user]);

    useEffect(() => { fetchAddresses(); }, [fetchAddresses]);

    // ── Persist selection to localStorage ─────────────────────────────────────
    const selectAddress = (addr) => {
        setSelectedAddress(addr);
        if (addr) localStorage.setItem(LS_KEY, JSON.stringify(addr));
        else localStorage.removeItem(LS_KEY);
    };

    // ── Add a new address ──────────────────────────────────────────────────────
    const addAddress = async (fields) => {
        const res = await api.post('/address/add', fields);
        await fetchAddresses();
        return res.data;
    };

    // ── Update existing address ────────────────────────────────────────────────
    const updateAddress = async (id, fields) => {
        const res = await api.put(`/address/update/${id}`, fields);
        // Refresh list and update selectedAddress if it was the one edited
        await fetchAddresses();
        if (selectedAddress?._id === id) selectAddress(res.data);
        return res.data;
    };

    // ── Set default ────────────────────────────────────────────────────────────
    const setDefault = async (id) => {
        await api.put(`/address/set-default/${id}`);
        await fetchAddresses();
    };

    // ── Delete an address ──────────────────────────────────────────────────────
    const deleteAddress = async (id) => {
        await api.delete(`/address/${id}`);
        if (selectedAddress?._id === id) selectAddress(null);
        await fetchAddresses();
    };

    // ── Detect current GPS location → reverse geocode → return address object ──
    const detectCurrentLocation = () =>
        new Promise((resolve, reject) => {
            if (!navigator.geolocation) return reject(new Error('Geolocation not supported'));
            setLoading(true);
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        const res = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
                        );
                        const data = await res.json();
                        const fullAddress =
                            data.display_name ||
                            data.address?.city ||
                            data.address?.town ||
                            data.address?.village ||
                            'Current Location';
                        setLoading(false);
                        resolve({ label: 'Other', fullAddress, latitude, longitude });
                    } catch {
                        setLoading(false);
                        resolve({ label: 'Other', fullAddress: 'Current Location', latitude, longitude });
                    }
                },
                (err) => { setLoading(false); reject(err); },
                { timeout: 10000 }
            );
        });

    // ── Coords helper used by Home / ShopMap ──────────────────────────────────
    const activeCoords = selectedAddress
        ? {
            latitude: selectedAddress.location.coordinates[1],
            longitude: selectedAddress.location.coordinates[0],
        }
        : null;

    return (
        <AddressContext.Provider value={{
            addressList,
            selectedAddress,
            activeCoords,
            loading,
            addAddress,
            selectAddress,
            setDefault,
            deleteAddress,
            updateAddress,
            detectCurrentLocation,
            refreshAddresses: fetchAddresses,
        }}>
            {children}
        </AddressContext.Provider>
    );
};

export const useAddress = () => useContext(AddressContext);
