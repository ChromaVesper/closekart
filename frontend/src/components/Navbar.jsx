import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Menu, X, User, MapPin, Navigation } from 'lucide-react';
import { useLocation } from '../contexts/LocationContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const navigate = useNavigate();
    const { address, getCurrentLocation, loadingLocation } = useLocation();

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/search?q=${query}`);
        }
    };

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo & Location */}
                    <div className="flex items-center space-x-4">
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="bg-blue-600 text-white p-1 rounded font-bold text-xl">CK</div>
                            <span className="text-2xl font-bold text-blue-900 tracking-tight">CLOSEKART</span>
                        </Link>
                        <div
                            className="hidden md:flex items-center text-sm text-gray-600 hover:text-blue-600 cursor-pointer"
                            onClick={getCurrentLocation}
                            title="Click to detect current location"
                        >
                            <MapPin size={16} className="mr-1" />
                            <span className="truncate max-w-[200px]">{loadingLocation ? 'Detecting...' : address}</span>
                        </div>
                    </div>

                    {/* Search Bar - Desktop */}
                    <div className="hidden md:flex flex-1 max-w-xl mx-8">
                        <form onSubmit={handleSearch} className="w-full relative">
                            <input
                                type="text"
                                placeholder="Search for products, shops, or services..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="absolute right-0 top-0 h-full bg-blue-600 text-white px-4 rounded-r-md hover:bg-blue-700 transition-colors"
                            >
                                <Search size={20} />
                            </button>
                        </form>
                    </div>

                    {/* Right Icons */}
                    <div className="hidden md:flex items-center space-x-6">
                        <Link to="/login" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 font-medium">
                            <User size={20} />
                            <span>Login</span>
                        </Link>
                        <Link to="/cart" className="relative text-gray-700 hover:text-blue-600">
                            <ShoppingCart size={24} />
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">0</span>
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-700 hover:text-blue-600 focus:outline-none"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Search & Menu */}
                {isOpen && (
                    <div className="md:hidden pb-4">
                        <form onSubmit={handleSearch} className="mb-4 relative">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            <button type="submit" className="absolute right-2 top-2 text-gray-500">
                                <Search size={20} />
                            </button>
                        </form>
                        <div className="flex flex-col space-y-2">
                            <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">Login</Link>
                            <Link to="/register" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">Register Shop</Link>
                            <button
                                onClick={getCurrentLocation}
                                className="px-3 py-2 rounded-md text-base font-medium text-gray-700 flex items-center hover:bg-gray-50 w-full text-left"
                            >
                                <MapPin size={16} className="mr-2" />
                                {loadingLocation ? 'Detecting...' : address}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
