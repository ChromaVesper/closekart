import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// --- Signup ---
const signup = async (name, email, password) => {
    const response = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password,
        role: 'customer' // default role
    });
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
    }
    return response.data;
};

// --- Login ---
const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
    });
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
    }
    return response.data;
};

// --- Forgot Password ---
const forgotPassword = async (email) => {
    const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
    return response.data;
};

// --- Reset Password ---
const resetPassword = async (token, password) => {
    const response = await axios.post(`${API_URL}/auth/reset-password/${token}`, { password });
    return response.data;
};

// --- Logout ---
const logout = () => {
    localStorage.removeItem('token');
};

const authService = {
    signup,
    login,
    forgotPassword,
    resetPassword,
    logout,
};

export default authService;
