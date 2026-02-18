import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LocationProvider } from './contexts/LocationContext';
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
import Cart from './pages/Cart';

function App() {
    return (
        <LocationProvider>
            <Router>
                <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
                    <Navbar />
                    <main className="container mx-auto px-4 py-8 flex-1">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/search" element={<Search />} />
                            <Route path="/shop/:id" element={<ShopDetails />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/dashboard" element={<ShopDashboard />} />
                            <Route path="/admin" element={<AdminDashboard />} />
                            <Route path="/cart" element={<Cart />} />
                        </Routes>
                    </main>
                    <Footer />
                </div>
            </Router>
        </LocationProvider >
    );
}

export default App;
