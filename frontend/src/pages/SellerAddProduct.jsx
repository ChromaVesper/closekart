import React, { useState } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { PackageSearch, IndianRupee, Layers, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

import { useAuth } from '../context/AuthContext';

export default function SellerAddProduct() {
    const navigate = useNavigate();
    const { profile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    React.useEffect(() => {
        if (profile?.status === 'pending') {
            navigate('/seller-dashboard');
        }
    }, [profile, navigate]);

    const [formData, setFormData] = useState({
        name: '',
        category: '',
        description: '',
        price: '',
        stock: '',
        imageUrl: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const user = auth.currentUser;
            if (!user) throw new Error("You must be logged in as a seller.");

            const newProduct = {
                name: formData.name,
                category: formData.category,
                description: formData.description,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock, 10),
                imageUrl: formData.imageUrl || 'https://via.placeholder.com/400x300?text=No+Image',
                sellerId: user.uid,
                createdAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, 'products'), newProduct);

            setSuccess(true);
            setFormData({
                name: '',
                category: '',
                description: '',
                price: '',
                stock: '',
                imageUrl: ''
            });

            // Auto redirect back to dashboard after a short delay
            setTimeout(() => {
                navigate('/seller-dashboard');
            }, 2000);

        } catch (err) {
            console.error("Error adding product:", err);
            setError(err.message || "Failed to add product. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Header Sequence */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/seller-dashboard')}
                        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors mb-4"
                    >
                        <ArrowLeft size={16} className="mr-1" />
                        Back to Dashboard
                    </button>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Add New Product</h1>
                    <p className="mt-2 text-gray-500 font-medium">Create a new listing for your store inventory.</p>
                </div>

                {/* Status Messages */}
                {success && (
                    <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 flex items-start gap-3 animate-[fadeIn_0.3s]">
                        <CheckCircle2 className="shrink-0 mt-0.5" size={20} />
                        <div>
                            <h4 className="font-bold">Product Added Successfully!</h4>
                            <p className="text-sm text-emerald-600/80 font-medium mt-1">Your item is now live in your inventory. Redirecting...</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 flex items-start gap-3 animate-[fadeIn_0.3s]">
                        <AlertCircle className="shrink-0 mt-0.5" size={20} />
                        <div>
                            <h4 className="font-bold">Error</h4>
                            <p className="text-sm text-red-600/80 font-medium mt-1">{error}</p>
                        </div>
                    </div>
                )}

                {/* Form Card */}
                <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500 w-full" />

                    <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Product Name */}
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-2">
                                    <PackageSearch size={16} className="text-indigo-500" />
                                    Product Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-gray-900 bg-gray-50 hover:bg-white focus:bg-white outline-none"
                                    placeholder="e.g. Wireless Noise-Canceling Headphones"
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-2">
                                    <Layers size={16} className="text-purple-500" />
                                    Category
                                </label>
                                <select
                                    name="category"
                                    required
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-gray-900 bg-gray-50 hover:bg-white focus:bg-white outline-none appearance-none"
                                >
                                    <option value="" disabled>Select a category</option>
                                    <option value="Electronics">Electronics</option>
                                    <option value="Fashion">Fashion</option>
                                    <option value="Home">Home & Kitchen</option>
                                    <option value="Beauty">Beauty & Personal Care</option>
                                    <option value="Groceries">Groceries</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            {/* Price */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-2">
                                    <IndianRupee size={16} className="text-emerald-500" />
                                    Price (₹)
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-gray-900 bg-gray-50 hover:bg-white focus:bg-white outline-none"
                                    placeholder="0.00"
                                />
                            </div>

                            {/* Stock Quantity */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                                    Stock Quantity
                                </label>
                                <input
                                    type="number"
                                    name="stock"
                                    required
                                    min="0"
                                    step="1"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-gray-900 bg-gray-50 hover:bg-white focus:bg-white outline-none"
                                    placeholder="Available units"
                                />
                            </div>

                            {/* Image URL */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                                    Product Image URL
                                </label>
                                <input
                                    type="url"
                                    name="imageUrl"
                                    value={formData.imageUrl}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-gray-900 bg-gray-50 hover:bg-white focus:bg-white outline-none"
                                    placeholder="https://example.com/image.jpg"
                                />
                                <p className="text-xs text-gray-400 mt-1 font-medium">Leave blank to use a placeholder image.</p>
                            </div>

                            {/* Description */}
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                                    Product Description
                                </label>
                                <textarea
                                    name="description"
                                    required
                                    rows={4}
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-gray-900 bg-gray-50 hover:bg-white focus:bg-white outline-none resize-y"
                                    placeholder="Tell buyers what makes this product amazing..."
                                />
                            </div>
                        </div>

                        {/* Submit Actions */}
                        <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => navigate('/seller-dashboard')}
                                className="px-6 py-3 rounded-xl font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center gap-2"
                            >
                                {loading && (
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                                {loading ? 'Saving...' : 'Add Product'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
