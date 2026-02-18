import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import ShopCard from '../components/ShopCard';
import { Filter, Search as SearchIcon } from 'lucide-react';

const Search = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialQuery = queryParams.get('q') || '';
    const categoryQuery = queryParams.get('category') || '';

    const [query, setQuery] = useState(initialQuery);
    const [results, setResults] = useState([]);
    const [type, setType] = useState('products');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        handleSearch();
    }, [initialQuery, categoryQuery, query]);

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            // In a real scenario, this would fetch from backend
            // const endpoint = type === 'products' ? '/api/products' : '/api/shops';
            // const res = await axios.get(endpoint, { params: { search: query, category: categoryQuery } });
            // setResults(res.data);

            // Mock Data for frontend demo until backend is connected
            setTimeout(() => {
                if (type === 'products') {
                    setResults([
                        { _id: '1', name: 'Amul Milk', price: 54, shop: { shopName: 'Gupta Store', rating: 4.8, distanceKm: 0.5 }, availability: true, stockQuantity: 20, category: 'Dairy' },
                        { _id: '2', name: 'Bread', price: 40, shop: { shopName: 'Sharma Dairy', rating: 4.6, distanceKm: 0.8 }, availability: true, stockQuantity: 15, category: 'Grocery' },
                    ]);
                } else {
                    setResults([
                        { _id: 's1', shopName: 'Gupta General Store', category: 'Grocery', rating: 4.8, distanceKm: 0.5, address: 'Anisabad', deliveryAvailable: true, deliveryCharge: 20 },
                    ]);
                }
                setLoading(false);
            }, 500);

        } catch (error) {
            console.error(error);
            setResults([]);
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 p-4">
            <aside className="w-full md:w-64 shrink-0">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="font-bold mb-4 flex items-center"><Filter size={18} className="mr-2" /> Filters</h3>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Type</label>
                        <select value={type} onChange={(e) => setType(e.target.value)} className="w-full border p-2 rounded">
                            <option value="products">Products</option>
                            <option value="shops">Shops</option>
                        </select>
                    </div>
                    <button onClick={handleSearch} className="w-full bg-blue-600 text-white py-2 rounded">Apply</button>
                </div>
            </aside>
            <main className="flex-1">
                <h2 className="text-xl font-bold mb-4">Results for "{query || categoryQuery || 'All'}"</h2>
                {loading ? <p>Loading...</p> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {results.map(item => (
                            type === 'products' ? <ProductCard key={item._id} product={item} /> : <ShopCard key={item._id} shop={item} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Search;
