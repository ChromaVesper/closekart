import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useUserLocation } from '../context/LocationContext';
import { useAddress } from '../context/AddressContext';

// New Components
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import CategoryScroll from '../components/CategoryScroll';
import BannerSlider from '../components/BannerSlider';
import ProductCard from '../components/ProductCard';

const Home = () => {
    const { coords: gpsCoords } = useUserLocation();
    const { activeCoords } = useAddress();
    const coords = activeCoords || gpsCoords;

    const [products, setProducts] = useState([]);
    const [prodLoading, setProdLoading] = useState(false);

    // Fetch products for horizontal scroll section
    useEffect(() => {
        if (!coords?.latitude || !coords?.longitude) return;
        setProdLoading(true);
        api.get('/products/nearby', {
            params: { lat: coords.latitude, lng: coords.longitude, radius: 5000 },
        })
            .then(r => setProducts(r.data))
            .catch(() => setProducts([]))
            .finally(() => setProdLoading(false));
    }, [coords?.latitude, coords?.longitude]);

    return (
        <div className="bg-white min-h-screen font-sans">
            {/* Header and MobileNav are now handled by MainLayout in App.jsx */}
            <div className="md:hidden">
                <SearchBar />
                <CategoryScroll />
                <BannerSlider />
            </div>

            <div className="hidden md:block mb-8">
                <BannerSlider />
                <div className="mt-8">
                    <CategoryScroll />
                </div>
            </div>

            <div className="mt-6 px-4">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold text-gray-800">Recommended For You</h2>
                </div>

                {prodLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="w-full h-48 bg-gray-50 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {products.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl py-8 text-center text-gray-400">
                        <p className="text-xs">No products found nearby</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
