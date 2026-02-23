import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setErrorMsg('');
        try {
            const res = await authService.forgotPassword(email);
            setMessage(res.msg || 'Reset email sent.');
        } catch (err) {
            setErrorMsg(err.response?.data?.msg || 'Could not process request');
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
                <h2 className="text-3xl font-bold text-center mb-6 text-blue-900">Forgot Password</h2>
                {message && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm font-semibold">{message}</div>}
                {errorMsg && <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm font-semibold">{errorMsg}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition transform active:scale-95">
                        Send Reset Link
                    </button>
                </form>
                <div className="mt-6 text-center text-sm text-gray-600">
                    Remembered? <Link to="/login" className="text-blue-600 font-bold hover:underline">Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
