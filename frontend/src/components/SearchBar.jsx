import React from 'react';
import { Search, Camera, Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
    const navigate = useNavigate();

    return (
        <div className="px-4 mt-2">
            <div
                onClick={() => navigate('/search', { replace: false })}
                className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 flex items-center gap-2 shadow-sm cursor-text"
            >
                <Search size={20} className="text-gray-400" />
                <input
                    type="text"
                    placeholder="Search for Products, Brands and More"
                    className="flex-1 outline-none text-sm text-gray-700 bg-transparent placeholder-gray-400 pointer-events-none"
                    readOnly
                />
                <div className="flex items-center gap-3 border-l pl-3 border-gray-200">
                    <Mic size={20} className="text-gray-500 hover:text-blue-600 transition" />
                    <Camera size={20} className="text-gray-500 hover:text-blue-600 transition" />
                </div>
            </div>
        </div>
    );
};

export default SearchBar;
