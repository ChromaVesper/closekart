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
        <div className="bg-gray-50 min-h-screen pb-20 font-sans max-w-md mx-auto shadow-[0_0_15px_rgba(0,0,0,0.05)] bg-white">
            <Header />
            <SearchBar />
            <CategoryScroll />
            <BannerSlider />

            <div className="mt-6 px-4">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold text-gray-800">Recommended For You</h2>
                </div>

                {prodLoading ? (
                    <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-4 snap-x">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-36 h-48 bg-gray-100 rounded-lg animate-pulse flex-shrink-0 snap-start" />
                        ))}
                    </div>
                ) : products.length > 0 ? (
                    <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-4 -mx-4 px-4 snap-x">
                        {products.slice(0, 10).map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl py-8 text-center text-gray-400">
                        <p className="text-xs">No products found nearby</p>
                    </div>
                )}
            </div>

            {/* Spacer for bottom nav */}
            <div className="h-10"></div>
        </div>
    );
};

export default Home;
