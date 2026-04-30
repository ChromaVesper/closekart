import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Package, Trash2, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const ManageProducts = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        try {
            const res = await api.get('/products/seller');
            setProducts(res.data);
        } catch (err) {
            console.error("Error fetching generic seller products:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) return;
        fetchProducts();
    }, [user]);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await api.delete(`/products/${id}`);
                setProducts(products.filter(p => p._id !== id));
            } catch (error) {
                console.error("Error deleting product:", error);
                alert("Could not delete product");
            }
        }
    };

    if (loading) {
        return (
            <div className="h-64 flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-gray-900">Manage Products</h2>
                    <p className="text-gray-500 font-medium">You have {products.length} products in your inventory.</p>
                </div>
                <Link 
                    to="/seller/add-product" 
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                >
                    <Package size={18} /> Add New Product
                </Link>
            </div>

            {products.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-200 text-center space-y-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-400">
                        <Package size={32} />
                    </div>
                    <p className="text-gray-500 font-medium italic">No products found. Start by adding your first product!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <div key={product._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition">
                            <div className="h-48 bg-gray-100 relative overflow-hidden">
                                <img 
                                    src={product.image || 'https://via.placeholder.com/400x300?text=No+Image'} 
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                />
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <button 
                                        onClick={() => handleDelete(product._id)}
                                        className="p-2 bg-white/90 backdrop-blur text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition shadow-sm"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-5 space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-lg uppercase tracking-wider">{product.category}</span>
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase ${product.availability ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                        {product.availability ? `In Stock` : 'Out of Stock'}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition truncate">{product.name}</h3>
                                <p className="text-sm text-gray-500 font-medium line-clamp-2">{product.description}</p>
                                <div className="pt-2 flex items-center justify-between border-t border-gray-50">
                                    <span className="text-xl font-black text-gray-900">₹{product.price}</span>
                                    <button className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition">Edit Details</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManageProducts;
