import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://closekart.onrender.com/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include auth token if available
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['x-auth-token'] = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export async function fetchShops(location) {
    if (!location || !location.lat || !location.lng) return [];

    const base = import.meta.env.VITE_API_URL || 'https://closekart.onrender.com/api';
    const res = await fetch(
        `${base}/shops?lat=${location.lat}&lng=${location.lng}`
    );

    if (!res.ok) return [];
    return res.json();
}

export default api;
