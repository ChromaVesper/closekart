import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Trash2, ShieldAlert, Check } from 'lucide-react';

export default function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'products'));
            const snap = await getDocs(q);
            const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProducts(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to permanently delete this product?")) return;
        try {
            await deleteDoc(doc(db, 'products', id));
            setProducts(products.filter(p => p.id !== id));
        } catch (error) {
            console.error(error);
            alert("Failed to delete product.");
        }
    };

    const toggleAvailability = async (id, currentStatus) => {
        try {
            const newAvailability = !currentStatus;
            await updateDoc(doc(db, 'products', id), { availability: newAvailability });
            setProducts(products.map(p => p.id === id ? { ...p, availability: newAvailability } : p));
        } catch (error) {
            console.error(error);
            alert("Failed to update status");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Product Moderation</h2>
                    <p className="text-slate-500 font-medium">Review and enforce platform product quality.</p>
                </div>
            </div>

            <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex justify-center p-10"><div className="animate-spin h-8 w-8 border-t-2 border-indigo-600 rounded-full"></div></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                                    <th className="p-4 font-bold border-b border-gray-100">Product</th>
                                    <th className="p-4 font-bold border-b border-gray-100">Pricing / Stock</th>
                                    <th className="p-4 font-bold border-b border-gray-100">Status</th>
                                    <th className="p-4 font-bold border-b border-gray-100 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {products.length === 0 ? (
                                    <tr><td colSpan="4" className="p-8 text-center text-gray-500">No products found.</td></tr>
                                ) : (
                                    products.map(product => {
                                        const isAvailable = product.availability !== false;
                                        return (
                                            <tr key={product.id} className={`hover:bg-slate-50/50 transition-colors ${!isAvailable ? 'opacity-60 grayscale' : ''}`}>
                                                <td className="p-4 flex gap-3 items-center">
                                                    <div className="h-10 w-10 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                                                        {product.image || product.imageUrl ? (
                                                            <img src={product.image || product.imageUrl} alt="prod" className="h-full w-full object-cover" />
                                                        ) : (
                                                            <div className="h-full w-full bg-slate-200"></div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 line-clamp-1">{product.name}</p>
                                                        <p className="text-xs text-slate-500">{product.category}</p>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <p className="font-bold text-emerald-600">₹{product.price}</p>
                                                    <p className="text-xs text-slate-500 font-medium">{product.stock} units</p>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                        {isAvailable ? 'Active' : 'Disabled'}
                                                    </span>
                                                </td>
                                                <td className="p-4 flex gap-2 justify-end items-center">
                                                    <button onClick={() => toggleAvailability(product.id, isAvailable)} className={`p-2 rounded-lg flex items-center gap-1 font-bold text-xs ${isAvailable ? 'text-amber-600 bg-amber-50 hover:bg-amber-100' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'}`}>
                                                        {isAvailable ? <ShieldAlert size={14} /> : <Check size={14} />}
                                                        {isAvailable ? 'Disable' : 'Enable'}
                                                    </button>
                                                    <button onClick={() => handleDelete(product.id)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg flex items-center gap-1 font-bold text-xs"><Trash2 size={14} /> Delete</button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
