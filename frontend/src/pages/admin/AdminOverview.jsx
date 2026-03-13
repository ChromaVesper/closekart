import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import { Users, Store, Package, ShoppingCart, TrendingUp } from 'lucide-react';

export default function AdminOverview() {
    const [stats, setStats] = useState({
        users: 0, sellers: 0, products: 0, orders: 0, revenue: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            // Count total users
            const usersSnap = await getDocs(collection(db, 'users'));
            const totalUsers = usersSnap.docs.length;
            const sellersCount = usersSnap.docs.filter(d => d.data().role === 'seller').length;

            // Count total products
            const productsSnap = await getDocs(collection(db, 'products'));
            const totalProducts = productsSnap.docs.length;

            // Placeholder for orders/revenue until order collection exists
            const totalOrders = 120;
            const totalRevenue = 45000;

            setStats({
                users: totalUsers,
                sellers: sellersCount,
                products: totalProducts,
                orders: totalOrders,
                revenue: totalRevenue
            });
        } catch (error) {
            console.error("Error fetching admin stats:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">System Overview</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                <StatCard icon={Users} title="Total Users" value={stats.users} color="text-blue-600" bg="bg-blue-50" />
                <StatCard icon={Store} title="Total Sellers" value={stats.sellers} color="text-indigo-600" bg="bg-indigo-50" />
                <StatCard icon={Package} title="Total Products" value={stats.products} color="text-purple-600" bg="bg-purple-50" />
                <StatCard icon={ShoppingCart} title="Total Orders" value={stats.orders} color="text-amber-600" bg="bg-amber-50" />
                <StatCard icon={TrendingUp} title="Total Revenue" value={`₹${stats.revenue.toLocaleString()}`} color="text-emerald-600" bg="bg-emerald-50" />
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 overflow-hidden mt-8 min-h-[400px] flex items-center justify-center">
                <p className="text-gray-400 font-bold tracking-wider uppercase text-sm">Dashboard Analytics coming soon...</p>
            </div>
        </div>
    );
}

const StatCard = ({ icon: Icon, title, value, color, bg }) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
        <div className={`p-3.5 rounded-xl ${bg} ${color}`}>
            <Icon size={24} strokeWidth={2.5} />
        </div>
        <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{title}</p>
            <h4 className="text-2xl font-black text-slate-800 tracking-tight leading-none">{value}</h4>
        </div>
    </div>
);
