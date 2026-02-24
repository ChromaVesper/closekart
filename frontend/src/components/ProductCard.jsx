import React from 'react';
import { MapPin, ShoppingBag, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
    if (!product) return null;

    const { name, price, shop, availability, image } = product;
    const shopName = shop?.shopName || "Unknown Shop";

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col w-36 sm:w-40 flex-shrink-0 snap-start">
            <div className="h-36 bg-gray-100 relative">
                {image ? (
                    <img src={image} alt={name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <ShoppingBag size={32} />
                    </div>
                )}
                {!availability && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">OUT OF STOCK</span>
                    </div>
                )}
            </div>

            <div className="p-2 flex flex-col flex-1">
                <h3 className="font-medium text-xs text-gray-800 line-clamp-2 leading-snug mb-1 h-8">{name}</h3>

                <div className="flex items-center text-[10px] text-gray-500 mb-1.5 mt-auto">
                    <Store size={10} className="mr-1 text-gray-400" />
                    <span className="truncate">{shopName}</span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-900">₹{price}</span>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
