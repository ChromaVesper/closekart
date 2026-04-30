import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const slides = [
    {
        title: 'Discover What\'s\nClosest & Best',
        subtitle: 'Compare prices, check real-time stock, and find the best deals nearby.',
        cta: 'Find Products',
        ctaSecondary: 'Explore Shops',
        ctaLink: '/search',
        ctaSecondaryLink: '/shops',
        gradient: 'from-[#667eea] via-[#764ba2] to-[#f093fb]',
        accent: '#667eea',
        emoji: '⚡',
    },
    {
        title: 'Support Local\nSwapKeepers',
        subtitle: 'Connect with nearby sellers instantly and get the freshest deals.',
        cta: 'Browse Sellers',
        ctaLink: '/shops',
        gradient: 'from-[#f093fb] via-[#f5576c] to-[#fda085]',
        accent: '#f5576c',
        emoji: '🛍️',
    },
    {
        title: 'Fast, Reliable\n& Hyperlocal',
        subtitle: 'Everything near you, delivered in seconds. Shop smarter, not harder.',
        cta: 'Start Shopping',
        ctaLink: '/search',
        gradient: 'from-[#4facfe] via-[#00f2fe] to-[#43e97b]',
        accent: '#4facfe',
        emoji: '🚀',
    },
];

const INTERVAL = 5000;

export default function HeroCarousel() {
    const [current, setCurrent] = useState(0);
    const [direction, setDirection] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        const id = setInterval(() => {
            setDirection(1);
            setCurrent(prev => (prev + 1) % slides.length);
        }, INTERVAL);
        return () => clearInterval(id);
    }, []);

    const go = (idx) => {
        setDirection(idx > current ? 1 : -1);
        setCurrent(idx);
    };

    const prev = () => {
        setDirection(-1);
        setCurrent(prev => (prev - 1 + slides.length) % slides.length);
    };

    const next = () => {
        setDirection(1);
        setCurrent(prev => (prev + 1) % slides.length);
    };

    const slide = slides[current];

    const variants = {
        enter: (dir) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0, scale: 0.97 }),
        center: { x: 0, opacity: 1, scale: 1 },
        exit: (dir) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0, scale: 0.97 }),
    };

    return (
        <div className="relative w-full h-[300px] sm:h-[380px] md:h-[440px] rounded-3xl overflow-hidden shadow-[0_32px_64px_-20px_rgba(0,0,0,0.2)] group">

            {/* Animated slide */}
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.div
                    key={current}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                    className={`absolute inset-0 bg-gradient-to-br ${slide.gradient}`}
                >
                    {/* Mesh overlay */}
                    <div className="absolute inset-0 opacity-30 mix-blend-overlay">
                        <div className="absolute top-[-20%] left-[-10%] w-80 h-80 rounded-full bg-white mix-blend-overlay blur-3xl animate-blob" />
                        <div className="absolute bottom-[-20%] right-[-10%] w-72 h-72 rounded-full bg-white/70 mix-blend-overlay blur-3xl animate-blob" style={{ animationDelay: '3s' }} />
                    </div>

                    {/* Dark vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />

                    {/* Content */}
                    <div className="relative h-full flex flex-col justify-end px-6 sm:px-10 md:px-14 pb-10 sm:pb-14 z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        >
                            {/* Emoji badge */}
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-4">
                                <span className="text-lg">{slide.emoji}</span>
                                <span className="text-xs font-bold text-white/90 uppercase tracking-widest">CloseKart</span>
                            </div>

                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.05] tracking-tight text-glow whitespace-pre-line">
                                {slide.title}
                            </h1>

                            <p className="mt-3 text-sm sm:text-base md:text-lg text-white/75 font-medium max-w-md leading-relaxed">
                                {slide.subtitle}
                            </p>

                            {/* CTAs */}
                            <div className="mt-6 flex flex-wrap gap-3">
                                <button
                                    onClick={() => navigate(slide.ctaLink)}
                                    className="px-6 py-3 bg-white text-gray-900 font-black rounded-2xl text-sm hover:bg-gray-50 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(255,255,255,0.3)] transition-all duration-300 magnetic-glow"
                                >
                                    {slide.cta} →
                                </button>
                                {slide.ctaSecondary && (
                                    <button
                                        onClick={() => navigate(slide.ctaSecondaryLink)}
                                        className="px-6 py-3 bg-white/15 backdrop-blur-sm text-white font-bold rounded-2xl text-sm border border-white/30 hover:bg-white/25 hover:-translate-y-1 transition-all duration-300"
                                    >
                                        {slide.ctaSecondary}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Prev / Next arrows */}
            <button
                onClick={prev}
                className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white flex items-center justify-center hover:bg-white/35 transition-all duration-200 opacity-0 group-hover:opacity-100"
            >
                <ChevronLeft size={18} />
            </button>
            <button
                onClick={next}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white flex items-center justify-center hover:bg-white/35 transition-all duration-200 opacity-0 group-hover:opacity-100"
            >
                <ChevronRight size={18} />
            </button>

            {/* Progress Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                {slides.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => go(idx)}
                        className={`rounded-full transition-all duration-400 ${
                            current === idx
                                ? 'w-8 h-2 bg-white shadow-md'
                                : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                        }`}
                    />
                ))}
            </div>

            {/* Auto-progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20 z-20">
                <motion.div
                    key={current}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: INTERVAL / 1000, ease: 'linear' }}
                    style={{ originX: 0 }}
                    className="h-full bg-white/70"
                />
            </div>
        </div>
    );
}
