import React, { useState, useEffect } from 'react';

const slides = [
    {
        id: 1,
        title: "Discover What's Closest, Fastest, & Best",
        subtitle: "Your neighborhood marketplace at your fingertips.",
    },
    {
        id: 2,
        title: "Compare prices from nearby shops",
        subtitle: "Find the best deals without leaving your home.",
    },
    {
        id: 3,
        title: "Support your local SwapKeepers",
        subtitle: "Empower your community with every purchase.",
    }
];

const HeroCarousel = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative w-full h-[30vh] sm:h-[40vh] md:h-[50vh] overflow-hidden bg-gradient-to-r from-blue-900 via-blue-700 to-blue-500">
            {/* Slides container */}
            <div
                className="flex w-full h-full transition-transform duration-1000 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
                {slides.map((slide) => (
                    <div key={slide.id} className="w-full h-full shrink-0 flex flex-col items-center justify-center px-4 text-center">
                        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white mb-4 drop-shadow-lg tracking-tight">
                            {slide.title}
                        </h1>
                        <p className="text-sm sm:text-lg md:text-xl text-blue-100 font-medium max-w-2xl drop-shadow-md">
                            {slide.subtitle}
                        </p>
                    </div>
                ))}
            </div>

            {/* Dots */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                {slides.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${currentSlide === idx ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
                            }`}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default HeroCarousel;
