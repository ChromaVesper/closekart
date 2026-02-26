import React, { Suspense } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import SwapKeeperRoute from './components/SwapKeeperRoute';
import { useAuth } from './context/AuthContext';

// Loading Fallback
const PageLoader = () => (
    <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
    </div>
);

// Lazy Loaded Pages
const Home = React.lazy(() => import('./pages/Home'));
const Search = React.lazy(() => import('./pages/Search'));
const ShopDetails = React.lazy(() => import('./pages/ShopDetails'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const ShopDashboard = React.lazy(() => import('./pages/ShopDashboard'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const Cart = React.lazy(() => import('./pages/Cart'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'));
const AuthSuccess = React.lazy(() => import('./pages/AuthSuccess'));
const OAuthSuccess = React.lazy(() => import('./pages/OAuthSuccess'));
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

// SwapKeeper Lazy Loaded Pages
const SwapKeeperLayout = React.lazy(() => import('./pages/swapkeeper/SwapKeeperLayout'));
const SwapKeeperDashboard = React.lazy(() => import('./pages/swapkeeper/SwapKeeperDashboard'));
const SwapKeeperItems = React.lazy(() => import('./pages/swapkeeper/SwapKeeperItems'));
const SwapKeeperOrders = React.lazy(() => import('./pages/swapkeeper/SwapKeeperOrders'));
const SwapKeeperProfile = React.lazy(() => import('./pages/swapkeeper/SwapKeeperProfile'));

function App() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
            </div>
        );
    }

    return (
        <Router basename="/closekart">
            <Suspense fallback={<PageLoader />}>
                <Routes>
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
                                <Routes>
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

                                    {/* Protected Routes */}
                                    <Route path="/profile" element={user ? <Profile /> : <Login />} />
                                    <Route path="/edit-profile" element={user ? <EditProfile /> : <Login />} />
                                    <Route path="/cart" element={user ? <Cart /> : <Login />} />
                                    <Route path="/orders" element={user ? <Orders /> : <Login />} />
                                    <Route path="/wishlist" element={user ? <Wishlist /> : <Login />} />
                                    <Route path="/shop-dashboard" element={user ? <ShopDashboard /> : <Login />} />
                                    <Route path="/seller/upload-short" element={user ? <SellerUploadShort /> : <Login />} />
                                    <Route path="/admin" element={user ? <AdminDashboard /> : <Login />} />

                                    {/* Other Routes */}
                                    <Route path="/select-address" element={<SelectAddressPage />} />
                                    <Route path="/shops" element={<Shops />} />
                                    <Route path="/register-shop" element={<RegisterShop />} />
                                    <Route path="/pricing" element={<Pricing />} />
                                    <Route path="/about" element={<About />} />
                                </Routes>
                            </Suspense>
                        </MainLayout>
                    } />
                </Routes>
            </Suspense>
        </Router>
    );
}

export default App;
