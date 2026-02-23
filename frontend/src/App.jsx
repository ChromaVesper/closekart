import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Search from './pages/Search';
import ShopDetails from './pages/ShopDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import ShopDashboard from './pages/ShopDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Cart from './pages/Cart';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AuthSuccess from './pages/AuthSuccess';
import OAuthSuccess from './pages/OAuthSuccess';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import SelectAddressPage from './pages/SelectAddressPage';
import Shops from './pages/Shops';
import Orders from './pages/Orders';
import RegisterShop from './pages/RegisterShop';
import Pricing from './pages/Pricing';
import About from './pages/About';

// SwapKeeper
import SwapKeeperRoute from './components/SwapKeeperRoute';
import SwapKeeperLayout from './pages/swapkeeper/SwapKeeperLayout';
import SwapKeeperDashboard from './pages/swapkeeper/SwapKeeperDashboard';
import SwapKeeperItems from './pages/swapkeeper/SwapKeeperItems';
import SwapKeeperOrders from './pages/swapkeeper/SwapKeeperOrders';
import SwapKeeperProfile from './pages/swapkeeper/SwapKeeperProfile';

function App() {
    return (
        <Router basename="/closekart">
            <Routes>
                {/* ── SwapKeeper Dashboard (standalone layout, no shared Navbar/Footer) ── */}
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

                {/* ── Main Site (shared Navbar + Footer) ── */}
                <Route path="/*" element={
                    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
                        <Navbar />
                        <main className="container mx-auto px-4 py-8 flex-1">
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
                                <Route path="/profile" element={
                                    <ProtectedRoute><Profile /></ProtectedRoute>
                                } />
                                <Route path="/edit-profile" element={
                                    <ProtectedRoute><EditProfile /></ProtectedRoute>
                                } />
                                <Route path="/select-address" element={<SelectAddressPage />} />
                                <Route path="/shops" element={<Shops />} />
                                <Route path="/orders" element={<Orders />} />
                                <Route path="/register-shop" element={<RegisterShop />} />
                                <Route path="/pricing" element={<Pricing />} />
                                <Route path="/about" element={<About />} />
                                <Route path="/cart" element={
                                    <ProtectedRoute><Cart /></ProtectedRoute>
                                } />
                                <Route path="/shop-dashboard" element={
                                    <ProtectedRoute><ShopDashboard /></ProtectedRoute>
                                } />
                                <Route path="/admin" element={
                                    <ProtectedRoute><AdminDashboard /></ProtectedRoute>
                                } />
                            </Routes>
                        </main>
                        <Footer />
                    </div>
                } />
            </Routes>
        </Router>
    );
}

export default App;

