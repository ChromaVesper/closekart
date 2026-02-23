import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ALLOWED_ROLES = ['swap_keeper', 'shopkeeper'];

const SwapKeeperRoute = ({ children }) => {
    const { user } = useAuth();

    if (!user) return <Navigate to="/login" replace />;
    if (!ALLOWED_ROLES.includes(user.role)) return <Navigate to="/" replace />;

    return children;
};

export default SwapKeeperRoute;
