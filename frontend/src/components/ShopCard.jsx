import React from 'react';
import { MapPin, Star, Truck, Navigation, ArrowRight, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ShopCard = ({ shop }) => {
    if (!shop) return null;

    const distKm = shop.distanceKm != null
        ? shop.distanceKm
        : shop.distanceMeters != null
            ? Math.round(shop.distanceMeters / 100) / 10
            : null;

    const isOpen = shop.isOpen !== false;

    return (
        <Link to={`/shop/${shop._id}`} className="block group">
            <motion.div
                whileHover={{ y: -3, scale: 1.01 }}
                transition={{ type: 'spring', bounce: 0.4, duration: 0.3 }}
                className="bg-white rounded-2xl border border-gray-100/80 shadow-sm hover:shadow-lg hover:shadow-indigo-100/40 transition-shadow duration-300 overflow-hidden"
            >
                {/* Shop image strip */}
                {shop.shopImage && (
                    <div className="h-28 overflow-hidden relative">
                        <img
                            src={shop.shopImage}
                            alt={shop.shopName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        {/* Status pill on image */}
                        <div className="absolute top-2.5 right-2.5">
                            <span className={`text-[10px] font-black px-2 py-1 rounded-full backdrop-blur-sm ${isOpen ? 'bg-emerald-400/90 text-white' : 'bg-red-500/90 text-white'}`}>
                                {isOpen ? '● Open' : '✕ Closed'}
                            </span>
                        </div>
                    </div>
                )}

                <div className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                                {!shop.shopImage && (
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isOpen ? 'bg-emerald-50' : 'bg-gray-100'}`}>
                                        <Store size={15} className={isOpen ? 'text-emerald-500' : 'text-gray-400'} />
                                    </div>
                                )}
                                <h3 className="font-black text-sm text-gray-900 group-hover:text-indigo-700 transition-colors truncate leading-tight">
                                    {shop.shopName}
                                </h3>
                            </div>
                            <span className="inline-block text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full mt-0.5">
                                {shop.category}
                            </span>
                        </div>

                        {shop.rating != null && (
                            <div className="shrink-0 flex items-center gap-1 bg-amber-50 border border-amber-100 px-2 py-1 rounded-xl">
                                <Star size={11} className="fill-amber-400 text-amber-400" />
                                <span className="text-xs font-black text-amber-700">{shop.rating}</span>
                            </div>
                        )}
                    </div>

                    {/* Address */}
                    {shop.address && (
                        <div className="flex items-start gap-1.5 text-xs text-gray-400 font-medium mb-2">
                            <MapPin size={12} className="mt-0.5 shrink-0 text-gray-300" />
                            <span className="line-clamp-1">{shop.address}</span>
                        </div>
                    )}

                    {/* Distance + Delivery row */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {distKm != null && (
                            <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 bg-indigo-50/80 px-2 py-1 rounded-lg border border-indigo-100/60">
                                <Navigation size={10} />
                                {distKm} km
                            </div>
                        )}
                        {shop.deliveryAvailable && (
                            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50/80 px-2 py-1 rounded-lg border border-emerald-100/60">
                                <Truck size={10} />
                                {shop.deliveryCharge === 0 ? 'Free delivery' : `₹${shop.deliveryCharge} delivery`}
                            </div>
                        )}
                        {!shop.shopImage && !isOpen && (
                            <span className="text-[11px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-lg border border-red-100/60">
                                Closed
                            </span>
                        )}
                    </div>

                    {/* CTA */}
                    <div className="mt-3.5 flex items-center justify-between">
                        <span className="text-[11px] text-gray-400 font-medium">
                            {shop.productCount ? `${shop.productCount} products` : 'View products'}
                        </span>
                        <div className="flex items-center gap-1 text-xs font-black text-indigo-600 group-hover:gap-2 transition-all duration-200">
                            View Shop
                            <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                        </div>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
};

export default ShopCard;
