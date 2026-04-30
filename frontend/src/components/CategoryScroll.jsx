import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const categories = [
    { name: 'For You',     icon: '✨', gradient: 'from-violet-400 to-purple-500',   bg: 'from-violet-50  to-purple-100/60'  },
    { name: 'Fashion',     icon: '👕', gradient: 'from-pink-400 to-rose-500',        bg: 'from-pink-50    to-rose-100/60'    },
    { name: 'Mobiles',     icon: '📱', gradient: 'from-blue-400 to-indigo-500',      bg: 'from-blue-50    to-indigo-100/60'  },
    { name: 'Beauty',      icon: '💄', gradient: 'from-fuchsia-400 to-pink-500',     bg: 'from-fuchsia-50 to-pink-100/60'   },
    { name: 'Electronics', icon: '💻', gradient: 'from-cyan-400 to-blue-500',        bg: 'from-cyan-50    to-blue-100/60'   },
    { name: 'Home',        icon: '🏠', gradient: 'from-emerald-400 to-teal-500',     bg: 'from-emerald-50 to-teal-100/60'   },
    { name: 'Appliances',  icon: '📺', gradient: 'from-amber-400 to-orange-500',     bg: 'from-amber-50   to-orange-100/60' },
    { name: 'Toys',        icon: '🧸', gradient: 'from-lime-400 to-green-500',       bg: 'from-lime-50    to-green-100/60'  },
    { name: 'Sports',      icon: '⚽', gradient: 'from-sky-400 to-cyan-500',         bg: 'from-sky-50     to-cyan-100/60'   },
    { name: 'Furniture',   icon: '🪑', gradient: 'from-orange-400 to-red-500',       bg: 'from-orange-50  to-red-100/60'    },
];

const CategoryScroll = () => {
    return (
        <div className="px-2 mt-2">
            <div className="flex overflow-x-auto no-scrollbar gap-3 px-2 pb-4 snap-x">
                {categories.map((cat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <Link
                            to={`/search?category=${cat.name}`}
                            className="flex flex-col items-center gap-2 min-w-[76px] sm:min-w-[88px] snap-start group"
                        >
                            {/* Icon pill */}
                            <div className={`relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br ${cat.bg} flex items-center justify-center border border-white/70 shadow-sm group-hover:shadow-lg group-hover:-translate-y-1.5 transition-all duration-350 overflow-hidden`}>
                                {/* Gradient ring on hover */}
                                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${cat.gradient} opacity-0 group-hover:opacity-15 transition-opacity duration-300`} />
                                <span className="relative z-10 text-2xl group-hover:scale-115 transition-transform duration-300">
                                    {cat.icon}
                                </span>

                                {/* Shimmer sweep */}
                                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12" />
                            </div>

                            <span className={`text-xs font-bold text-gray-600 text-center whitespace-nowrap group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:${cat.gradient} transition-all duration-300`}>
                                {cat.name}
                            </span>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default CategoryScroll;
