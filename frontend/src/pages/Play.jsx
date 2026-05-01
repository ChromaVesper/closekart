import React, { useState, useEffect, useRef, useCallback } from 'react';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import {
    collection, doc, getDocs, addDoc, deleteDoc, getDoc,
    setDoc, query, orderBy, onSnapshot, serverTimestamp,
    updateDoc, increment
} from 'firebase/firestore';
import { Heart, MessageCircle, Share2, Bookmark, Play as PlayIcon, Pause as PauseIcon, Volume2, VolumeX, Send, X } from 'lucide-react';

// ─── Firestore helpers ────────────────────────────────────────────────────────
const likeId     = (uid, vid) => `${uid}_${vid}`;
const savedId    = (uid, vid) => `${uid}_${vid}`;

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
const ReelSkeleton = () => (
    <div className="h-screen w-full snap-start relative bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
);

// ─── Comments Drawer ──────────────────────────────────────────────────────────
const CommentsDrawer = ({ videoId, onClose, user }) => {
    const [comments, setComments] = useState([]);
    const [text, setText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!videoId) return;
        const q = query(
            collection(db, 'videos', videoId, 'comments'),
            orderBy('createdAt', 'desc')
        );
        const unsub = onSnapshot(q, snap => {
            setComments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        return unsub;
    }, [videoId]);

    const submit = async () => {
        if (!text.trim() || !user) return;
        setSubmitting(true);
        try {
            await addDoc(collection(db, 'videos', videoId, 'comments'), {
                text: text.trim(),
                userId: user.uid,
                userName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
                createdAt: serverTimestamp(),
            });
            await updateDoc(doc(db, 'videos', videoId), { commentsCount: increment(1) });
            setText('');
        } catch (e) { console.error(e); }
        finally { setSubmitting(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={onClose}>
            <div
                className="bg-[#1a1a1a] rounded-t-3xl max-h-[70vh] flex flex-col shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-2">
                    <div className="w-10 h-1 bg-gray-600 rounded-full" />
                </div>
                <div className="flex items-center justify-between px-5 pb-3 border-b border-white/10">
                    <h3 className="text-white font-black text-base">Comments</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition"><X size={20} /></button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4">
                    {comments.length === 0 && (
                        <p className="text-gray-500 text-sm text-center py-8">No comments yet. Be the first!</p>
                    )}
                    {comments.map(c => (
                        <div key={c.id} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-black shrink-0">
                                {(c.userName || 'A')[0].toUpperCase()}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 mb-0.5">{c.userName}</p>
                                <p className="text-sm text-white font-medium">{c.text}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input */}
                <div className="px-4 py-3 border-t border-white/10 flex gap-3 items-center bg-[#111]">
                    {user ? (
                        <>
                            <input
                                className="flex-1 bg-white/10 rounded-2xl px-4 py-2.5 text-sm text-white placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-indigo-500/50"
                                placeholder="Add a comment..."
                                value={text}
                                onChange={e => setText(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && submit()}
                            />
                            <button
                                onClick={submit}
                                disabled={!text.trim() || submitting}
                                className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white disabled:opacity-40 hover:bg-indigo-500 transition"
                            >
                                {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send size={16} />}
                            </button>
                        </>
                    ) : (
                        <p className="text-gray-500 text-sm text-center w-full py-1">Login to comment</p>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─── Single Video Card ─────────────────────────────────────────────────────────
const VideoCard = ({ video, user, index }) => {
    const videoRef   = useRef(null);
    const [playing, setPlaying]   = useState(false);
    const [muted,   setMuted]     = useState(true);
    const [liked,   setLiked]     = useState(false);
    const [saved,   setSaved]     = useState(false);
    const [likesCount, setLikesCount]   = useState(video.likesCount || 0);
    const [commentsCount, setCommentsCount] = useState(video.commentsCount || 0);
    const [showComments, setShowComments] = useState(false);
    const [likeLoading, setLikeLoading]   = useState(false);
    const [saveLoading, setSaveLoading]   = useState(false);

    // Check if current user already liked / saved
    useEffect(() => {
        if (!user) return;
        const checkLike = async () => {
            const d = await getDoc(doc(db, 'likes', likeId(user.uid, video.id)));
            setLiked(d.exists());
        };
        const checkSave = async () => {
            const d = await getDoc(doc(db, 'savedVideos', savedId(user.uid, video.id)));
            setSaved(d.exists());
        };
        checkLike();
        checkSave();
    }, [user, video.id]);

    // Keep commentsCount in sync
    useEffect(() => {
        setCommentsCount(video.commentsCount || 0);
    }, [video.commentsCount]);

    // Intersection observer for autoplay
    useEffect(() => {
        const el = videoRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                el.play().catch(() => {});
                setPlaying(true);
            } else {
                el.pause();
                setPlaying(false);
            }
        }, { threshold: 0.6 });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const togglePlay = () => {
        const el = videoRef.current;
        if (!el) return;
        if (playing) { el.pause(); setPlaying(false); }
        else         { el.play().catch(() => {}); setPlaying(true); }
    };

    const handleLike = async () => {
        if (!user || likeLoading) return;
        setLikeLoading(true);
        const ref = doc(db, 'likes', likeId(user.uid, video.id));
        const vidRef = doc(db, 'videos', video.id);
        try {
            if (liked) {
                await deleteDoc(ref);
                await updateDoc(vidRef, { likesCount: increment(-1) });
                setLiked(false);
                setLikesCount(c => Math.max(0, c - 1));
            } else {
                await setDoc(ref, { userId: user.uid, videoId: video.id, createdAt: serverTimestamp() });
                await updateDoc(vidRef, { likesCount: increment(1) });
                setLiked(true);
                setLikesCount(c => c + 1);
            }
        } catch (e) { console.error(e); }
        finally { setLikeLoading(false); }
    };

    const handleSave = async () => {
        if (!user || saveLoading) return;
        setSaveLoading(true);
        const ref = doc(db, 'savedVideos', savedId(user.uid, video.id));
        try {
            if (saved) {
                await deleteDoc(ref);
                setSaved(false);
            } else {
                await setDoc(ref, { userId: user.uid, videoId: video.id, createdAt: serverTimestamp() });
                setSaved(true);
            }
        } catch (e) { console.error(e); }
        finally { setSaveLoading(false); }
    };

    const handleShare = async () => {
        const url = window.location.origin + '/closekart/#/play';
        if (navigator.share) {
            try { await navigator.share({ title: video.caption, url }); } catch {}
        } else {
            await navigator.clipboard.writeText(url);
            alert('Link copied!');
        }
    };

    return (
        <>
            <div className="h-screen w-full snap-start relative bg-black flex justify-center items-center overflow-hidden">
                {/* Video */}
                <video
                    ref={videoRef}
                    src={video.videoUrl}
                    className="absolute inset-0 w-full h-full object-cover"
                    loop
                    muted={muted}
                    playsInline
                    onClick={togglePlay}
                />

                {/* Dark gradient overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                {/* Play/Pause indicator */}
                {!playing && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-20 h-20 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center">
                            <PlayIcon size={36} className="text-white ml-1" fill="white" />
                        </div>
                    </div>
                )}

                {/* Right Action Bar */}
                <div className="absolute right-4 bottom-32 flex flex-col items-center gap-5 z-10">
                    {/* Like */}
                    <button onClick={handleLike} className="flex flex-col items-center gap-1 group" disabled={likeLoading}>
                        <div className={`w-12 h-12 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 ${liked ? 'bg-red-500 scale-110' : 'bg-black/40 group-hover:bg-black/60'}`}>
                            <Heart size={22} className="text-white" fill={liked ? 'white' : 'none'} />
                        </div>
                        <span className="text-white text-xs font-bold drop-shadow">{likesCount}</span>
                    </button>

                    {/* Comment */}
                    <button onClick={() => setShowComments(true)} className="flex flex-col items-center gap-1 group">
                        <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center group-hover:bg-black/60 transition-all">
                            <MessageCircle size={22} className="text-white" />
                        </div>
                        <span className="text-white text-xs font-bold drop-shadow">{commentsCount}</span>
                    </button>

                    {/* Share */}
                    <button onClick={handleShare} className="flex flex-col items-center gap-1 group">
                        <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center group-hover:bg-black/60 transition-all">
                            <Share2 size={22} className="text-white" />
                        </div>
                        <span className="text-white text-xs font-bold drop-shadow">Share</span>
                    </button>

                    {/* Save */}
                    <button onClick={handleSave} className="flex flex-col items-center gap-1 group" disabled={saveLoading}>
                        <div className={`w-12 h-12 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 ${saved ? 'bg-yellow-500' : 'bg-black/40 group-hover:bg-black/60'}`}>
                            <Bookmark size={22} className="text-white" fill={saved ? 'white' : 'none'} />
                        </div>
                        <span className="text-white text-xs font-bold drop-shadow">{saved ? 'Saved' : 'Save'}</span>
                    </button>

                    {/* Mute/Unmute */}
                    <button onClick={() => setMuted(m => !m)} className="flex flex-col items-center gap-1 group">
                        <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center group-hover:bg-black/60 transition-all">
                            {muted ? <VolumeX size={22} className="text-white" /> : <Volume2 size={22} className="text-white" />}
                        </div>
                    </button>
                </div>

                {/* Bottom Info */}
                <div className="absolute bottom-4 left-0 right-16 px-5 pb-4 z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-black border-2 border-white/50">
                            {(video.shopName || video.userId || 'S')[0].toUpperCase()}
                        </div>
                        <p className="text-white font-black text-sm drop-shadow">
                            @{video.shopName || 'Seller'}
                        </p>
                    </div>
                    <p className="text-white/90 text-sm font-medium leading-relaxed line-clamp-2 drop-shadow">
                        {video.caption}
                    </p>
                </div>
            </div>

            {/* Comments Drawer */}
            {showComments && (
                <CommentsDrawer
                    videoId={video.id}
                    onClose={() => setShowComments(false)}
                    user={user}
                />
            )}
        </>
    );
};

// ─── MAIN PLAY PAGE ───────────────────────────────────────────────────────────
export default function Play() {
    const { user } = useAuth();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Try ordered fetch first; fallback to unordered if index missing
        const fetchVideos = async () => {
            try {
                const q = query(collection(db, 'videos'), orderBy('createdAt', 'desc'));
                const snap = await getDocs(q);
                setVideos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            } catch {
                try {
                    const snap = await getDocs(collection(db, 'videos'));
                    setVideos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
                } catch (e) {
                    console.error('Failed to load videos:', e);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchVideos();
    }, []);

    if (loading) return (
        <div className="h-screen bg-black flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
    );

    if (videos.length === 0) return (
        <div className="h-screen bg-black flex flex-col items-center justify-center text-white gap-4 px-6 text-center">
            <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
                <PlayIcon size={36} className="text-white ml-1" />
            </div>
            <h2 className="text-xl font-black">No Videos Yet</h2>
            <p className="text-white/60 text-sm max-w-xs">
                Sellers haven't uploaded any reels yet. Check back soon or ask your favourite shop to go live!
            </p>
        </div>
    );

    return (
        <div className="h-screen w-full overflow-y-scroll snap-y snap-mandatory bg-black"
             style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {videos.map((video, index) => (
                <VideoCard
                    key={video.id}
                    video={video}
                    user={user}
                    index={index}
                />
            ))}
        </div>
    );
}
