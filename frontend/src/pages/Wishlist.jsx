import React, { useEffect, useState } from 'react';
import { Heart, Loader } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

const Wishlist = () => {
    const { user } = useAuth();
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user) return;
        api.get('/wishlist')
            .then(res => setWishlistItems(res.data))
            .catch(() => setError('Failed to load wishlist'))
            .finally(() => setLoading(false));
    }, [user]);

    if (!user) {
        return (
            <div className="max-w-lg mx-auto text-center py-16">
                <Heart size={48} className="mx-auto mb-4 text-gray-200" />
                <p className="font-semibold text-gray-600">Sign in to see your wishlist</p>
                <Link to="/login" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
                    Sign In
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-6">
                <Heart size={24} className="text-pink-500 fill-pink-500" /> My Wishlist
            </h1>

            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader size={28} className="animate-spin text-blue-500" />
                </div>
            ) : error ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm">{error}</div>
            ) : wishlistItems.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <Heart size={48} className="mx-auto mb-4 text-gray-200" />
                    <p className="font-semibold text-gray-500">Your wishlist is empty</p>
                    <Link to="/" className="mt-4 inline-block bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
                        Discover Products
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {wishlistItems.map((item) => (
                        <ProductCard key={item._id} product={item.product || item} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Wishlist;
