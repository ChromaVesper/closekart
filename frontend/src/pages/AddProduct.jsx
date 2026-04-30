import React, { useState } from 'react';
import { Package, Tag, IndianRupee, FileText, Layers, Image as ImageIcon, CheckCircle, Plus } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

const AddProduct = () => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [productData, setProductData] = useState({
        name: '',
        price: '',
        category: 'Grocery',
        description: '',
        image: '' // Changed from images to image to match Model
    });

    const { user } = useAuth();

    const handleChange = (e) => {
        setProductData({ ...productData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const priceNum = parseFloat(productData.price);
        if (!productData.name.trim() || isNaN(priceNum) || priceNum <= 0) {
            alert("Validation Error: Please provide a valid product name and a price strictly greater than ₹0.");
            return;
        }

        setLoading(true);
        try {
            await addDoc(collection(db, 'products'), {
                ...productData,
                price: priceNum,
                inStock: true,
                shopId: user.uid,
                createdAt: serverTimestamp()
            });
            
            setSuccess(true);
            setProductData({
                name: '',
                price: '',
                category: 'Grocery',
                description: '',
                image: ''
            });
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error("Error adding product:", error);
            alert(`Failed adding product. Please try again. [${error.message}]`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                        <Plus size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900">Add New Product</h2>
                        <p className="text-gray-500 font-medium">List a new item in your store inventory.</p>
                    </div>
                </div>

                {success && (
                    <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center gap-3 font-bold border border-emerald-100 animate-in fade-in slide-in-from-top-4">
                        <CheckCircle size={20} />
                        Product added successfully!
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Product Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <Package size={14} className="text-gray-400" /> Product Name
                            </label>
                            <input 
                                type="text" 
                                name="name"
                                value={productData.name}
                                onChange={handleChange}
                                placeholder="E.g. Apple iPhone 15"
                                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition font-medium"
                                required
                            />
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <Tag size={14} className="text-gray-400" /> Category
                            </label>
                            <select 
                                name="category"
                                value={productData.category}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition font-medium"
                                required
                            >
                                <option>Grocery</option>
                                <option>Electronics</option>
                                <option>Fashion</option>
                                <option>Home Decor</option>
                                <option>Toys</option>
                                <option>Restaurant</option>
                                <option>Others</option>
                            </select>
                        </div>

                        {/* Price */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <IndianRupee size={14} className="text-gray-400" /> Price
                            </label>
                            <input 
                                type="number" 
                                name="price"
                                value={productData.price}
                                onChange={handleChange}
                                placeholder="0.00"
                                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition font-medium"
                                required
                            />
                        </div>

                        {/* Image links */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <ImageIcon size={14} className="text-gray-400" /> Product Image URL
                            </label>
                            <input 
                                type="text" 
                                name="image"
                                value={productData.image}
                                onChange={handleChange}
                                placeholder="https://example.com/product.jpg"
                                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition font-medium"
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <FileText size={14} className="text-gray-400" /> Description
                            </label>
                            <textarea 
                                name="description"
                                value={productData.description}
                                onChange={handleChange}
                                placeholder="Describe your product briefly..."
                                rows="4"
                                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition font-medium resize-none"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full py-4 px-6 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition shadow-lg shadow-slate-200 disabled:opacity-50 active:scale-[0.98]"
                        >
                            {loading ? 'Adding Product...' : 'Add Product to Inventory'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProduct;
