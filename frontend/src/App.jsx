import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import MainLayout from './components/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import SwapKeeperRoute from './components/SwapKeeperRoute';
import { useAuth } from './context/AuthContext';

// Loading Fallback
const PageLoader = () => (
    <div className="min-h-[60vh] flex items-center justify-center">
        <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 border-r-purple-500 animate-spin" />
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 opacity-20 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 animate-pulse-soft" />
            </div>
        </div>
    </div>
);

// Lazy Loaded Pages
const Home = React.lazy(() => import('./pages/Home'));
const Search = React.lazy(() => import('./pages/Search'));
const ShopDetails = React.lazy(() => import('./pages/ShopDetails'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const ShopDashboard = React.lazy(() => import('./pages/ShopDashboard'));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const Cart = React.lazy(() => import('./pages/Cart'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'));
const AuthSuccess = React.lazy(() => import('./pages/AuthSuccess'));
const OAuthSuccess = React.lazy(() => import('./pages/OAuthSuccess'));
const Account = React.lazy(() => import('./pages/Account'));
const Help = React.lazy(() => import('./pages/Help'));
const Profile = React.lazy(() => import('./pages/Profile'));
const EditProfile = React.lazy(() => import('./pages/EditProfile'));
const SelectAddressPage = React.lazy(() => import('./pages/SelectAddressPage'));
const Shops = React.lazy(() => import('./pages/Shops'));
const Orders = React.lazy(() => import('./pages/Orders'));
const RegisterShop = React.lazy(() => import('./pages/RegisterShop'));
const Pricing = React.lazy(() => import('./pages/Pricing'));
const About = React.lazy(() => import('./pages/About'));
const Play = React.lazy(() => import('./pages/Play'));
const SellerUploadShort = React.lazy(() => import('./pages/SellerUploadShort'));
const Wishlist = React.lazy(() => import('./pages/Wishlist'));
const Explore = React.lazy(() => import('./pages/Explore'));
const SellerLogin = React.lazy(() => import('./pages/SellerLogin'));
const SellerDashboard = React.lazy(() => import('./pages/SellerDashboard'));
const SetupShop = React.lazy(() => import('./pages/SetupShop'));
const AddProduct = React.lazy(() => import('./pages/AddProduct'));
const ManageProducts = React.lazy(() => import('./pages/ManageProducts'));
const SellerOrders = React.lazy(() => import('./pages/SellerOrders'));
const ShopkeeperDashboard = React.lazy(() => import('./pages/ShopkeeperDashboard'));
const BuyerDashboard = React.lazy(() => import('./pages/BuyerDashboard'));
const SelectRole = React.lazy(() => import('./pages/SelectRole'));
import SellerProtectedRoute from './components/SellerProtectedRoute';
import BuyerProtectedRoute from './components/BuyerProtectedRoute';
import AdminRoute from './components/AdminRoute';
// SwapKeeper Lazy Loaded Pages
const SwapKeeperLayout = React.lazy(() => import('./pages/swapkeeper/SwapKeeperLayout'));
const SwapKeeperDashboard = React.lazy(() => import('./pages/swapkeeper/SwapKeeperDashboard'));
const SwapKeeperItems = React.lazy(() => import('./pages/swapkeeper/SwapKeeperItems'));
const SwapKeeperOrders = React.lazy(() => import('./pages/swapkeeper/SwapKeeperOrders'));
const SwapKeeperProfile = React.lazy(() => import('./pages/swapkeeper/SwapKeeperProfile'));

const AnimatedRoutes = () => {
    const location = useLocation();
    
    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                {/* ── SwapKeeper Dashboard ── */}
                <Route path="/swapkeeper" element={
                    <SwapKeeperRoute>
                        <SwapKeeperLayout />
                    </SwapKeeperRoute>
                }>
                    <Route path="dashboard" element={<SwapKeeperDashboard />} />
                    <Route path="items" element={<SwapKeeperItems />} />
                    <Route path="orders" element={<SwapKeeperOrders />} />
                    <Route path="profile" element={<SwapKeeperProfile />} />
                </Route>

                {/* ── Main Site (Responsive Cross-Platform Layout) ── */}
                <Route path="/*" element={
                    <MainLayout>
                        <Suspense fallback={<PageLoader />}>
                            <Routes location={location} key={location.pathname}>
                                <Route path="/" element={<Home />} />
                                <Route path="/search" element={<Search />} />
                                <Route path="/shop/:id" element={<ShopDetails />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/forgot-password" element={<ForgotPassword />} />
                                <Route path="/reset-password/:token" element={<ResetPassword />} />
                                <Route path="/auth-success" element={<AuthSuccess />} />
                                <Route path="/oauth-success" element={<OAuthSuccess />} />
                                <Route path="/play" element={<Play />} />
                                <Route path="/explore" element={<Explore />} />
                                <Route path="/seller-login" element={<SellerLogin />} />
                                {/* Protected Routes */}
                                <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
                                <Route path="/buyer-dashboard" element={<BuyerProtectedRoute><BuyerDashboard /></BuyerProtectedRoute>} />
                                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                                <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
                                <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                                <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                                <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />

                                {/* Legacy/Direct Routes (Redirecting to new structure) */}
                                <Route path="/seller-dashboard" element={<Navigate to="/seller" replace />} /> 
                                <Route path="/shop-dashboard" element={<Navigate to="/seller" replace />} />
                                <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                                <Route path="/admin/*" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

                                {/* Other Routes */}
                                <Route path="/select-role" element={<SelectRole />} />
                                <Route path="/select-address" element={<SelectAddressPage />} />
                                <Route path="/shops" element={<Shops />} />
                                <Route path="/register-shop" element={<RegisterShop />} />
                                <Route path="/setup-shop" element={<SellerProtectedRoute><SetupShop /></SellerProtectedRoute>} />
                                <Route path="/pricing" element={<Pricing />} />
                                <Route path="/about" element={<About />} />
                                <Route path="/help" element={<Help />} />
                            </Routes>
                        </Suspense>
                    </MainLayout>
                } />

                {/* ── Professional Seller Portal ── */}
                <Route path="/seller" element={<SellerProtectedRoute><ShopkeeperDashboard /></SellerProtectedRoute>} />
                <Route path="/seller/*" element={<Navigate to="/seller" replace />} />
                {/* Alias: /shopkeeper-dashboard → /seller */}
                <Route path="/shopkeeper-dashboard" element={<Navigate to="/seller" replace />} />
            </Routes>
        </AnimatePresence>
    );
};

function App() {
    const { loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 border-r-purple-500 animate-spin" />
                    <div className="absolute inset-1.5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 opacity-15 animate-pulse" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 animate-pulse" />
                    </div>
                </div>
                <p className="text-sm font-bold text-gray-400 tracking-wide">Loading CloseKart...</p>
            </div>
        );
    }

    return (
        <Suspense fallback={<PageLoader />}>
            <AnimatedRoutes />
        </Suspense>
    );
}

export default App;
