import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import MainLayout from './components/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

// ─── Loading Fallback ─────────────────────────────────────────────────────────
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

// ─── Buyer Pages (Lazy Loaded) ────────────────────────────────────────────────
const Home               = React.lazy(() => import('./pages/Home'));
const Search             = React.lazy(() => import('./pages/Search'));
const ShopDetails        = React.lazy(() => import('./pages/ShopDetails'));
const Login              = React.lazy(() => import('./pages/Login'));
const Register           = React.lazy(() => import('./pages/Register'));
const ForgotPassword     = React.lazy(() => import('./pages/ForgotPassword'));
const ResetPassword      = React.lazy(() => import('./pages/ResetPassword'));
const AuthSuccess        = React.lazy(() => import('./pages/AuthSuccess'));
const OAuthSuccess       = React.lazy(() => import('./pages/OAuthSuccess'));
const Account            = React.lazy(() => import('./pages/Account'));
const Help               = React.lazy(() => import('./pages/Help'));
const Profile            = React.lazy(() => import('./pages/Profile'));
const EditProfile        = React.lazy(() => import('./pages/EditProfile'));
const SelectAddressPage  = React.lazy(() => import('./pages/SelectAddressPage'));
const Shops              = React.lazy(() => import('./pages/Shops'));
const Orders             = React.lazy(() => import('./pages/Orders'));
const About              = React.lazy(() => import('./pages/About'));
const Play               = React.lazy(() => import('./pages/Play'));
const Wishlist           = React.lazy(() => import('./pages/Wishlist'));
const Explore            = React.lazy(() => import('./pages/Explore'));
const Cart               = React.lazy(() => import('./pages/Cart'));

// ─── Routes ───────────────────────────────────────────────────────────────────
const AnimatedRoutes = () => {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/*" element={
                    <MainLayout>
                        <Suspense fallback={<PageLoader />}>
                            <Routes location={location} key={location.pathname}>
                                {/* ── Public ── */}
                                <Route path="/"                      element={<Home />} />
                                <Route path="/search"                element={<Search />} />
                                <Route path="/shop/:id"              element={<ShopDetails />} />
                                <Route path="/shops"                 element={<Shops />} />
                                <Route path="/explore"               element={<Explore />} />
                                <Route path="/play"                  element={<Play />} />
                                <Route path="/about"                 element={<About />} />
                                <Route path="/help"                  element={<Help />} />

                                {/* ── Auth ── */}
                                <Route path="/login"                       element={<Login />} />
                                <Route path="/register"                    element={<Register />} />
                                <Route path="/forgot-password"             element={<ForgotPassword />} />
                                <Route path="/reset-password/:token"       element={<ResetPassword />} />
                                <Route path="/auth-success"                element={<AuthSuccess />} />
                                <Route path="/oauth-success"               element={<OAuthSuccess />} />

                                {/* ── Buyer Protected ── */}
                                <Route path="/account"       element={<ProtectedRoute><Account /></ProtectedRoute>} />
                                <Route path="/profile"       element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                                <Route path="/edit-profile"  element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
                                <Route path="/cart"          element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                                <Route path="/orders"        element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                                <Route path="/wishlist"      element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />

                                {/* ── Shared location link receiver ── */}
                                <Route path="/select-address" element={<SelectAddressPage />} />

                                {/* ── Catch-all seller/admin redirects → home ── */}
                                <Route path="/seller"              element={<Navigate to="/" replace />} />
                                <Route path="/seller/*"            element={<Navigate to="/" replace />} />
                                <Route path="/seller-dashboard"    element={<Navigate to="/" replace />} />
                                <Route path="/setup-shop"          element={<Navigate to="/" replace />} />
                                <Route path="/shopkeeper-dashboard" element={<Navigate to="/" replace />} />
                                <Route path="/register-shop"       element={<Navigate to="/" replace />} />
                                <Route path="/select-role"         element={<Navigate to="/" replace />} />
                                <Route path="/buyer-dashboard"     element={<Navigate to="/account" replace />} />
                                <Route path="/admin"               element={<Navigate to="/" replace />} />
                                <Route path="/admin/*"             element={<Navigate to="/" replace />} />
                                <Route path="/swapkeeper"          element={<Navigate to="/" replace />} />
                                <Route path="/swapkeeper/*"        element={<Navigate to="/" replace />} />

                                {/* ── 404 ── */}
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </Suspense>
                    </MainLayout>
                } />
            </Routes>
        </AnimatePresence>
    );
};

// ─── App ──────────────────────────────────────────────────────────────────────
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
