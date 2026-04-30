import React, { useState } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Store } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useUserLocation } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';
import AddressModal from '../components/AddressModal';
import { MapPin } from 'lucide-react';
import api from '../services/api';

const Cart = () => {
    const { cartItems, shopId, updateQuantity, removeFromCart, totalAmount, clearCart } = useCart();
    const { coords, locationName } = useUserLocation();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [error, setError] = useState('');
    const [isAddressModalOpen, setAddressModalOpen] = useState(false);

    const handleCheckout = async () => {
        if (!user) {
            navigate('/login?redirect=/cart');
            return;
        }

        if (!coords) {
            setError('Please enable location services to place an order.');
            return;
        }

        setIsCheckingOut(true);
        setError('');

        try {
            const orderData = {
                shopId,
                products: cartItems,
                totalAmount: totalAmount + 20, // +20 delivery fee simulation
                deliveryLocation: {
                    lat: coords.latitude,
                    lng: coords.longitude,
                    address: locationName || "Current Location"
                }
            };

            await api.post('/orders', orderData);
            clearCart();
            navigate('/orders'); // Redirect to their orders tracking page
        } catch (err) {
            console.error('Checkout failed', err);
            setError('Failed to place order. Please try again.');
        } finally {
            setIsCheckingOut(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4 min-h-[60vh]">
                <div className="bg-blue-50 p-6 rounded-full text-blue-600 mb-6 shadow-inner">
                    <ShoppingCart size={48} strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Your Cart is Empty</h2>
                <p className="text-gray-500 font-medium mb-8 text-center max-w-sm">Looks like you haven't added anything yet. Discover nearby stores and start shopping!</p>
                <Link to="/" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3.5 rounded-xl font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all">
                    Find Nearby Stores
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 mb-20 md:mb-8 font-sans">
            <h1 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                <ShoppingCart className="text-blue-600" />
                Review Your Order
            </h1>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl font-medium text-sm mb-6 border border-red-100 flex items-center justify-between">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4 flex items-center gap-3 text-sm font-semibold text-gray-600 bg-blue-50/50">
                        <Store size={18} className="text-blue-500" />
                        Ordering from a single store ensures fast delivery
                    </div>

                    {cartItems.map((item) => (
                        <div key={item.productId} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row items-center gap-4 relative">
                            <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                                {item.image ? (
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <ShoppingCart size={24} />
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex-1 w-full flex flex-col justify-between">
                                <h3 className="font-bold text-gray-900 text-base mb-1">{item.name}</h3>
                                <div className="text-lg font-black text-blue-600">₹{item.price}</div>
                            </div>

                            <div className="flex items-center space-x-3 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
                                <button 
                                    onClick={() => updateQuantity(item.productId, -1)}
                                    className="p-1.5 hover:bg-white hover:text-gray-900 hover:shadow-sm rounded-lg text-gray-400 transition-all font-bold"
                                >
                                    <Minus size={16} />
                                </button>
                                <span className="font-bold text-gray-900 w-4 text-center">{item.quantity}</span>
                                <button 
                                    onClick={() => updateQuantity(item.productId, 1)}
                                    className="p-1.5 hover:bg-white hover:text-gray-900 hover:shadow-sm rounded-lg text-gray-400 transition-all font-bold"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>

                            <button 
                                onClick={() => removeFromCart(item.productId)}
                                className="sm:absolute sm:top-4 sm:right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Checkout Summary & Delivery Address */}
                <div className="lg:col-span-1 space-y-6">
                    
                    {/* Delivery Address Card */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 relative">
                        <div className="flex items-start gap-4 mb-2">
                            <div className="p-2 bg-blue-50 rounded-xl">
                                <MapPin size={24} className="text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Delivering to:</h3>
                                <p className="text-gray-900 font-bold leading-snug line-clamp-3 mb-4">{locationName || "Fetching location..."}</p>
                                <button 
                                    onClick={() => setAddressModalOpen(true)}
                                    className="px-4 py-2 bg-gray-50 text-blue-600 font-bold text-sm rounded-xl hover:bg-gray-100 hover:text-blue-700 transition"
                                >
                                    Change Address
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Bill Details */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sticky top-24">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">Bill Details</h2>
                        
                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-gray-600 font-medium text-sm">
                                <span>Item Total</span>
                                <span className="text-gray-900 font-bold">₹{totalAmount}</span>
                            </div>
                            <div className="flex justify-between text-gray-600 font-medium text-sm">
                                <span>Delivery Fee</span>
                                <span className="text-gray-900 font-bold">₹20</span>
                            </div>
                            <div className="flex justify-between text-gray-600 font-medium text-sm">
                                <span>Taxes & Charges</span>
                                <span className="text-green-600 font-bold">Free</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 mb-8">
                            <div className="flex justify-between items-center">
                                <span className="text-base font-bold text-gray-900">To Pay</span>
                                <span className="text-2xl font-black text-gray-900">₹{totalAmount + 20}</span>
                            </div>
                        </div>

                        <button 
                            onClick={handleCheckout}
                            disabled={isCheckingOut}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
                        >
                            {isCheckingOut ? (
                                <span className="animate-pulse">Processing...</span>
                            ) : (
                                <>
                                    Place Order
                                    <ArrowRight size={20} strokeWidth={3} />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <AddressModal isOpen={isAddressModalOpen} onClose={() => setAddressModalOpen(false)} />
        </div>
    );
};

export default Cart;
