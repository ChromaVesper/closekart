import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://closekart.onrender.com/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API call failed:', error.response?.status, error.response?.data?.msg || error.message);
        if (error.response?.status === 401) {
            // Optional: Handle token expiration globally here if desired
            // localStorage.removeItem('token');
        }
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
