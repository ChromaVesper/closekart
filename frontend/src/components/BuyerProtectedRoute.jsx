import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function BuyerProtectedRoute({ children }) {
    const { user, profile, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Direct users to seller dashboard if they are sellers
    if (profile?.role === 'seller') {
        return <Navigate to="/seller-dashboard" replace />;
    }

    return children;
}
