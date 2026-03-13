import React from 'react';
import { Store, ShoppingBag, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
    if (!product) return null;

    const { name, price, shop, availability, image } = product;
    const shopName = shop?.shopName || "Unknown Shop";

    return (
        <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col w-full hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 relative">

            {/* Image Container with Hover Effects */}
            <div className="h-44 bg-gray-50 relative overflow-hidden">
                {image ? (
                    <img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 group-hover:scale-105 transition-transform duration-500">
                        <ShoppingBag size={40} strokeWidth={1.5} />
                    </div>
                )}

                {/* Out of stock overlay */}
                {!availability && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center z-10 transition-all">
                        <span className="bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-black tracking-wider px-3 py-1 rounded-full shadow-lg">OUT OF STOCK</span>
                    </div>
                )}

                {/* Quick Add Hover Button */}
                {availability && (
                    <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-20">
                        <button className="w-full bg-white/90 backdrop-blur-md border border-white/50 text-blue-700 text-xs font-bold py-2 rounded-xl shadow-lg hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors flex items-center justify-center gap-1.5">
                            <Plus size={14} strokeWidth={3} />
                            Quick Add
                        </button>
                    </div>
                )}
            </div>

            {/* Content Details */}
            <div className="p-3.5 flex flex-col flex-1 relative bg-white z-30">
                <div className="flex items-center text-[10px] text-gray-500 mb-2 mt-auto bg-gray-50 w-fit px-2 py-1 rounded-md font-medium">
                    <Store size={10} className="mr-1 text-gray-400" />
                    <span className="truncate max-w-[120px]">{shopName}</span>
                </div>

                <h3 className="font-bold text-sm text-gray-900 line-clamp-2 leading-snug mb-3 group-hover:text-blue-700 transition-colors">{name}</h3>

                <div className="flex items-center justify-between mt-auto">
                    <span className="text-lg font-black text-gray-900 tracking-tight">₹{price}</span>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
