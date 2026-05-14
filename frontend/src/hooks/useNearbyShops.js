import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';

// ─── Haversine distance (km) ──────────────────────────────────────────────────
export function haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * useNearbyShops
 *
 * Fetches shops from Firestore, computes haversine distance from user,
 * and returns those within `radiusKm`.
 *
 * @param {{ latitude: number, longitude: number } | null} coords
 * @param {number} radiusKm
 * @returns {{ shops, loading, refetch }}
 */
export function useNearbyShops(coords, radiusKm) {
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetch = useCallback(async () => {
        if (!coords?.latitude || !coords?.longitude) return;
        setLoading(true);
        try {
            const q = query(collection(db, 'shops'), where('isOpen', '==', true), limit(60));
            const snap = await getDocs(q);
            const all = snap.docs.map(d => ({ _id: d.id, id: d.id, ...d.data() }));
            const filtered = all
                .map(s => ({
                    ...s,
                    distanceKm: +haversineKm(
                        coords.latitude, coords.longitude,
                        // Firestore shops store lat/lng directly OR inside location.coordinates
                        s.lat ?? s.location?.coordinates?.[1],
                        s.lng ?? s.location?.coordinates?.[0]
                    ).toFixed(1)
                }))
                .filter(s => !isNaN(s.distanceKm) && s.distanceKm <= radiusKm)
                .sort((a, b) => a.distanceKm - b.distanceKm);
            setShops(filtered);
        } catch (e) {
            console.error('[useNearbyShops]', e);
            setShops([]);
        } finally {
            setLoading(false);
        }
    }, [coords?.latitude, coords?.longitude, radiusKm]);

    useEffect(() => { fetch(); }, [fetch]);

    return { shops, loading, refetch: fetch };
}
