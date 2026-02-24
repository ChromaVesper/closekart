import React from 'react';
import { Link } from 'react-router-dom';

const categories = [
    { name: 'For You', icon: '✨' },
    { name: 'Fashion', icon: '👕' },
    { name: 'Mobiles', icon: '📱' },
    { name: 'Beauty', icon: '💄' },
    { name: 'Electronics', icon: '💻' },
    { name: 'Home', icon: '🏠' },
    { name: 'Appliances', icon: '📺' },
    { name: 'Toys', icon: '🧸' },
    { name: 'Sports', icon: '⚽' },
    { name: 'Furniture', icon: '🪑' }
];

const CategoryScroll = () => {
    return (
        <div className="px-2 mt-4">
            <div className="flex overflow-x-auto hide-scrollbar gap-4 px-2 pb-2 snap-x">
                {categories.map((cat, index) => (
                    <Link
                        key={index}
                        to={`/search?category=${cat.name}`}
                        className="flex flex-col items-center gap-1.5 min-w-[64px] snap-start group"
                    >
                        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-2xl group-hover:bg-blue-100 transition shadow-sm border border-gray-200">
                            {cat.icon}
                        </div>
                        <span className="text-[10px] font-semibold text-gray-700 text-center whitespace-nowrap">
                            {cat.name}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default CategoryScroll;
