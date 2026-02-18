import React from 'react';
import { MapPin, ShoppingBag, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
    // Defensive check if product is undefined
    if (!product) return null;

    const { name, price, shop, availability, stockQuantity, category } = product;
    const shopName = shop?.shopName || "Unknown Shop";
    const rating = shop?.rating || 4.5;
    const distance = shop?.distanceKm || 0.5;

    return (
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 overflow-hidden flex flex-col h-full">
            <div className="h-40 bg-gray-100 flex items-center justify-center relative">
                <span className="text-gray-400 font-medium">{category}</span>
                {!availability && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">OUT OF STOCK</span>
                    </div>
                )}
            </div>

            <div className="p-4 flex flex-col flex-1">
                <h3 className="font-semibold text-lg text-gray-800 line-clamp-2 mb-1">{name}</h3>

                <div className="flex items-center text-sm text-gray-500 mb-2">
                    <MapPin size={14} className="mr-1 text-green-600" />
                    <span className="truncate">{shopName}</span>
                    <span className="mx-1">•</span>
                    <span className="text-green-600">{distance} km</span>
                </div>

                <div className="flex items-center mb-3">
                    <div className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded flex items-center">
                        {rating} <Star size={10} className="ml-1 fill-current" />
                    </div>
                    <span className="text-xs text-gray-400 ml-2">({Math.floor(Math.random() * 50) + 1} ratings)</span>
                </div>

                <div className="mt-auto flex items-center justify-between">
                    <span className="text-xl font-bold text-gray-900">₹{price}</span>
                    <div className={`text-xs font-medium px-2 py-1 rounded ${availability ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>
                        {availability ? `${stockQuantity} in stock` : 'Unavailable'}
                    </div>
                </div>

                <button
                    disabled={!availability}
                    className={`mt-3 w-full py-2 rounded font-medium text-sm flex items-center justify-center transition-colors
            ${availability
                            ? 'bg-yellow-400 hover:bg-yellow-500 text-gray-900'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                >
                    <ShoppingBag size={16} className="mr-2" />
                    {availability ? 'Visit Shop' : 'Sold Out'}
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
