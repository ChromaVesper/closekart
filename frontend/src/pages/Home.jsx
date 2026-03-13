import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useUserLocation } from '../context/LocationContext';
import { useAddress } from '../context/AddressContext';
import { Sparkles, MapPin, TrendingUp, Store } from 'lucide-react';

// New Components
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import CategoryScroll from '../components/CategoryScroll';
import HeroCarousel from '../components/HeroCarousel';
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

    // Dummy trending for UI purposes if needed
    const trendingProducts = products.length > 0 ? products.slice(0, 4) : [];

    return (
        <div className="bg-[#F8FAFC] min-h-screen font-sans relative overflow-x-hidden pb-12">

            {/* Ambient Background Elements */}
            <div className="absolute top-0 left-0 w-full h-[40vh] bg-gradient-to-b from-blue-50/80 to-transparent -z-10 pointer-events-none"></div>
            <div className="absolute top-[10%] right-[-5%] w-96 h-96 bg-blue-400/10 rounded-full blur-3xl -z-10 animate-float"></div>
            <div className="absolute top-[30%] left-[-10%] w-72 h-72 bg-indigo-400/10 rounded-full blur-3xl -z-10 animate-float" style={{ animationDelay: '2s' }}></div>

            <div className="md:hidden pt-2">
                <SearchBar />
                <div className="mt-4">
                    <HeroCarousel />
                </div>
                <div className="mt-6 mb-2 flex flex-col px-4">
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Shop by Category</h2>
                </div>
                <CategoryScroll />
            </div>

            <div className="hidden md:block mb-8 relative z-10 pt-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <HeroCarousel />
                    <div className="mt-10">
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-4">Explore Categories</h2>
                        <CategoryScroll />
                    </div>
                </div>
            </div>

            {/* Trending Products Section */}
            <div className="mt-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
                <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-200/60">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2.5 tracking-tight">
                        <TrendingUp className="text-rose-500" size={24} />
                        Trending Products
                    </h2>
                </div>

                <div className="flex overflow-x-auto no-scrollbar gap-4 sm:gap-6 pb-4 snap-x">
                    {prodLoading ? (
                        [1, 2, 3, 4].map(i => (
                            <div key={i} className="min-w-[240px] md:min-w-[280px] bg-white rounded-2xl h-[340px] shadow-sm border border-gray-100 overflow-hidden flex flex-col animate-pulse snap-start">
                                <div className="h-44 bg-gray-100/80 w-full" />
                                <div className="p-4 flex flex-col flex-1">
                                    <div className="h-4 bg-gray-100 rounded-md w-1/3 mt-2"></div>
                                    <div className="h-5 bg-gray-100 rounded-md w-3/4 mt-3"></div>
                                    <div className="h-8 bg-gray-100 rounded-lg w-1/4 mt-auto"></div>
                                </div>
                            </div>
                        ))
                    ) : trendingProducts.length > 0 ? (
                        trendingProducts.map((product) => (
                            <div key={product._id} className="min-w-[240px] md:min-w-[280px] snap-start">
                                <ProductCard product={product} />
                            </div>
                        ))
                    ) : (
                        <div className="text-sm text-gray-500 w-full py-8 text-center bg-white rounded-2xl border border-gray-100">No trending products available.</div>
                    )}
                </div>
            </div>

            {/* Recommended/Nearby Section */}
            <div className="mt-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-4 border-b border-gray-200/60">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2.5 tracking-tight">
                            <Sparkles className="text-blue-500" size={24} />
                            Recommended For You
                        </h2>
                        <p className="text-sm font-medium text-gray-500 mt-1 sm:ml-8">Fresh finds based on your location</p>
                    </div>
                    {coords && (
                        <div className="mt-3 sm:mt-0 flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-100 rounded-full shadow-sm text-xs font-bold text-gray-600 self-start sm:self-end">
                            <MapPin size={12} className="text-blue-500" />
                            Nearby items
                        </div>
                    )}
                </div>

                <div className="flex overflow-x-auto no-scrollbar gap-4 sm:gap-6 pb-4 snap-x">
                    {prodLoading ? (
                        [1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="min-w-[200px] md:min-w-[240px] bg-white rounded-2xl h-[320px] shadow-sm border border-gray-100 overflow-hidden flex flex-col animate-pulse snap-start">
                                <div className="h-36 bg-gray-100/80 w-full" />
                                <div className="p-4 flex flex-col flex-1">
                                    <div className="h-4 bg-gray-100 rounded-md w-1/3 mt-2"></div>
                                    <div className="h-5 bg-gray-100 rounded-md w-3/4 mt-3"></div>
                                    <div className="h-8 bg-gray-100 rounded-lg w-1/4 mt-auto"></div>
                                </div>
                            </div>
                        ))
                    ) : products.length > 0 ? (
                        products.map((product) => (
                            <div key={product._id} className="min-w-[200px] md:min-w-[240px] snap-start">
                                <ProductCard product={product} />
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 px-4 bg-white/50 backdrop-blur-sm shadow-sm rounded-3xl border border-gray-100 w-full">
                            <div className="w-20 h-20 bg-blue-50 rounded-full flex justify-center items-center mx-auto mb-4 border border-blue-100 shadow-inner">
                                <Store size={32} className="text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No shops found</h3>
                            <p className="text-sm text-gray-500 font-medium max-w-sm mx-auto">
                                Enable location services or search another area to see nearby products.
                            </p>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default Home;
