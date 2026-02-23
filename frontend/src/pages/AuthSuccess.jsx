import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { loginStore } = useAuth();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get('token');

        if (token) {
            // We just save the token globally. The AuthContext useEffect triggers
            // /api/auth/me automatically to fetch the full user payload matching the standard flow
            loginStore(token, null);
            navigate('/');
        } else {
            console.error("No token found in AuthSuccess redirect URL");
            navigate('/login');
        }
    }, [location, navigate, loginStore]);

    return (
        <div className="flex h-[80vh] items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <h2 className="mt-4 text-xl font-semibold text-gray-700">Completing login...</h2>
            </div>
        </div>
    );
};

export default AuthSuccess;
