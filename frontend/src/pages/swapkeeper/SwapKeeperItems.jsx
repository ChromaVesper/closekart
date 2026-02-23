import React, { useEffect, useState } from 'react';
import { getItems, createItem, updateItem, deleteItem } from '../../api/swapKeeperApi';
import { Plus, Pencil, Trash2, X, Image, Package } from 'lucide-react';

const CATEGORIES = ['General', 'Electronics', 'Grocery', 'Dairy', 'Fashion', 'Stationery', 'Mobile Repair', 'Books', 'Furniture', 'Other'];

const initialForm = { title: '', description: '', category: 'General', price: '', stock: '', swapAllowed: false, status: 'active' };

const StatusBadge = ({ status }) => (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold
        ${status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
        {status}
    </span>
);

const SwapKeeperItems = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState(initialForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const loadItems = () => {
        setLoading(true);
        getItems()
            .then(setItems)
            .catch(() => setError('Failed to load items'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadItems(); }, []);

    const openAdd = () => {
        setEditId(null);
        setForm(initialForm);
        setError('');
        setShowModal(true);
    };

    const openEdit = (item) => {
        setEditId(item._id);
        setForm({
            title: item.title,
            description: item.description || '',
            category: item.category || 'General',
            price: item.price,
            stock: item.stock,
            swapAllowed: item.swapAllowed || false,
            status: item.status || 'active',
        });
        setError('');
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || form.price === '') return setError('Title and price are required');
        setSaving(true);
        setError('');
        try {
            const data = { ...form, price: Number(form.price), stock: Number(form.stock) };
            if (editId) {
                await updateItem(editId, data);
            } else {
                await createItem(data);
            }
            setShowModal(false);
            loadItems();
        } catch {
            setError('Failed to save item');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this item?')) return;
        try {
            await deleteItem(id);
            setItems(prev => prev.filter(i => i._id !== id));
        } catch {
            alert('Failed to delete item');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Items</h1>
                    <p className="text-gray-500 text-sm mt-1">{items.length} items in your store</p>
                </div>
                <button
                    onClick={openAdd}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
                >
                    <Plus size={18} /> Add New Item
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 space-y-4">
                        {[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}
                    </div>
                ) : items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
                        <Package size={48} className="text-gray-200" />
                        <p className="font-medium">No items yet</p>
                        <p className="text-sm">Click "Add New Item" to get started</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Item</th>
                                    <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Category</th>
                                    <th className="text-right px-4 py-3.5 font-semibold text-gray-600">Price</th>
                                    <th className="text-right px-4 py-3.5 font-semibold text-gray-600">Stock</th>
                                    <th className="text-center px-4 py-3.5 font-semibold text-gray-600">Status</th>
                                    <th className="text-center px-4 py-3.5 font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {items.map(item => (
                                    <tr key={item._id} className="hover:bg-gray-50/60 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                    {item.images?.[0]
                                                        ? <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                                                        : <Image size={18} className="text-indigo-300" />
                                                    }
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800">{item.title}</p>
                                                    {item.swapAllowed && (
                                                        <span className="text-xs text-indigo-500 font-medium">Swap allowed</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-gray-600">{item.category}</td>
                                        <td className="px-4 py-4 text-right font-semibold text-gray-800">₹{item.price.toLocaleString()}</td>
                                        <td className="px-4 py-4 text-right text-gray-600">{item.stock}</td>
                                        <td className="px-4 py-4 text-center">
                                            <StatusBadge status={item.status} />
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => openEdit(item)}
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item._id)}
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add / Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900">{editId ? 'Edit Item' : 'Add New Item'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                            {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                    placeholder="Item name"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    placeholder="Describe your item..."
                                    rows={3}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        value={form.category}
                                        onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                    >
                                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        value={form.status}
                                        onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.price}
                                        onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                                        placeholder="0"
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.stock}
                                        onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                                        placeholder="0"
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                    />
                                </div>
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.swapAllowed}
                                    onChange={e => setForm(f => ({ ...f, swapAllowed: e.target.checked }))}
                                    className="w-4 h-4 rounded border-gray-300 text-indigo-600"
                                />
                                <span className="text-sm text-gray-700 font-medium">Allow swap offers</span>
                            </label>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
                                >
                                    {saving ? 'Saving...' : (editId ? 'Update Item' : 'Add Item')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SwapKeeperItems;
