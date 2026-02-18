import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Star, Phone, Truck, Clock } from 'lucide-react';
import ProductCard from '../components/ProductCard';

const ShopDetails = () => {
    const { id } = useParams();
    const [shop, setShop] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock data fetch
        setTimeout(() => {
            setShop({
                _id: id,
                shopName: 'Gupta General Store',
                category: 'Grocery',
                rating: 4.8,
                reviewCount: 124,
                address: 'Anisabad Golambar, Patna',
                phone: '9876543210',
                distanceKm: 0.5,
                deliveryAvailable: true,
                deliveryCharge: 20,
                openingHours: '9:00 AM - 9:00 PM'
            });
            setProducts([
                { _id: '1', name: 'Amul Milk (Taaza)', price: 54, availability: true, stockQuantity: 20, category: 'Dairy', shop: { shopName: 'Gupta General Store' } },
                { _id: '2', name: 'Basmati Rice 1kg', price: 120, availability: true, stockQuantity: 15, category: 'Grocery', shop: { shopName: 'Gupta General Store' } },
                { _id: '3', name: 'Sugar 1kg', price: 45, availability: true, stockQuantity: 100, category: 'Grocery', shop: { shopName: 'Gupta General Store' } },
            ]);
            setLoading(false);
        }, 500);
    }, [id]);

    if (loading) return <div className="p-8 text-center">Loading Shop Details...</div>;
    if (!shop) return <div className="p-8 text-center">Shop not found</div>;

    return (
        <div className="container mx-auto px-4 py-6">
            {/* Shop Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{shop.shopName}</h1>
                        <p className="text-gray-500 font-medium mb-4">{shop.category}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center"><MapPin size={16} className="mr-1" /> {shop.address}</span>
                            <span className="flex items-center text-blue-600 font-medium"><Star size={16} className="mr-1 fill-current" /> {shop.rating} ({shop.reviewCount} reviews)</span>
                        </div>
                    </div>
                    <div className="mt-4 md:mt-0 flex flex-col items-end space-y-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${shop.deliveryAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {shop.deliveryAvailable ? 'Delivery Available' : 'Pickup Only'}
                        </span>
                        {shop.deliveryAvailable && <span className="text-xs text-gray-500">Delivery Charge: ₹{shop.deliveryCharge}</span>}
                        <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
                            <Phone size={18} className="mr-2" /> Contact Shop
                        </button>
                    </div>
                </div>
                <hr className="my-6 border-gray-100" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                    <div className="flex items-center text-gray-600">
                        <Clock size={18} className="mr-3 text-gray-400" />
                        <div>
                            <p className="font-semibold text-gray-900">Opening Hours</p>
                            <p>{shop.openingHours}</p>
                        </div>
                    </div>
                    <div className="flex items-center text-gray-600">
                        <Truck size={18} className="mr-3 text-gray-400" />
                        <div>
                            <p className="font-semibold text-gray-900">Delivery Range</p>
                            <p>Within 3 km</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Shop Products */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Products Available</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map(product => (
                    <ProductCard key={product._id} product={product} />
                ))}
            </div>
        </div>
    );
};

export default ShopDetails;
