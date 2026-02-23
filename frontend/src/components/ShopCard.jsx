import React from 'react';
import { MapPin, Star, Truck, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';

const ShopCard = ({ shop }) => {
    if (!shop) return null;

    // Use real computed distance if available from $geoNear aggregate
    const distKm = shop.distanceKm != null
        ? shop.distanceKm
        : shop.distanceMeters != null
            ? Math.round(shop.distanceMeters / 100) / 10
            : null;

    return (
        <Link to={`/shop/${shop._id}`} className="block">
            <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 overflow-hidden p-4 group">
                {/* Shop header */}
                <div className="flex justify-between items-start mb-3">
                    <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-base text-gray-900 group-hover:text-blue-600 transition-colors truncate">{shop.shopName}</h3>
                        <span className="inline-block text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full mt-1">{shop.category}</span>
                    </div>
                    {shop.rating != null && (
                        <div className="bg-green-600 text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1 shrink-0 ml-2 font-semibold">
                            {shop.rating} <Star size={10} className="fill-current" />
                        </div>
                    )}
                </div>

                {/* Address */}
                <div className="flex items-start gap-2 text-sm text-gray-500 mb-2">
                    <MapPin size={14} className="mt-0.5 text-gray-400 shrink-0" />
                    <span className="line-clamp-1">{shop.address}</span>
                </div>

                {/* Distance */}
                {distKm != null && (
                    <div className="flex items-center gap-1.5 text-blue-600 text-xs font-semibold mb-2">
                        <Navigation size={12} />
                        <span>{distKm} km away</span>
                    </div>
                )}

                {/* Delivery */}
                {shop.deliveryAvailable && (
                    <div className="flex items-center gap-1.5 text-green-600 text-xs font-medium">
                        <Truck size={12} />
                        <span>Delivery: {shop.deliveryCharge === 0 ? 'Free' : `₹${shop.deliveryCharge}`}</span>
                    </div>
                )}

                {/* CTA */}
                <button className="mt-3 w-full border border-blue-500 text-blue-600 py-1.5 rounded-xl hover:bg-blue-600 hover:text-white transition-all text-sm font-semibold">
                    View Products
                </button>
            </div>
        </Link>
    );
};

export default ShopCard;
