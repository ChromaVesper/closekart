import React from 'react';
import { Store, ShoppingBag, Plus, Heart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    if (!product) return null;

    const { name, price, shop, availability, image } = product;
    const shopName = shop?.shopName || 'Unknown Shop';

    return (
        <motion.div
            whileHover={{ y: -6, scale: 1.015 }}
            transition={{ type: 'spring', bounce: 0.4, duration: 0.35 }}
            className="group relative bg-white rounded-3xl overflow-hidden flex flex-col w-full border border-gray-100/80 shadow-sm hover:shadow-xl hover:shadow-indigo-100/40 transition-shadow duration-400"
        >
            {/* Image */}
            <div className="h-48 bg-gray-50 relative overflow-hidden">
                {image ? (
                    <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
                        <ShoppingBag size={40} strokeWidth={1.2} className="text-indigo-200" />
                    </div>
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Wishlist button */}
                <button className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white hover:scale-110 transition-all duration-200 opacity-0 group-hover:opacity-100">
                    <Heart size={14} className="text-gray-500 hover:text-pink-500 transition-colors" />
                </button>

                {/* Out of stock */}
                {!availability && (
                    <div className="absolute inset-0 bg-white/75 backdrop-blur-[3px] flex items-center justify-center">
                        <span className="bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-black tracking-widest px-4 py-1.5 rounded-full shadow-lg uppercase">
                            Out of Stock
                        </span>
                    </div>
                )}

                {/* Quick Add */}
                {availability && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="absolute inset-x-3 bottom-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"
                    >
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                addToCart(product, product.shop?._id || product.shop);
                            }}
                            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white text-xs font-bold py-2.5 rounded-2xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 flex items-center justify-center gap-1.5 transition-all duration-200"
                        >
                            <Plus size={14} strokeWidth={3} />
                            Quick Add
                        </button>
                    </motion.div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
                {/* Shop chip */}
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 mb-2">
                    <div className="w-4 h-4 rounded-md bg-indigo-50 flex items-center justify-center">
                        <Store size={9} className="text-indigo-500" />
                    </div>
                    <span className="truncate max-w-[110px]">{shopName}</span>
                </div>

                <h3 className="font-bold text-sm text-gray-900 line-clamp-2 leading-snug mb-3 group-hover:text-indigo-700 transition-colors duration-200">
                    {name}
                </h3>

                <div className="mt-auto flex items-center justify-between">
                    <span className="text-lg font-black text-gray-900 tracking-tight">
                        ₹<span className="text-gradient">{price}</span>
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                        <Star size={11} className="fill-amber-400 text-amber-400" />
                        4.5
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
