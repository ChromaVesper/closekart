import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Search, Package, Compass, ShoppingBag, Star, Tag } from 'lucide-react';

// ─── Skeleton Card ────────────────────────────────────────────────────────────
const SkeletonCard = () => (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm animate-pulse">
        <div className="h-44 bg-gray-100" />
        <div className="p-4 space-y-2">
            <div className="h-3 bg-gray-100 rounded-full w-1/3" />
            <div className="h-4 bg-gray-200 rounded-full w-3/4" />
            <div className="h-3 bg-gray-100 rounded-full w-1/2" />
            <div className="flex items-center justify-between pt-2">
                <div className="h-5 bg-gray-200 rounded-full w-16" />
                <div className="h-8 bg-gray-100 rounded-xl w-20" />
            </div>
        </div>
    </div>
);

// ─── Product Card ─────────────────────────────────────────────────────────────
const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const [imgError, setImgError] = useState(false);

    const categoryColors = {
        Food: 'bg-orange-50 text-orange-600',
        Grocery: 'bg-green-50 text-green-600',
        Electronics: 'bg-blue-50 text-blue-600',
        Fashion: 'bg-purple-50 text-purple-600',
        Beverages: 'bg-cyan-50 text-cyan-600',
        Snacks: 'bg-yellow-50 text-yellow-700',
        Dairy: 'bg-sky-50 text-sky-600',
        General: 'bg-gray-50 text-gray-600',
    };
    const catColor = categoryColors[product.category] || 'bg-gray-50 text-gray-600';

    return (
        <div
            className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
            onClick={() => navigate(`/shop/${product.shopId}`)}
        >
            {/* Image */}
            <div className="relative h-44 bg-gradient-to-br from-slate-50 to-gray-100 overflow-hidden">
                {product.image && !imgError ? (
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Package size={44} className="text-gray-200" strokeWidth={1.5} />
                    </div>
                )}
                {/* Out of stock overlay */}
                {!product.inStock && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                        <span className="px-3 py-1 bg-red-500 text-white text-xs font-black rounded-full uppercase tracking-widest">
                            Out of Stock
                        </span>
                    </div>
                )}
                {/* Category badge */}
                <span className={`absolute top-3 left-3 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${catColor} shadow-sm`}>
                    {product.category || 'General'}
                </span>
            </div>

            {/* Info */}
            <div className="p-4 flex flex-col flex-1">
                <p className="text-[11px] font-bold text-gray-400 mb-1 truncate">
                    {product.shopName || 'Local Shop'}
                </p>
                <h3 className="font-black text-gray-900 text-sm leading-tight line-clamp-2 mb-auto">
                    {product.name}
                </h3>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                    <span className="text-lg font-black text-gray-900">
                        ₹{Number(product.price || 0).toLocaleString('en-IN')}
                    </span>
                    <button
                        className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all ${
                            product.inStock
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-500/20'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                        disabled={!product.inStock}
                        onClick={e => { e.stopPropagation(); navigate(`/shop/${product.shopId}`); }}
                    >
                        View Shop
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── CATEGORY CHIPS ───────────────────────────────────────────────────────────
const CATEGORIES = ['All', 'Food', 'Grocery', 'Electronics', 'Fashion', 'Beverages', 'Snacks', 'Dairy', 'General'];

// ─── MAIN EXPLORE PAGE ────────────────────────────────────────────────────────
export default function Explore() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const snap = await getDocs(collection(db, 'products'));
                const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                setProducts(data);
            } catch (err) {
                console.error('Explore fetch error:', err);
                setError('Could not load products. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Filtered products
    const filtered = products.filter(p => {
        const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.shopName?.toLowerCase().includes(search.toLowerCase());
        const matchCat = activeCategory === 'All' || p.category === activeCategory;
        return matchSearch && matchCat;
    });

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-24">
            {/* Hero Header */}
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 pt-10 pb-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-xs font-black px-4 py-2 rounded-full mb-4 border border-white/30">
                        <Compass size={14} /> Discover Local Products
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tight">
                        Explore Marketplace
                    </h1>
                    <p className="text-white/80 text-sm font-medium">
                        Browse fresh products from shops near you
                    </p>

                    {/* Search bar */}
                    <div className="relative mt-6 max-w-xl mx-auto">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            id="explore-search"
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search products or shops..."
                            className="w-full pl-11 pr-4 py-3.5 bg-white rounded-2xl text-sm font-medium text-gray-800 outline-none shadow-xl shadow-black/10 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-300"
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 -mt-10">
                {/* Category Filter */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-6">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`shrink-0 px-4 py-2 rounded-2xl text-xs font-black transition-all border ${
                                activeCategory === cat
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                                    : 'bg-white text-gray-600 border-gray-100 hover:border-indigo-200 shadow-sm'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-700 rounded-2xl p-4 mb-6 text-sm font-bold text-center">
                        {error}
                    </div>
                )}

                {/* Results count */}
                {!loading && (
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-bold text-gray-500">
                            {filtered.length} product{filtered.length !== 1 ? 's' : ''} found
                        </p>
                        {search && (
                            <button
                                onClick={() => { setSearch(''); setActiveCategory('All'); }}
                                className="text-xs font-bold text-indigo-600 hover:underline"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                )}

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                            <ShoppingBag size={32} className="text-indigo-300" />
                        </div>
                        <h3 className="text-lg font-black text-gray-800 mb-1">No Products Found</h3>
                        <p className="text-gray-400 text-sm max-w-xs">
                            {search ? `No results for "${search}". Try a different keyword.` : 'No products available right now. Check back soon!'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filtered.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
