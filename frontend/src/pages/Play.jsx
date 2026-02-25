import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';

const Play = () => {
    const [shorts, setShorts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchShorts = async () => {
            try {
                // Fetch from real backend
                const response = await api.get('/shorts');
                setShorts(response.data);
            } catch (error) {
                console.error("Error fetching shorts, falling back to dummy data", error);
                // Fallback to dummy realistic data if api fails
                setShorts([
                    {
                        _id: "1",
                        title: "Beautiful sunset at the local beach 🌅 #nature",
                        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
                        sellerId: { shopName: "Local Explorers" }
                    },
                    {
                        _id: "2",
                        title: "Trying the new spicy ramen from Downtown Noodle! 🍜🔥",
                        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
                        sellerId: { shopName: "Foodie Reviews" }
                    }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchShorts();
    }, []);

    if (loading) {
        return <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-black">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
        </div>;
    }

    if (shorts.length === 0) {
        return <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-black text-white">
            <p>No shorts available at the moment.</p>
        </div>;
    }

    return (
        <div className="h-[calc(100vh-64px)] w-full bg-black overflow-y-scroll snap-y snap-mandatory hide-scrollbar relative">
            {shorts.map((short, index) => (
                <VideoPlayer key={short._id} short={short} autoPlay={index === 0} />
            ))}
        </div>
    );
};

const VideoPlayer = ({ short, autoPlay }) => {
    const videoRef = useRef(null);
    const [playing, setPlaying] = useState(autoPlay);

    // Play/Pause interaction
    const handleVideoPress = () => {
        if (playing) {
            videoRef.current.pause();
            setPlaying(false);
        } else {
            videoRef.current.play();
            setPlaying(true);
        }
    };

    // Intersection Observer to autoplay when in view and pause when out of view
    useEffect(() => {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.6 // 60% of the video must be visible
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    videoRef.current.play().catch(e => console.log("Autoplay prevented", e));
                    setPlaying(true);
                } else {
                    videoRef.current.pause();
                    setPlaying(false);
                }
            });
        }, options);

        if (videoRef.current) {
            observer.observe(videoRef.current);
        }

        return () => {
            if (videoRef.current) observer.unobserve(videoRef.current);
        };
    }, []);

    return (
        <div className="h-[calc(100vh-64px)] w-full w-full max-w-lg mx-auto snap-start relative bg-black flex justify-center items-center">
            <video
                ref={videoRef}
                src={short.videoUrl}
                className="w-full h-full object-cover cursor-pointer"
                loop
                muted={false} /* Important for immersive shorts */
                onClick={handleVideoPress}
                playsInline
            />

            {/* Play/Pause overlay indicator */}
            {!playing && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20">
                    <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center text-white backdrop-blur-sm">
                        <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                </div>
            )}

            {/* Bottom Info Overlay */}
            <div className="absolute bottom-16 sm:bottom-4 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white pb-safe">
                <h3 className="font-bold text-sm mb-1">@{short.sellerId?.shopName || "User"}</h3>
                <p className="text-sm font-medium line-clamp-2">{short.title}</p>
            </div>
        </div>
    );
};

export default Play;
