import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { MapPin, ShoppingBag, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import ShopCard from '../components/ShopCard';

const Home = () => {
    const [shops, setShops] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch featured data
        const fetchData = async () => {
            try {
                const res = await api.get('/shops');
                // Limit to 6 for homepage
                setShops(res.data.slice(0, 6));
            } catch (error) {
                console.error("Error fetching data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-8 pb-12">
            {/* Hero Section */}
            <section className="bg-blue-600 text-white rounded-2xl p-8 md:p-12 shadow-lg relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                    <div className="inline-block bg-blue-700 text-blue-100 text-xs font-bold px-2 py-1 rounded mb-4">
                        NOW LIVE IN PATNA
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
                        Discover What’s <br />
                        <span className="text-yellow-300">Closest, Fastest, & Best</span>
                    </h1>
                    <p className="text-lg text-blue-100 mb-8 max-w-lg">
                        Compare prices, check real-time stock, and find delivery options from shops in Anisabad.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link to="/search" className="bg-white text-blue-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition shadow-md flex items-center justify-center">
                            <ShoppingBag className="mr-2" size={20} />
                            Find Products
                        </Link>
                        <Link to="/search?type=shops" className="bg-blue-700 text-white border border-blue-500 font-bold py-3 px-6 rounded-lg hover:bg-blue-800 transition shadow-md flex items-center justify-center">
                            <Store className="mr-2" size={20} />
                            Explore Shops
                        </Link>
                    </div>
                </div>

                {/* Abstract Background Shapes */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
                <div className="absolute bottom-0 right-20 -mb-10 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
            </section>

            {/* Categories */}
            <section>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Shop by Category</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {['Grocery', 'Dairy', 'Electronics', 'Stationery', 'Mobile Repair', 'Fashion'].map((cat) => (
                        <Link key={cat} to={`/search?category=${cat}`} className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 flex flex-col items-center justify-center text-center h-32 group">
                            <div className="bg-blue-50 text-blue-600 p-3 rounded-full mb-2 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <ShoppingBag size={24} />
                            </div>
                            <span className="font-medium text-gray-700 group-hover:text-blue-600 transition-colors">{cat}</span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Featured Shops */}
            <section>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Featured Shops Near You</h2>
                    <Link to="/search?type=shops" className="text-blue-600 font-medium hover:underline">View All</Link>
                </div>

                {loading ? (
                    <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {shops.length > 0 ? (
                            shops.map(shop => (
                                <ShopCard key={shop._id} shop={shop} />
                            ))
                        ) : (
                            <div className="col-span-full text-center text-gray-500 py-8 bg-gray-50 rounded-lg">
                                No shops found. Try running the backend seed script.
                            </div>
                        )}
                    </div>
                )}
            </section>

        </div>
    );
};

export default Home;
