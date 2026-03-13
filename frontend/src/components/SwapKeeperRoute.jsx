import { Navigate } from 'react-router-dom';

const ALLOWED_ROLES = ['swap_keeper', 'shopkeeper'];

const SwapKeeperRoute = ({ children }) => {
    const user = null; const logout = () => {}; const loginStore = () => {}; const loading = false;

    if (!user) return <Navigate to="/login" replace />;
    if (!ALLOWED_ROLES.includes(user.role)) return <Navigate to="/" replace />;

    return children;
};

export default SwapKeeperRoute;
