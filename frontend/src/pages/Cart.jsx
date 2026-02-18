import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Cart = () => {
    return (
        <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-blue-50 p-6 rounded-full text-blue-600 mb-6">
                <ShoppingCart size={48} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Cart is Empty</h2>
            <p className="text-gray-500 mb-6">Looks like you haven't added anything yet.</p>
            <Link to="/search" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition shadow-lg">
                Start Shopping
            </Link>
        </div>
    );
};

export default Cart;
