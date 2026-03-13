import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Trash2, AlertTriangle, CheckCircle } from 'lucide-react';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'users'));
            const snap = await getDocs(q);
            const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user permanently? This cannot be undone.")) return;
        try {
            await deleteDoc(doc(db, 'users', id));
            setUsers(users.filter(u => u.id !== id));
        } catch (error) {
            console.error(error);
            alert("Failed to delete user.");
        }
    };

    const toggleBan = async (id, isBanned) => {
        try {
            await updateDoc(doc(db, 'users', id), { isBanned: !isBanned });
            setUsers(users.map(u => u.id === id ? { ...u, isBanned: !isBanned } : u));
        } catch (error) {
            console.error(error);
            alert("Failed to update user ban status.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">User Operations</h2>
                    <p className="text-slate-500 font-medium">Control platform access and investigate accounts.</p>
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
                                    <th className="p-4 font-bold border-b border-gray-100">User Identification</th>
                                    <th className="p-4 font-bold border-b border-gray-100">Role & Status</th>
                                    <th className="p-4 font-bold border-b border-gray-100 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {users.length === 0 ? (
                                    <tr><td colSpan="3" className="p-8 text-center text-gray-500">No records found.</td></tr>
                                ) : (
                                    users.map(user => (
                                        <tr key={user.id} className={`hover:bg-slate-50/50 transition-colors ${user.isBanned ? 'bg-red-50/30' : ''}`}>
                                            <td className="p-4">
                                                <p className="font-bold text-slate-800 flex items-center gap-2">
                                                    {user.name || 'Anonymous User'}
                                                    {user.isBanned && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-md uppercase font-black">Banned</span>}
                                                </p>
                                                <p className="text-xs text-slate-500">{user.email || user.phone || 'No Contact Info'}</p>
                                                <p className="text-[10px] text-slate-400 mt-1 font-mono">UID: {user.id}</p>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                        user.role === 'seller' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {user.role || 'Unassigned'}
                                                </span>
                                            </td>
                                            <td className="p-4 flex gap-2 justify-end items-center h-full pt-6">
                                                {user.role !== 'admin' && (
                                                    <>
                                                        <button onClick={() => toggleBan(user.id, user.isBanned)} className={`p-2 rounded-lg flex items-center gap-1 font-bold text-xs ${user.isBanned ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' : 'text-amber-600 bg-amber-50 hover:bg-amber-100'}`}>
                                                            {user.isBanned ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                                                            {user.isBanned ? 'Unban' : 'Ban'}
                                                        </button>
                                                        <button onClick={() => handleDelete(user.id)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg flex items-center gap-1 font-bold text-xs"><Trash2 size={14} /> Delete</button>
                                                    </>
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
