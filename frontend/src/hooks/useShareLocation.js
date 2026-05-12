/**
 * useShareLocation — hook for generating and sharing a live GPS location URL.
 *
 * The app uses HashRouter, so shareable URLs must use the hash fragment:
 *   https://chromavesper.github.io/closekart/#/select-address?lat=X&lng=Y
 *
 * This hook:
 *  1. Requests high-accuracy GPS from the device
 *  2. Validates the received coordinates
 *  3. Builds the correct shareable URL (HashRouter-aware)
 *  4. Copies to clipboard / uses Web Share API
 *  5. Returns status for the UI to display
 */

import { useState, useCallback } from 'react';

// ─── Build a shareable URL that includes real coordinates ──────────────────────

/**
 * Build the full shareable URL for a location.
 * Uses the app's current origin + pathname so it works on:
 *   - localhost:5173
 *   - chromavesper.github.io/closekart
 */
export function buildShareUrl(lat, lng) {
    // e.g. "https://chromavesper.github.io/closekart/"
    const base = window.location.origin + window.location.pathname;
    // HashRouter: anchor is the route, query params go INSIDE the hash fragment
    const url = `${base}#/select-address?lat=${lat}&lng=${lng}`;
    console.log('[ShareLocation] Generated Latitude:', lat);
    console.log('[ShareLocation] Generated Longitude:', lng);
    console.log('[ShareLocation] Generated Share URL:', url);
    return url;
}

/**
 * Build a share URL from a saved address object.
 * The address must have latitude and longitude fields.
 */
export function buildAddressShareUrl(address) {
    const lat = address?.latitude ?? address?.lat;
    const lng = address?.longitude ?? address?.lng;
    if (!lat || !lng) return null;
    return buildShareUrl(lat, lng);
}

// ─── GPS coordinate fetching ──────────────────────────────────────────────────

const GEO_OPTIONS = {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 0,
};

function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by this browser.'));
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log('[ShareLocation] Current GPS:', position);
                resolve(position);
            },
            (err) => {
                console.warn('[ShareLocation] GPS error:', err.message);
                reject(err);
            },
            GEO_OPTIONS
        );
    });
}

// ─── Clipboard / Share API ───────────────────────────────────────────────────

async function shareOrCopy(url, title = 'My Location on CloseKart') {
    if (navigator.share) {
        try {
            await navigator.share({ title, url });
            return 'shared';
        } catch (e) {
            // User cancelled or share failed — fallback to clipboard
            if (e.name === 'AbortError') return 'cancelled';
        }
    }
    // Fallback: copy to clipboard
    await navigator.clipboard.writeText(url);
    return 'copied';
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useShareLocation()
 *
 * Returns:
 *   shareLiveLocation()  — gets GPS then shares URL
 *   shareAddress(addr)   — shares URL for a saved address
 *   status               — 'idle' | 'loading' | 'copied' | 'shared' | 'error'
 *   error                — error message string or null
 *   reset()              — reset state to idle
 */
export function useShareLocation() {
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState(null);

    const reset = useCallback(() => {
        setStatus('idle');
        setError(null);
    }, []);

    /** Share the user's current live GPS position */
    const shareLiveLocation = useCallback(async () => {
        setStatus('loading');
        setError(null);
        try {
            const position = await getCurrentPosition();
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            console.log('[ShareLocation] Latitude:', lat);
            console.log('[ShareLocation] Longitude:', lng);

            // Validate
            if (
                typeof lat !== 'number' || !isFinite(lat) || lat < -90 || lat > 90 ||
                typeof lng !== 'number' || !isFinite(lng) || lng < -180 || lng > 180
            ) {
                throw new Error(`Invalid coordinates: lat=${lat}, lng=${lng}`);
            }

            const url = buildShareUrl(lat, lng);
            const result = await shareOrCopy(url);
            setStatus(result === 'cancelled' ? 'idle' : result);
        } catch (err) {
            console.error('[ShareLocation] Error:', err.message);
            setError(err.message || 'Could not get your location. Please allow location access.');
            setStatus('error');
        }
        // Auto-reset after 3 seconds
        setTimeout(() => setStatus(s => (s !== 'idle' && s !== 'error') ? 'idle' : s), 3000);
    }, []);

    /** Share a saved address by its coordinates */
    const shareAddress = useCallback(async (address) => {
        setStatus('loading');
        setError(null);
        try {
            const url = buildAddressShareUrl(address);
            if (!url) throw new Error('This address does not have coordinates. Edit it and pick a location on the map first.');
            const result = await shareOrCopy(url, `Delivery Address on CloseKart`);
            setStatus(result === 'cancelled' ? 'idle' : result);
        } catch (err) {
            console.error('[ShareLocation] Address share error:', err.message);
            setError(err.message);
            setStatus('error');
        }
        setTimeout(() => setStatus(s => (s !== 'idle' && s !== 'error') ? 'idle' : s), 3000);
    }, []);

    return { shareLiveLocation, shareAddress, status, error, reset };
}
