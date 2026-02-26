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

                    {/* Links Column 1 */}
                    <div>
                        <h4 className="font-semibold mb-4 text-gray-200">CloseKart</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li>
                                <Link to="/about" className="hover:text-white hover:underline transition-colors cursor-pointer">
                                    About CloseKart
                                </Link>
                            </li>
                            <li>
                                <Link to="/developers" className="hover:text-white hover:underline transition-colors cursor-pointer">
                                    Developers
                                </Link>
                            </li>
                            <li>
                                <Link to="/swapkeeper/dashboard" className="hover:text-white hover:underline transition-colors cursor-pointer">
                                    SwapKeeper Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="hover:text-white hover:underline transition-colors cursor-pointer">
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Links Column 2 */}
                    <div>
                        <h4 className="font-semibold mb-4 text-gray-200">Legal & Help</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li>
                                <Link to="/privacy" className="hover:text-white hover:underline transition-colors cursor-pointer">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link to="/terms" className="hover:text-white hover:underline transition-colors cursor-pointer">
                                    Terms
                                </Link>
                            </li>
                            <li>
                                <Link to="/help" className="hover:text-white hover:underline transition-colors cursor-pointer">
                                    Help Center
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
