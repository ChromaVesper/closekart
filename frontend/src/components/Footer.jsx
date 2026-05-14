import React from 'react';
import { Link } from 'react-router-dom';
import { Linkedin, Instagram, Mail, Zap, MapPin, ArrowRight } from 'lucide-react';
import FounderBadge from './FounderBadge';

const Footer = () => {
    return (
        <footer className="relative overflow-hidden mt-16">
            {/* Dark gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-slate-900 to-indigo-950" />
            {/* Mesh */}
            <div className="absolute inset-0 opacity-30">
                <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-[-20%] right-[-5%] w-80 h-80 bg-purple-500/15 rounded-full blur-3xl" />
            </div>

            <div className="relative pt-16 pb-8">
                <div className="container mx-auto px-6 lg:px-8">

                    {/* Top Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">

                        {/* Brand — spans 2 cols */}
                        <div className="lg:col-span-2">
                            <Link to="/" className="flex items-center gap-2.5 group mb-5">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                                    <Zap size={18} className="text-white fill-white" strokeWidth={0} />
                                </div>
                                <span className="text-xl font-black text-white tracking-tight">CloseKart</span>
                            </Link>
                            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
                                Discover local shops, compare prices, and get the best deals in your neighbourhood.
                                Real-time stock at your fingertips.
                            </p>

                            {/* Location badge */}
                            <div className="inline-flex items-center gap-2 mt-5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-xs font-semibold">
                                <MapPin size={13} className="text-indigo-400" />
                                Hyperlocal • Always Near You
                            </div>
                        </div>

                        {/* CloseKart links */}
                        <div>
                            <h4 className="text-sm font-black text-white mb-5 uppercase tracking-wider">Platform</h4>
                            <ul className="space-y-3">
                                {[
                                    { label: 'About Us', to: '/about' },
                                    { label: 'Browse Shops', to: '/shops' },
                                    { label: 'Explore', to: '/explore' },
                                    { label: 'Help Center', to: '/help' },
                                ].map(l => (
                                    <li key={l.label}>
                                        <Link to={l.to} className="text-sm text-gray-400 hover:text-white transition-colors font-medium group flex items-center gap-1.5">
                                            <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all duration-200" />
                                            {l.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Legal */}
                        <div>
                            <h4 className="text-sm font-black text-white mb-5 uppercase tracking-wider">Legal</h4>
                            <ul className="space-y-3">
                                {[
                                    { label: 'Privacy Policy', to: '/privacy' },
                                    { label: 'Terms of Use', to: '/terms' },
                                    { label: 'Help Center', to: '/help' },
                                    { label: 'Contact Us', to: '/contact' },
                                ].map(l => (
                                    <li key={l.label}>
                                        <Link to={l.to} className="text-sm text-gray-400 hover:text-white transition-colors font-medium group flex items-center gap-1.5">
                                            <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all duration-200" />
                                            {l.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Developer */}
                        <div>
                            <h4 className="text-sm font-black text-white mb-5 uppercase tracking-wider">Developer</h4>
                            <ul className="space-y-3">
                                <li>
                                    <a href="https://www.linkedin.com/in/akshaymehta7" target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-blue-400 transition-colors font-medium group">
                                        <div className="w-7 h-7 rounded-lg bg-blue-500/15 group-hover:bg-blue-500/25 flex items-center justify-center transition-colors">
                                            <Linkedin size={13} className="text-blue-400" />
                                        </div>
                                        LinkedIn
                                    </a>
                                </li>
                                <li>
                                    <a href="https://instagram.com/akshay.lekh" target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-pink-400 transition-colors font-medium group">
                                        <div className="w-7 h-7 rounded-lg bg-pink-500/15 group-hover:bg-pink-500/25 flex items-center justify-center transition-colors">
                                            <Instagram size={13} className="text-pink-400" />
                                        </div>
                                        Instagram
                                    </a>
                                </li>
                                <li>
                                    <a href="mailto:closekarts@gmail.com" target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-indigo-400 transition-colors font-medium group">
                                        <div className="w-7 h-7 rounded-lg bg-indigo-500/15 group-hover:bg-indigo-500/25 flex items-center justify-center transition-colors">
                                            <Mail size={13} className="text-indigo-400" />
                                        </div>
                                        Email
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Founder Badge */}
                    <FounderBadge />

                    {/* Bottom bar */}
                    <div className="border-t border-white/8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
                        <span className="font-medium">© {new Date().getFullYear()} CloseKart. All rights reserved.</span>
                        <span className="font-medium">
                            Crafted with ❤️ by{' '}
                            <a href="https://www.linkedin.com/in/akshaymehta7" target="_blank" rel="noopener noreferrer"
                                className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">
                                Akshay Mehta
                            </a>
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
