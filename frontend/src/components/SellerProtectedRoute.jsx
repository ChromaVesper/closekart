import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SellerProtectedRoute = ({ children }) => {
    const { user, profile, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        console.log("[SellerProtectedRoute] Auth is still loading, locking render.");
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
                    <p className="text-sm font-bold text-gray-500 animate-pulse">Synchronizing seller profile...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Direct users to buyer dashboard if they are NOT sellers
    if (profile?.role !== 'seller') {
        return <Navigate to="/buyer-dashboard" replace />;
    }

    return children;
};

export default SellerProtectedRoute;
