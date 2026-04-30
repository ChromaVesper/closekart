import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function BuyerProtectedRoute({ children }) {
    const { user, profile, loading } = useAuth();

    // Race condition buffer: If Firestore profile hasn't updated yet but 
    // localStorage says the user just signed in as a buyer, show loading.
    const intendedRole = localStorage.getItem("userRole");
    const isProfileUpdating = intendedRole === 'buyer' && profile?.role !== 'buyer' && profile?.role !== undefined;

    if (loading || isProfileUpdating) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
                    <p className="text-sm font-bold text-gray-500 animate-pulse">Synchronizing buyer profile...</p>
                </div>
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
