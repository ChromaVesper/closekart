import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import ShopCard from '../components/ShopCard';
import { Filter, Search as SearchIcon } from 'lucide-react';
import MapComponent from '../components/MapComponent';
import { useLocation as useLocationContext } from '../contexts/LocationContext';
const Search = () => {
    const locationState = useLocation(); // Router location state
    const { location, loadingLocation } = useLocationContext(); // Context location
    const queryParams = new URLSearchParams(locationState.search);
    const initialQuery = queryParams.get('q') || '';
    const categoryQuery = queryParams.get('category') || '';

    const [query, setQuery] = useState(initialQuery);
    const [results, setResults] = useState([]);
    const [shopsForMap, setShopsForMap] = useState([]);
    const [type, setType] = useState('shops'); // Default to shops for map visibility
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState('list'); // 'list' or 'map'

    useEffect(() => {
        handleSearch();
    }, [initialQuery, categoryQuery]);

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            let endpoint = '';
            let params = {
                search: query,
                category: categoryQuery,
            };

            // Add location if available
            if (location) {
                params.lat = location.lat;
                params.lng = location.lng;
            }

            if (type === 'products') {
                endpoint = '/products';
            } else {
                endpoint = '/shops';
            }

            const res = await api.get(endpoint, { params });
            setResults(res.data);

            // If searching products, we still want to show shops on map if possible (fetched via include)
            // For now, if type is shops, these are the shops.
            if (type === 'shops') {
                setShopsForMap(res.data);
            } else {
                // If products, extract unique shops from products
                const uniqueShops = [...new Map(res.data.map(item => [item.shop._id, item.shop])).values()];
                setShopsForMap(uniqueShops);
            }

        } catch (error) {
            console.error("Search error:", error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-80px)]">
            {/* Mobile View Toggle */}
            <div className="md:hidden flex justify-center border-b bg-white p-2">
                <button
                    onClick={() => setView('list')}
                    className={`px-4 py-2 rounded-l-lg border ${view === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                >List</button>
                <button
                    onClick={() => setView('map')}
                    className={`px-4 py-2 rounded-r-lg border ${view === 'map' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                >Map</button>
            </div>

            <div className="flex flex-col md:flex-row flex-1 overflow-hidden relative">
                <aside className="w-full md:w-80 shrink-0 border-r bg-white flex flex-col z-10">
                    <div className="p-4 border-b">
                        <div className="flex gap-2 mb-4">
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search..."
                                className="border rounded px-3 py-2 flex-1"
                            />
                            <button onClick={handleSearch} className="bg-blue-600 text-white p-2 rounded"><SearchIcon size={20} /></button>
                        </div>

                        <div className="flex gap-4 mb-2">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="type"
                                    value="products"
                                    checked={type === 'products'}
                                    onChange={() => setType('products')}
                                    className="mr-2"
                                />
                                Products
                            </label>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="type"
                                    value="shops"
                                    checked={type === 'shops'}
                                    onChange={() => setType('shops')}
                                    className="mr-2"
                                />
                                Shops
                            </label>
                        </div>
                    </div>

                    <div className={`flex-1 overflow-y-auto p-4 bg-gray-50 ${view === 'map' ? 'hidden md:block' : ''}`}>
                        <h2 className="text-sm font-bold text-gray-500 mb-4 px-1">{results.length} Results</h2>
                        {loading ? (
                            <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
                        ) : (
                            <div className="space-y-4">
                                {results.map(item => (
                                    type === 'products' ? <ProductCard key={item._id} product={item} /> : <ShopCard key={item._id} shop={item} />
                                ))}
                                {results.length === 0 && <p className="text-center text-gray-500 mt-8">No results found.</p>}
                            </div>
                        )}
                    </div>
                </aside>

                <main className={`flex-1 relative ${view === 'list' ? 'hidden md:block' : 'block h-full'}`}>
                    <MapComponent shops={shopsForMap} />
                </main>
            </div>
        </div>
    );
};

export default Search;
