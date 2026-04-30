import React from 'react';
import { Search, Camera, Mic, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const SearchBar = () => {
    const navigate = useNavigate();

    return (
        <div className="px-4 mt-2">
            <motion.div
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/search', { replace: false })}
                className="relative cursor-pointer group"
            >
                {/* Glow effect on tap */}
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-400/20 via-purple-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300" />

                {/* Main bar */}
                <div className="relative flex items-center bg-white border border-gray-200/80 rounded-2xl px-4 py-3 shadow-sm group-hover:shadow-md group-hover:border-indigo-200 transition-all duration-300 gap-3">
                    {/* Search icon with gradient */}
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shrink-0 shadow-sm shadow-indigo-300/30">
                        <Search size={15} className="text-white" strokeWidth={2.5} />
                    </div>

                    <input
                        type="text"
                        placeholder="Search products, brands & more..."
                        className="flex-1 outline-none text-sm text-gray-400 font-medium bg-transparent placeholder-gray-400 pointer-events-none select-none"
                        readOnly
                    />

                    {/* Right icons */}
                    <div className="flex items-center gap-2.5 border-l border-gray-100 pl-3 shrink-0">
                        <button className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center hover:bg-indigo-50 transition-colors" onClick={e => e.stopPropagation()}>
                            <Mic size={14} className="text-gray-500" />
                        </button>
                        <button className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center hover:bg-indigo-50 transition-colors" onClick={e => e.stopPropagation()}>
                            <Camera size={14} className="text-gray-500" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SearchBar;
