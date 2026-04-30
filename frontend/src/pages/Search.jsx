import React, { useState, useEffect } from 'react';
import { useLocation as useRouteLocation, Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import ShopCard from '../components/ShopCard';
import { Search as SearchIcon, SlidersHorizontal, Store, ShoppingBag, Map, List, X } from 'lucide-react';
import MapComponent from '../components/MapComponent';
import { useUserLocation } from '../context/LocationContext';
import { motion, AnimatePresence } from 'framer-motion';

const Search = () => {
    const locationState = useRouteLocation();
    const { coords } = useUserLocation();
    const queryParams = new URLSearchParams(locationState.search);
    const initialQuery = queryParams.get('q') || '';
    const categoryQuery = queryParams.get('category') || '';

    const [query, setQuery] = useState(initialQuery);
    const [results, setResults] = useState([]);
    const [shopsForMap, setShopsForMap] = useState([]);
    const [type, setType] = useState('shops');
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState('list');

    useEffect(() => {
        handleSearch();
    }, [initialQuery, categoryQuery]);

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            let endpoint = type === 'products' ? '/products' : '/shops';
            let params = { search: query, category: categoryQuery };
            if (coords) { params.lat = coords.latitude; params.lng = coords.longitude; }

            const res = await api.get(endpoint, { params });
            setResults(res.data);

            if (type === 'shops') {
                setShopsForMap(res.data);
            } else {
                const uniqueShops = [...new Map(res.data.map(item => [item.shop._id, item.shop])).values()];
                setShopsForMap(uniqueShops);
            }
        } catch (error) {
            console.error('Search error:', error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col h-[calc(100vh-72px)] bg-gray-50/50"
        >
            {/* ── Top Search Bar ── */}
            <div className="shrink-0 px-4 py-3 bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm">
                <form onSubmit={handleSearch} className="flex gap-2.5 items-center">
                    {/* Search input */}
                    <div className="relative flex-1">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-sm pointer-events-none">
                            <SearchIcon size={14} className="text-white" strokeWidth={2.5} />
                        </div>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search shops, products, brands..."
                            className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 focus:bg-white transition-all"
                        />
                        {query && (
                            <button type="button" onClick={() => setQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={15} />
                            </button>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="shrink-0 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white text-sm font-bold rounded-2xl shadow-md shadow-indigo-300/30 hover:shadow-lg hover:shadow-indigo-300/50 hover:-translate-y-0.5 transition-all duration-200"
                    >
                        Search
                    </button>
                </form>

                {/* Type toggle + View toggle */}
                <div className="flex items-center justify-between mt-3">
                    {/* Segmented type control */}
                    <div className="flex items-center gap-1 p-1 bg-gray-100/80 rounded-xl">
                        <button
                            onClick={() => setType('shops')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${type === 'shops' ? 'bg-white text-indigo-700 shadow-sm border border-gray-200/60' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Store size={13} />
                            Shops
                        </button>
                        <button
                            onClick={() => setType('products')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${type === 'products' ? 'bg-white text-indigo-700 shadow-sm border border-gray-200/60' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <ShoppingBag size={13} />
                            Products
                        </button>
                    </div>

                    {/* View toggle — mobile only */}
                    <div className="md:hidden flex items-center gap-1 p-1 bg-gray-100/80 rounded-xl">
                        <button
                            onClick={() => setView('list')}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${view === 'list' ? 'bg-white text-indigo-700 shadow-sm border border-gray-200/60' : 'text-gray-500'}`}
                        >
                            <List size={13} /> List
                        </button>
                        <button
                            onClick={() => setView('map')}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${view === 'map' ? 'bg-white text-indigo-700 shadow-sm border border-gray-200/60' : 'text-gray-500'}`}
                        >
                            <Map size={13} /> Map
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Body ── */}
            <div className="flex flex-1 overflow-hidden">
                {/* Results Panel */}
                <aside className={`w-full md:w-80 shrink-0 border-r border-gray-100 flex flex-col overflow-hidden bg-white/80 ${view === 'map' ? 'hidden md:flex' : 'flex'}`}>
                    {/* Results count */}
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            {loading ? 'Searching...' : `${results.length} Results`}
                        </span>
                        {(initialQuery || categoryQuery) && (
                            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-xl truncate max-w-[140px]">
                                {categoryQuery || initialQuery}
                            </span>
                        )}
                    </div>

                    {/* Results list */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-3">
                        <AnimatePresence mode="wait">
                            {loading ? (
                                <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 animate-pulse space-y-3">
                                            <div className="flex items-start gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-gray-100 shrink-0" />
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-4 bg-gray-100 rounded-lg w-3/4" />
                                                    <div className="h-3 bg-gray-100 rounded-lg w-1/2" />
                                                </div>
                                            </div>
                                            <div className="h-8 bg-gray-100 rounded-xl w-full" />
                                        </div>
                                    ))}
                                </motion.div>
                            ) : results.length > 0 ? (
                                <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                                    {results.map((item, idx) => (
                                        <motion.div
                                            key={item._id}
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05, duration: 0.3 }}
                                        >
                                            {type === 'products'
                                                ? <ProductCard product={item} />
                                                : <ShopCard shop={item} />
                                            }
                                        </motion.div>
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-col items-center justify-center py-16 px-6 text-center"
                                >
                                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 flex items-center justify-center mb-4 shadow-sm">
                                        <SearchIcon size={28} className="text-indigo-300" />
                                    </div>
                                    <h3 className="text-base font-black text-gray-800 mb-1">No results found</h3>
                                    <p className="text-sm text-gray-400 font-medium">Try different keywords or browse categories</p>
                                    <Link to="/" className="mt-4 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-bold rounded-xl transition-colors">
                                        ← Back to Home
                                    </Link>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </aside>

                {/* Map Panel */}
                <main className={`flex-1 relative ${view === 'list' ? 'hidden md:block' : 'block'}`}>
                    <MapComponent shops={shopsForMap} />
                </main>
            </div>
        </motion.div>
    );
};

export default Search;
