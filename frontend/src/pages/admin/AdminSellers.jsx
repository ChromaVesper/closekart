import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Check, X, ShieldAlert } from 'lucide-react';

export default function AdminSellers() {
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSellers();
    }, []);

    const fetchSellers = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'users'), where('role', '==', 'seller'));
            const snap = await getDocs(q);
            const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSellers(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, newStatus) => {
        try {
            await updateDoc(doc(db, 'users', id), { status: newStatus });
            setSellers(sellers.map(s => s.id === id ? { ...s, status: newStatus } : s));
        } catch (error) {
            console.error("Error updating seller:", error);
            alert("Failed to update status.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Seller Management</h2>
                    <p className="text-slate-500 font-medium">Approve, reject, or suspend merchant accounts.</p>
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
                                    <th className="p-4 font-bold border-b border-gray-100">Seller Name</th>
                                    <th className="p-4 font-bold border-b border-gray-100">Contact</th>
                                    <th className="p-4 font-bold border-b border-gray-100">Status</th>
                                    <th className="p-4 font-bold border-b border-gray-100 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {sellers.length === 0 ? (
                                    <tr><td colSpan="4" className="p-8 text-center text-gray-500">No sellers found.</td></tr>
                                ) : (
                                    sellers.map(seller => (
                                        <tr key={seller.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-4">
                                                <p className="font-bold text-slate-800">{seller.name || 'Unnamed'}</p>
                                                <p className="text-xs text-slate-500">{seller.id}</p>
                                            </td>
                                            <td className="p-4">
                                                <p className="font-medium text-slate-700">{seller.email}</p>
                                                {seller.phone && <p className="text-xs text-slate-500">{seller.phone}</p>}
                                            </td>
                                            <td className="p-4">
                                                <StatusBadge status={seller.status || 'active'} />
                                            </td>
                                            <td className="p-4 flex gap-2 justify-end">
                                                {(seller.status === 'pending' || seller.status === 'suspended') && (
                                                    <button onClick={() => handleAction(seller.id, 'active')} className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg flex items-center gap-1 font-bold text-xs"><Check size={14} /> Approve</button>
                                                )}
                                                {(seller.status === 'pending' || seller.status === 'active') && (
                                                    <button onClick={() => handleAction(seller.id, 'suspended')} className="p-2 text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg flex items-center gap-1 font-bold text-xs"><ShieldAlert size={14} /> Suspend</button>
                                                )}
                                                {seller.status !== 'rejected' && (
                                                    <button onClick={() => handleAction(seller.id, 'rejected')} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg flex items-center gap-1 font-bold text-xs"><X size={14} /> Reject</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

const StatusBadge = ({ status }) => {
    let colors = 'bg-gray-100 text-gray-700';
    if (status === 'active') colors = 'bg-emerald-100 text-emerald-700';
    if (status === 'pending') colors = 'bg-amber-100 text-amber-700';
    if (status === 'suspended') colors = 'bg-red-100 text-red-700';
    if (status === 'rejected') colors = 'bg-slate-200 text-slate-800';

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${colors}`}>
            {status}
        </span>
    );
};
