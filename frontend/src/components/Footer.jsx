import React from 'react';
import { Link } from 'react-router-dom';
import { Linkedin, Instagram, Mail } from 'lucide-react';
import FounderBadge from './FounderBadge';

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white pt-10 pb-6 mt-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">

                    {/* Brand — spans 2 cols on md */}
                    <div className="md:col-span-2">
                        <h3 className="text-xl font-bold mb-4 text-blue-400">CLOSEKART</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Discover local shops, compare prices, and get the best deals in your neighbourhood.
                            Real-time stock availability at your fingertips.
                        </p>
                    </div>

                    {/* For Customers */}
                    <div>
                        <h4 className="font-semibold mb-4 text-gray-200">For Customers</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li>
                                <Link to="/search" className="hover:text-white hover:underline transition-colors cursor-pointer">
                                    Search Products
                                </Link>
                            </li>
                            <li>
                                <Link to="/shops" className="hover:text-white hover:underline transition-colors cursor-pointer">
                                    Nearby Shops
                                </Link>
                            </li>
                            <li>
                                <Link to="/orders" className="hover:text-white hover:underline transition-colors cursor-pointer">
                                    Track Order
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="hover:text-white hover:underline transition-colors cursor-pointer">
                                    About
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* For Shopkeepers */}
                    <div>
                        <h4 className="font-semibold mb-4 text-gray-200">For Shopkeepers</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li>
                                <Link to="/register-shop" className="hover:text-white hover:underline transition-colors cursor-pointer">
                                    Register Shop
                                </Link>
                            </li>
                            <li>
                                <Link to="/swapkeeper/dashboard" className="hover:text-white hover:underline transition-colors cursor-pointer">
                                    Shop Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link to="/pricing" className="hover:text-white hover:underline transition-colors cursor-pointer">
                                    Pricing
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Developer */}
                    <div>
                        <h4 className="font-semibold mb-4 text-gray-200">Developer</h4>
                        <ul className="space-y-3 text-sm text-gray-400">
                            <li>
                                <a
                                    href="https://www.linkedin.com/in/akshaymehta7"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 hover:text-blue-400 hover:underline transition-colors cursor-pointer"
                                >
                                    <Linkedin size={14} className="shrink-0" /> LinkedIn
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://instagram.com/akshay.lekh"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 hover:text-pink-400 hover:underline transition-colors cursor-pointer"
                                >
                                    <Instagram size={14} className="shrink-0" /> Instagram
                                </a>
                            </li>
                            <li>
                                <a
                                    href="mailto:closekarts@gmail.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 hover:text-blue-400 hover:underline transition-colors cursor-pointer"
                                >
                                    <Mail size={14} className="shrink-0" /> closekarts@gmail.com
                                </a>
                            </li>
                        </ul>
                    </div>

                </div>

                {/* Founder Badge */}
                <FounderBadge />

                {/* Bottom bar */}
                <div className="border-t border-gray-700 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500">
                    <span>&copy; {new Date().getFullYear()} CloseKart. All rights reserved.</span>
                    <span>
                        Developed by{' '}
                        <a
                            href="https://www.linkedin.com/in/akshaymehta7"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline font-semibold"
                        >
                            Akshay Mehta
                        </a>
                    </span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
