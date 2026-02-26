import React, { useState, useEffect } from "react";

const slides = [
    {
        title: "Discover What's Closest, Fastest, & Best",
        subtitle: "Compare prices, check real-time stock, and find delivery options nearby.",
        button1: "Find Products",
        button2: "Explore Shops",
        image: "/assets/banner1.png"
    },
    {
        title: "Support Local SwapKeepers",
        subtitle: "Connect with nearby sellers instantly.",
        image: "/assets/banner2.png"
    },
    {
        title: "Fast, Reliable, and Local",
        subtitle: "Everything near you in seconds.",
        image: "/assets/banner3.png"
    }
];

export default function HeroCarousel() {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent(prev => (prev + 1) % slides.length);
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-[320px] md:h-[420px] relative overflow-hidden rounded-xl">
            {slides.map((slide, index) => (
                <div
                    key={index}
                    className={`absolute w-full h-full transition-all duration-700 ${index === current
                            ? "opacity-100 translate-x-0"
                            : "opacity-0 translate-x-full"
                        }`}
                >
                    <div className="bg-gradient-to-r from-blue-700 to-blue-500 h-full flex flex-col justify-center px-8 text-white relative">

                        {/* If images exist, they would render here as backgrounds or layered elements */}
                        {/* <img src={slide.image} className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-20" alt="" /> */}

                        <div className="relative z-10">
                            <h1 className="text-3xl md:text-5xl font-bold">
                                {slide.title}
                            </h1>

                            <p className="mt-3 text-lg">
                                {slide.subtitle}
                            </p>

                            {slide.button1 && (
                                <div className="mt-6 flex flex-wrap gap-4">
                                    <button className="bg-white text-blue-700 px-6 py-2.5 rounded-lg font-bold hover:bg-gray-100 transition shadow">
                                        {slide.button1}
                                    </button>
                                    {slide.button2 && (
                                        <button className="bg-blue-600 text-white border border-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-800 transition shadow">
                                            {slide.button2}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            ))}
        </div>
    );
}
