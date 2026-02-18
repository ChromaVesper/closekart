import React, { useState } from 'react';
import { Package, Plus, Trash, Edit, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ShopDashboard = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([
        { id: 1, name: 'Amul Milk 1L', price: 54, stock: 50, category: 'Dairy' },
        { id: 2, name: 'Basmati Rice 1kg', price: 120, stock: 20, category: 'Grocery' },
    ]);

    const handleDelete = (id) => {
        setProducts(products.filter(p => p.id !== id));
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-blue-600">ShopAdmin</h2>
                </div>
                <nav className="mt-6 px-4 space-y-2">
                    <a href="#" className="flex items-center px-4 py-3 bg-blue-50 text-blue-700 rounded-lg">
                        <Package size={20} className="mr-3" /> Products
                    </a>
                    <a href="#" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
                        <Settings size={20} className="mr-3" /> Shop Settings
                    </a>
                    <button onClick={() => navigate('/')} className="w-full flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg text-left">
                        <LogOut size={20} className="mr-3" /> Logout
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">Product Management</h1>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700">
                        <Plus size={20} className="mr-2" /> Add Product
                    </button>
                </header>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                                <th className="p-4 border-b">Product Name</th>
                                <th className="p-4 border-b">Category</th>
                                <th className="p-4 border-b">Price</th>
                                <th className="p-4 border-b">Stock</th>
                                <th className="p-4 border-b text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product.id} className="hover:bg-gray-50 border-b last:border-0 text-sm">
                                    <td className="p-4 font-medium text-gray-900">{product.name}</td>
                                    <td className="p-4 text-gray-500">{product.category}</td>
                                    <td className="p-4 font-medium">₹{product.price}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs ${product.stock > 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {product.stock} in stock
                                        </span>
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        <button className="text-blue-600 hover:text-blue-800"><Edit size={18} /></button>
                                        <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:text-red-700"><Trash size={18} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};

export default ShopDashboard;
