import React, { useState, useEffect } from 'react';
import { useUserLocation } from '../context/LocationContext';
import { Sparkles, MapPin, Store, ArrowRight, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import SearchBar from '../components/SearchBar';
import CategoryScroll from '../components/CategoryScroll';
import HeroCarousel from '../components/HeroCarousel';
import ShopMap from '../components/ShopMap';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const { coords } = useUserLocation();
    const [shops, setShops] = useState([]);
    const [shopsLoading, setShopsLoading] = useState(false);
    const navigate = useNavigate();

    const getDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    useEffect(() => {
        if (!coords?.latitude || !coords?.longitude) return;
        setShopsLoading(true);
        const fetchNearby = async () => {
            try {
                const q = query(collection(db, 'shops'), where('isOpen', '==', true), limit(20));
                const snap = await getDocs(q);
                const all = snap.docs.map(d => ({ _id: d.id, id: d.id, ...d.data() }));
                const filtered = all
                    .map(s => ({ ...s, distanceKm: getDistance(coords.latitude, coords.longitude, s.lat, s.lng).toFixed(1) }))
                    .filter(s => s.distanceKm <= 5)
                    .sort((a, b) => a.distanceKm - b.distanceKm);
                setShops(filtered);
            } catch (e) {
                console.error(e);
                setShops([]);
            } finally {
                setShopsLoading(false);
            }
        };
        fetchNearby();
    }, [coords?.latitude, coords?.longitude]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="relative min-h-screen overflow-x-hidden pb-24 md:pb-12 bg-mesh"
        >
            {/* Ambient orbs */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
                <div className="absolute top-[-10%] right-[-8%] w-96 h-96 bg-indigo-400/8 rounded-full blur-3xl animate-float" />
                <div className="absolute top-[35%] left-[-12%] w-80 h-80 bg-purple-400/6 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '3s' }} />
                <div className="absolute bottom-[20%] right-[10%] w-64 h-64 bg-pink-400/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '6s' }} />
            </div>

            {/* ── MOBILE LAYOUT ── */}
            <div className="md:hidden">
                <div className="pt-3">
                    <SearchBar />
                </div>
                <div className="mt-4 px-4">
                    <HeroCarousel />
                </div>
                <div className="mt-6 px-4">
                    <SectionHeader icon={<TrendingUp size={16} className="text-indigo-500" />} title="Shop by Category" />
                </div>
                <CategoryScroll />
            </div>

            {/* ── DESKTOP LAYOUT ── */}
            <div className="hidden md:block mb-10 pt-6">
                <div className="max-w-5xl mx-auto px-6 lg:px-8">
                    <HeroCarousel />
                    <div className="mt-12">
                        <SectionHeader icon={<TrendingUp size={18} className="text-indigo-500" />} title="Explore Categories" />
                        <div className="mt-4 p-3 rounded-3xl bg-white/70 backdrop-blur-sm border border-white/80 shadow-sm">
                            <CategoryScroll />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── MAP SECTION ── */}
            {coords && (
                <div className="mt-6 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
                    <SectionHeader
                        icon={<MapPin size={16} className="text-indigo-500" />}
                        title="Stores Around You"
                        subtitle="Live map of open shops within 5km"
                    />
                    <div className="mt-4 rounded-3xl overflow-hidden shadow-lg border border-white/80">
                        <ShopMap shops={shops} userLocation={coords} radius={5000} />
                    </div>
                </div>
            )}

            {/* ── NEARBY SHOPS ── */}
            <div className="mt-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
                <div className="flex items-end justify-between mb-6">
                    <SectionHeader
                        icon={<Sparkles size={16} className="text-amber-500" />}
                        title="Recommended For You"
                        subtitle={coords ? 'Fresh finds near your location' : 'Enable location for best results'}
                        noMargin
                    />
                    {shops.length > 0 && (
                        <button
                            onClick={() => navigate('/shops')}
                            className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors shrink-0"
                        >
                            See all <ArrowRight size={12} />
                        </button>
                    )}
                </div>

                <div className="flex overflow-x-auto no-scrollbar gap-4 pb-4 snap-x">
                    {shopsLoading
                        ? [1, 2, 3, 4].map(i => <ShopSkeleton key={i} />)
                        : shops.length > 0
                            ? shops.map((shop, idx) => (
                                <ShopCard key={shop._id} shop={shop} index={idx} onClick={() => navigate(`/shop/${shop._id}`)} />
                            ))
                            : <EmptyState />
                    }
                </div>
            </div>
        </motion.div>
    );
};

