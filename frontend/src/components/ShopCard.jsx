import React from 'react';
import { MapPin, Star, Phone, Truck } from 'lucide-react';

const ShopCard = ({ shop }) => {
    if (!shop) return null;

    return (
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 overflow-hidden p-4">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-lg text-gray-800">{shop.shopName}</h3>
                    <p className="text-sm text-gray-500 mb-1">{shop.category}</p>
                </div>
                <div className="bg-green-600 text-white text-xs px-2 py-1 rounded flex items-center">
                    {shop.rating} <Star size={10} className="ml-1 fill-current" />
                </div>
            </div>

            <div className="mt-3 space-y-2 text-sm text-gray-600">
                <div className="flex items-start">
                    <MapPin size={16} className="mr-2 mt-0.5 text-gray-400 shrink-0" />
                    <span className="line-clamp-2">{shop.address}</span>
                </div>
                <div className="flex items-center text-blue-600 font-medium">
                    <span className="ml-6">{shop.distanceKm} km away</span>
                </div>

                {shop.deliveryAvailable && (
                    <div className="flex items-center text-green-600">
                        <Truck size={16} className="mr-2 shrink-0" />
                        <span>Delivery: ₹{shop.deliveryCharge}</span>
                    </div>
                )}
            </div>

            <button className="mt-4 w-full border border-blue-600 text-blue-600 py-1.5 rounded hover:bg-blue-50 transition-colors text-sm font-medium">
                View Products
            </button>
        </div>
    );
};

export default ShopCard;
