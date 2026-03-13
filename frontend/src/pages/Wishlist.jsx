import React, { useEffect, useState } from 'react';
import { Heart, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const Wishlist = () => {
    const { user, loading: authLoading } = useAuth();
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const docRef = doc(db, 'users', user.uid);

        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setWishlistItems(data.wishlist || []);
            } else {
                setWishlistItems([]);
            }
            setLoading(false);
        }, (err) => {
            console.error("Firestore Listen Error:", err);
            setError('Failed to load wishlist');
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-pink-100 border-t-pink-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Heart className="text-pink-500 fill-pink-500/20" size={20} />
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 bg-gray-50/50">
                <div className="glass-card p-10 rounded-3xl text-center max-w-md w-full shadow-lg border border-gray-100 border-t-pink-100/50 relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-pink-400 to-rose-400"></div>
                    <div className="w-24 h-24 bg-pink-50 rounded-full flex justify-center items-center mx-auto mb-6 shadow-inner">
                        <Heart size={44} className="text-pink-400 fill-pink-100" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Save your favorites</h2>
                    <p className="text-gray-500 mb-8 font-medium">Sign in to sync your wishlist across all devices and never lose track of what you love.</p>
                    <Link to="/login" className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3.5 rounded-xl text-md font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all">
                        Sign In Now <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] py-10 relative overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="absolute top-[-15%] right-[-10%] w-[500px] h-[500px] bg-pink-400/5 rounded-full blur-3xl -z-10 animate-float"></div>
            <div className="absolute top-[20%] left-[-15%] w-[400px] h-[400px] bg-rose-400/5 rounded-full blur-3xl -z-10 animate-float" style={{ animationDelay: '3s' }}></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex items-end justify-between mb-10 pb-4 border-b border-gray-200/60">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3 tracking-tight">
                            <div className="p-2 bg-pink-100 rounded-xl">
                                <Heart size={26} className="text-pink-600 fill-pink-500" />
                            </div>
                            My Collection
                        </h1>
                        <p className="text-gray-500 mt-2 font-medium ml-1">
                            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(n => (
                            <div key={n} className="bg-white rounded-2xl h-[320px] animate-pulse border border-gray-100 shadow-sm">
                                <div className="h-48 bg-gray-100 rounded-t-2xl w-full"></div>
                                <div className="p-4 space-y-3">
                                    <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="bg-red-50/80 backdrop-blur-sm text-red-600 p-5 rounded-2xl text-sm font-medium border border-red-200 flex items-center shadow-sm">
                        ⚠️ {error}
                    </div>
                ) : wishlistItems.length === 0 ? (
                    <div className="text-center py-24 px-4 bg-white/50 backdrop-blur-md rounded-3xl border border-gray-100 shadow-sm max-w-3xl mx-auto mt-10">
                        <div className="relative inline-block mb-6">
                            <div className="absolute -inset-4 bg-pink-100 rounded-full blur-lg opacity-60"></div>
                            <Heart size={64} className="relative text-pink-300 fill-pink-50 mx-auto" />
                            <Sparkles size={24} className="absolute -top-2 -right-2 text-yellow-400 animate-pulse" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Your wishlist is empty</h2>
                        <p className="text-gray-500 font-medium max-w-sm mx-auto mb-8">
                            Looks like you haven't saved anything yet. Discover our amazing products and hit the heart icon to save them here!
                        </p>
                        <Link to="/search" className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-3.5 rounded-xl text-md font-bold hover:bg-black hover:shadow-xl hover:-translate-y-0.5 transition-all">
                            Start Exploring
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {wishlistItems.map((item, idx) => (
                            <div key={item._id || idx} className="transform hover:-translate-y-1 transition-all duration-300">
                                <ProductCard product={item.product || item} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;