/* ── Sub-components ── */

const SectionHeader = ({ icon, title, subtitle, noMargin }) => (
    <div className={noMargin ? '' : 'mb-4'}>
        <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100/60 flex items-center justify-center">
                {icon}
            </div>
            <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">{title}</h2>
        </div>
        {subtitle && <p className="text-xs text-gray-500 font-medium mt-1 ml-9">{subtitle}</p>}
    </div>
);

const ShopCard = ({ shop, index, onClick }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.5, type: 'spring', bounce: 0.35, delay: index * 0.08 }}
        whileHover={{ y: -6, scale: 1.02 }}
        onClick={onClick}
        className="min-w-[240px] md:min-w-[270px] cursor-pointer rounded-3xl overflow-hidden flex flex-col snap-start group relative bg-white border border-gray-100/80 shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 transition-shadow duration-400"
    >
        {/* Image */}
        <div className="h-40 bg-gray-100 relative overflow-hidden shrink-0">
            {shop.shopImage ? (
                <img
                    src={shop.shopImage}
                    alt={shop.shopName}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
                    <Store size={36} className="text-indigo-300" />
                </div>
            )}
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Status badge */}
            <div className="absolute top-3 right-3">
                <span className={`text-[10px] font-black px-2 py-1 rounded-full ${shop.isOpen ? 'bg-emerald-400/90 text-white' : 'bg-red-500/90 text-white'} backdrop-blur-sm`}>
                    {shop.isOpen ? '● Open' : '✕ Closed'}
                </span>
            </div>
        </div>

        {/* Info */}
        <div className="p-4 flex flex-col flex-1">
            <h3 className="font-extrabold text-gray-900 text-base tracking-tight truncate">{shop.shopName}</h3>
            <span className="text-xs font-semibold text-gray-400 mt-0.5 truncate">{shop.category}</span>

            <div className="mt-auto pt-3 flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-xl">
                    ⭐ {shop.rating || 'New'}
                </div>
                <div className="text-xs font-black text-indigo-600 bg-indigo-50/80 px-2.5 py-1 rounded-xl border border-indigo-100/60">
                    {shop.distanceKm} km
                </div>
            </div>
        </div>
    </motion.div>
);

const ShopSkeleton = () => (
    <div className="min-w-[240px] md:min-w-[270px] rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-sm snap-start animate-pulse">
        <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-50" />
        <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-100 rounded-xl w-3/4" />
            <div className="h-3 bg-gray-100 rounded-xl w-1/2" />
            <div className="flex justify-between mt-4">
                <div className="h-6 w-14 bg-gray-100 rounded-xl" />
                <div className="h-6 w-14 bg-gray-100 rounded-xl" />
            </div>
        </div>
    </div>
);

const EmptyState = () => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full mx-auto max-w-md py-16 px-8 text-center rounded-3xl bg-white/80 border border-white/80 shadow-sm"
    >
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 flex items-center justify-center mx-auto mb-5 shadow-sm">
            <Store size={36} className="text-indigo-300" />
        </div>
        <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">No shops nearby</h3>
        <p className="text-sm text-gray-500 font-medium leading-relaxed">
            Enable location services or try searching a different area.
        </p>
    </motion.div>
);

export default Home;
