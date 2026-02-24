import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const banners = [
    { id: 1, image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop', title: 'Electronics Sale' },
    { id: 2, image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop', title: 'Fashion Deals' },
    { id: 3, image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1974&auto=format&fit=crop', title: 'Local Groceries at 50% Off' },
];

const BannerSlider = () => {
    return (
        <div className="px-2 mt-4 relative z-0">
            <div className="rounded-xl overflow-hidden shadow-sm">
                <Swiper
                    modules={[Autoplay, Pagination]}
                    spaceBetween={0}
                    slidesPerView={1}
                    loop={true}
                    autoplay={{ delay: 3000, disableOnInteraction: false }}
                    pagination={{ clickable: true, dynamicBullets: true }}
                    className="w-full h-40 md:h-64 lg:h-80 relative"
                >
                    {banners.map((banner) => (
                        <SwiperSlide key={banner.id}>
                            <img
                                src={banner.image}
                                alt={banner.title}
                                className="w-full h-full object-cover"
                            />
                            {/* Gradient Overlay for better text readability if titles were added */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </div>
    );
};

export default BannerSlider;
