/**
 * useShareLocation — hook for generating and sharing a live GPS location URL.
 *
 * The app uses HashRouter on GitHub Pages, so shareable URLs use the format:
 *   https://chromavesper.github.io/closekart/#/select-address?lat=X&lng=Y
 *
 * This hook:
 *  1. Requests high-accuracy GPS from the device
 *  2. Validates the received coordinates (never null/NaN/undefined)
 *  3. Builds the correct shareable URL (HashRouter-aware)
 *  4. Copies to clipboard / uses Web Share API (with HTTP fallback)
 *  5. Returns status for the UI to display
 */

import { useState, useCallback } from 'react';

// ─── URL Builder ──────────────────────────────────────────────────────────────

/**
 * Build the full shareable URL for a location.
 *
 * Works on:
 *   - localhost:5173  → http://localhost:5173/#/select-address?lat=X&lng=Y
 *   - chromavesper.github.io/closekart → .../closekart/#/select-address?lat=X&lng=Y
 *
 * Uses origin + pathname so it always points at the app root regardless of
 * which route the user is currently on. The hash fragment carries the route
 * + query params because HashRouter interprets everything after '#'.
 */
export function buildShareUrl(lat, lng) {
    if (lat === null || lat === undefined || lng === null || lng === undefined) {
        console.error('[ShareLocation] buildShareUrl called with null/undefined coords');
        return null;
    }

    // Strip any trailing hash from pathname (shouldn't happen but be safe)
    const base = window.location.origin + window.location.pathname.replace(/#.*$/, '');
    // Ensure base doesn't end with trailing slash duplication
    const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;

    // Round to 6 decimal places (~11cm precision) to keep URLs clean
    const latStr = Number(lat).toFixed(6);
    const lngStr = Number(lng).toFixed(6);

    const url = `${cleanBase}/#/select-address?lat=${latStr}&lng=${lngStr}`;

    return url;
}

/**
 * Build a share URL from a saved address object.
 * The address must have latitude/longitude (or lat/lng) fields.
 * Guard against 0-valued coordinates using explicit null checks.
 */
export function buildAddressShareUrl(address) {
    const lat = address?.latitude !== undefined ? address.latitude : address?.lat;
    const lng = address?.longitude !== undefined ? address.longitude : address?.lng;

    // Explicit null/undefined check — 0 is a valid coordinate (equator/prime meridian)
    if (lat === null || lat === undefined || lng === null || lng === undefined) return null;

    const latNum = Number(lat);
    const lngNum = Number(lng);
    if (!isFinite(latNum) || !isFinite(lngNum)) return null;

    return buildShareUrl(latNum, lngNum);
}

// ─── GPS ──────────────────────────────────────────────────────────────────────

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
                resolve(position);
            },
            (err) => {
                reject(err);
            },
            GEO_OPTIONS
        );
    });
}

// ─── Clipboard (with HTTP fallback for non-HTTPS / older browsers) ────────────

async function copyToClipboard(text) {
    // Modern Clipboard API (requires HTTPS or localhost)
    if (navigator.clipboard?.writeText) {
        try {
            await navigator.clipboard.writeText(text);
            return;
        } catch {
            // Fall through to execCommand fallback
        }
    }

    // Fallback: document.execCommand (deprecated but still works in many browsers)
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
        document.execCommand('copy');
    } finally {
        document.body.removeChild(ta);
    }
}

async function shareOrCopy(url, title = 'My Location on CloseKart') {
    // Web Share API — native mobile share sheet (Android/iOS)
    if (navigator.share) {
        try {
            await navigator.share({ title, url });
            return 'shared';
        } catch (e) {
            if (e.name === 'AbortError') return 'cancelled'; // user dismissed sheet
            // Other error — fall through to clipboard
        }
    }
    // Clipboard fallback
    await copyToClipboard(url);
    return 'copied';
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useShareLocation()
 *
 * Returns:
 *   shareLiveLocation()  — fetches GPS, builds URL, copies/shares it
 *   shareAddress(addr)   — builds URL from saved address coords
 *   status               — 'idle' | 'loading' | 'copied' | 'shared' | 'error'
 *   error                — human-readable error string or null
 *   reset()              — reset back to idle
 */
export function useShareLocation() {
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState(null);
    const [lastUrl, setLastUrl] = useState(null);

    const reset = useCallback(() => {
        setStatus('idle');
        setError(null);
    }, []);

    /** Get live GPS, build URL, share/copy it */
    const shareLiveLocation = useCallback(async () => {
        setStatus('loading');
        setError(null);
        try {
            const position = await getCurrentPosition();
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            // Strict validation
            if (
                typeof lat !== 'number' || !isFinite(lat) || lat < -90 || lat > 90 ||
                typeof lng !== 'number' || !isFinite(lng) || lng < -180 || lng > 180
            ) {
                throw new Error(`GPS returned invalid coordinates: lat=${lat}, lng=${lng}`);
            }

            const url = buildShareUrl(lat, lng);
            if (!url) throw new Error('Failed to build share URL');

            setLastUrl(url);
            const result = await shareOrCopy(url);
            setStatus(result === 'cancelled' ? 'idle' : result);
        } catch (err) {
            const msg = err.code === 1
                ? 'Location permission denied. Please allow location access in your browser settings.'
                : err.code === 2
                ? 'Location unavailable. Make sure GPS is enabled.'
                : err.code === 3
                ? 'Location timed out. Please try again.'
                : (err.message || 'Could not get your location.');
            setError(msg);
            setStatus('error');
        }
        // Auto-reset success state after 4 seconds
        setTimeout(() => setStatus(s => (s !== 'idle' && s !== 'error') ? 'idle' : s), 4000);
    }, []);

    /** Share a saved address by its lat/lng */
    const shareAddress = useCallback(async (address) => {
        setStatus('loading');
        setError(null);
        try {
            const url = buildAddressShareUrl(address);
            if (!url) {
                throw new Error(
                    'This address has no map coordinates. Edit the address and drop a pin on the map to add them.'
                );
            }
            setLastUrl(url);
            const result = await shareOrCopy(url, 'Delivery Address on CloseKart');
            setStatus(result === 'cancelled' ? 'idle' : result);
        } catch (err) {
            setError(err.message);
            setStatus('error');
        }
        setTimeout(() => setStatus(s => (s !== 'idle' && s !== 'error') ? 'idle' : s), 4000);
    }, []);

    return { shareLiveLocation, shareAddress, status, error, lastUrl, reset };
}
