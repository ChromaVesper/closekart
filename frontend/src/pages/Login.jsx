import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

const Login = () => {
    const [activeTab, setActiveTab] = useState('email');
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { loginStore } = useAuth();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    // Email login
    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setLoading(true);
        try {
            const data = await authService.login(formData.email, formData.password);
            if (data.token) {
                loginStore(data.token, data.user);
                navigate('/');
            }
        } catch (err) {
            setErrorMsg(err.response?.data?.msg || 'Login failed');
        }
        setLoading(false);
    };

    // Send OTP
    const handleSendOTP = async () => {
        setErrorMsg('');
        if (!phone || phone.length < 10) {
            setErrorMsg('Enter a valid phone number');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('http://localhost:3001/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone })
            });
            const data = await res.json();
            if (res.ok) {
                setOtpSent(true);
            } else {
                setErrorMsg(data.msg || 'Failed to send OTP');
            }
        } catch {
            setErrorMsg('Failed to send OTP');
        }
        setLoading(false);
    };

    // Verify OTP
    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setLoading(true);
        try {
            const res = await fetch('http://localhost:3001/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, otp })
            });
            const data = await res.json();
            if (res.ok && data.token) {
                loginStore(data.token, data.user);
                navigate('/');
            } else {
                setErrorMsg(data.msg || 'Invalid OTP');
            }
        } catch {
            setErrorMsg('OTP verification failed');
        }
        setLoading(false);
    };

    const tabs = [
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        { key: 'google', label: 'Google' },
    ];

    return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
                <h2 className="text-3xl font-bold text-center mb-6 text-blue-900">Welcome Back</h2>

                {/* Auth Tabs */}
                <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => { setActiveTab(tab.key); setErrorMsg(''); }}
                            className={`flex-1 py-2 rounded-md text-sm font-semibold transition ${activeTab === tab.key
                                    ? 'bg-blue-600 text-white shadow'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {errorMsg && <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm font-semibold">{errorMsg}</div>}

                {/* Email Tab */}
                {activeTab === 'email' && (
                    <form onSubmit={handleEmailLogin} className="space-y-5">
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition transform active:scale-95 disabled:opacity-50"
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                        <div className="text-center text-sm text-gray-600">
                            <Link to="/forgot-password" className="text-blue-600 hover:underline">Forgot password?</Link>
                        </div>
                    </form>
                )}

                {/* Phone Tab */}
                {activeTab === 'phone' && (
                    <div className="space-y-5">
                        {!otpSent ? (
                            <>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                                        placeholder="+91 9876543210"
                                    />
                                </div>
                                <button
                                    onClick={handleSendOTP}
                                    disabled={loading}
                                    className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition transform active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? 'Sending...' : 'Send OTP'}
                                </button>
                            </>
                        ) : (
                            <form onSubmit={handleVerifyOTP} className="space-y-5">
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Enter OTP sent to {phone}</label>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        maxLength={6}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-center text-2xl tracking-widest font-mono"
                                        placeholder="000000"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition transform active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? 'Verifying...' : 'Verify OTP'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setOtpSent(false); setOtp(''); }}
                                    className="w-full text-gray-500 text-sm hover:text-blue-600 transition"
                                >
                                    Change phone number
                                </button>
                            </form>
                        )}
                    </div>
                )}

                {/* Google Tab */}
                {activeTab === 'google' && (
                    <div className="space-y-5">
                        <p className="text-center text-gray-500 text-sm mb-4">Sign in securely with your Google account</p>
                        <button
                            type="button"
                            onClick={() => window.location.href = "http://localhost:3001/api/auth/google"}
                            className="w-full flex items-center justify-center bg-white text-gray-700 font-bold py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition transform active:scale-95 shadow-sm"
                        >
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google logo" className="w-5 h-5 mr-3" />
                            Continue with Google
                        </button>
                    </div>
                )}

                <div className="mt-6 text-center text-sm text-gray-600">
                    Don't have an account? <Link to="/register" className="text-blue-600 font-bold hover:underline">Sign up</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
