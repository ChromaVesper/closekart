import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white pt-10 pb-6 mt-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div>
                        <h3 className="text-xl font-bold mb-4 text-blue-400">CLOSEKART</h3>
                        <p className="text-gray-400 text-sm">
                            Discover local shops, compare prices, and get the best deals in your neighborhood.
                            Real-time stock availability at your fingertips.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4 text-gray-200">For Customers</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><a href="#" className="hover:text-white">Search Products</a></li>
                            <li><a href="#" className="hover:text-white">Nearby Shops</a></li>
                            <li><a href="#" className="hover:text-white">Track Order</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4 text-gray-200">For Shopkeepers</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><a href="#" className="hover:text-white">Register Shop</a></li>
                            <li><a href="#" className="hover:text-white">Shop Dashboard</a></li>
                            <li><a href="#" className="hover:text-white">Pricing</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4 text-gray-200">Contact</h4>
                        <p className="text-sm text-gray-400 mb-2">Anisabad, Patna, Bihar</p>
                        <p className="text-sm text-gray-400">support@closekart.com</p>
                    </div>
                </div>
                <div className="border-t border-gray-700 pt-6 text-center text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} CloseKart. All rights reserved. Capstone Project.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
