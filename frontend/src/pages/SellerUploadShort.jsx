import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db, storage } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Video, Upload, CheckCircle, AlertCircle, Info } from 'lucide-react';

const SellerUploadShort = () => {
    const { user } = useAuth();
    const navigate   = useNavigate();
    const [caption,   setCaption]   = useState('');
    const [file,      setFile]      = useState(null);
    const [preview,   setPreview]   = useState(null);
    const [progress,  setProgress]  = useState(0);
    const [uploading, setUploading] = useState(false);
    const [success,   setSuccess]   = useState(false);
    const [error,     setError]     = useState(null);
    const [statusMsg, setStatusMsg] = useState('');

    const handleFileChange = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        if (!f.type.startsWith('video/')) {
            setError('Please select a valid video file (mp4, mov, webm).');
            return;
        }
        if (f.size > 100 * 1024 * 1024) {
            setError('Video must be under 100 MB.');
            return;
        }
        setError(null);
        setFile(f);
        setPreview(URL.createObjectURL(f));
        console.log('[SellerUpload] File selected:', f.name, `(${(f.size / 1024 / 1024).toFixed(2)} MB)`);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file || !caption.trim()) {
            setError('Please add a caption and select a video.');
            return;
        }
        if (!user) {
            setError('You must be logged in as a seller to upload.');
            return;
        }

        setUploading(true);
        setError(null);
        setProgress(0);

        try {
            // ── STEP 1: Upload to Firebase Storage ──────────────────────────
            console.log('[SellerUpload] Upload started →', `videos/${user.uid}/`);
            setStatusMsg('Uploading video to storage…');

            const storageRef = ref(storage, `videos/${user.uid}/${Date.now()}_${file.name}`);
            const task = uploadBytesResumable(storageRef, file);

            await new Promise((resolve, reject) => {
                task.on(
                    'state_changed',
                    (snapshot) => {
                        const pct = Math.round(
                            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                        );
                        setProgress(pct);
                        console.log(`[SellerUpload] Progress: ${pct}%`);
                    },
                    (uploadError) => {
                        console.error('[SellerUpload] Storage upload failed:', uploadError.code, uploadError.message);
                        reject(uploadError);
                    },
                    resolve
                );
            });

            console.log('[SellerUpload] Upload success ✅ — getting download URL…');
            setStatusMsg('Getting download URL…');

            // ── STEP 2: Get download URL ──────────────────────────────────────
            const videoUrl = await getDownloadURL(task.snapshot.ref);
            console.log('[SellerUpload] Download URL obtained:', videoUrl);

            // ── STEP 3: Save to Firestore ────────────────────────────────────
            setStatusMsg('Saving to database…');
            const docRef = await addDoc(collection(db, 'videos'), {
                videoUrl,
                caption:       caption.trim(),
                userId:        user.uid,
                shopId:        user.uid,
                shopName:      user.displayName || user.email?.split('@')[0] || 'Seller',
                likesCount:    0,
                commentsCount: 0,
                createdAt:     serverTimestamp(),
            });

            console.log('[SellerUpload] Firestore saved ✅ — doc ID:', docRef.id);
            setStatusMsg('Published!');
            setSuccess(true);
            setCaption('');
            setFile(null);
            setPreview(null);
            setProgress(0);

            setTimeout(() => navigate('/play'), 2000);

        } catch (err) {
            console.error('[SellerUpload] Error:', err.code || '', err.message);

            // Provide helpful storage-rules hint
            const isPermission = err.code === 'storage/unauthorized' ||
                                 (err.message || '').includes('permission') ||
                                 (err.message || '').includes('unauthorized');
            if (isPermission) {
                setError(
                    'Permission denied. Firebase Storage rules must allow authenticated uploads. ' +
                    'Go to Firebase Console → Storage → Rules and publish the rules shown in the guide.'
                );
            } else {
                setError(err.message || 'Upload failed. Please try again.');
            }
            setStatusMsg('');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto py-8 px-4">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-black flex items-center gap-2 text-gray-900">
                    <Video className="text-indigo-500" /> Upload Reel
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                    Share short vertical videos to showcase your products to nearby buyers.
                </p>
            </div>

            {/* Firebase Rules Reminder */}
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3">
                <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                    <p className="text-xs font-black text-amber-800 mb-1">REQUIRED: Firebase Storage Rules</p>
                    <p className="text-xs text-amber-700 leading-relaxed">
                        Before uploading, make sure your Firebase Storage rules allow writes for authenticated users.
                        Go to <strong>Firebase Console → Storage → Rules</strong> and set:
                        <code className="block mt-1 bg-amber-100 rounded p-1 font-mono text-[10px] break-all">
                            allow write: if request.auth != null;
                        </code>
                    </p>
                </div>
            </div>

            {/* Success */}
            {success && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-700 font-bold text-sm">
                    <CheckCircle size={18} /> Video published! Redirecting to feed…
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-700 text-sm">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                {/* Caption */}
                <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                        Caption / Description *
                    </label>
                    <textarea
                        required
                        value={caption}
                        onChange={e => setCaption(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 outline-none transition resize-none"
                        placeholder="Tell viewers about this video or product…"
                        rows={3}
                    />
                </div>

                {/* File Picker */}
                <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                        Video File (mp4, mov — max 100 MB) *
                    </label>
                    <label
                        htmlFor="video-file-input"
                        className={`flex flex-col items-center justify-center w-full border-2 border-dashed rounded-2xl py-10 px-4 cursor-pointer transition-all ${
                            file
                                ? 'border-indigo-400 bg-indigo-50'
                                : 'border-gray-200 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50/50'
                        }`}
                    >
                        {file ? (
                            <>
                                <Video size={36} className="text-indigo-500 mb-2" />
                                <p className="font-bold text-gray-800 text-sm truncate max-w-full px-4 text-center">
                                    {file.name}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {(file.size / 1024 / 1024).toFixed(1)} MB — tap to change
                                </p>
                            </>
                        ) : (
                            <>
                                <Upload size={36} className="text-gray-300 mb-2" />
                                <p className="font-bold text-gray-500 text-sm">Tap to select a video</p>
                                <p className="text-xs text-gray-400 mt-1">mp4 · mov · webm supported</p>
                            </>
                        )}
                        <input
                            id="video-file-input"
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </label>
                </div>

                {/* Preview */}
                {preview && (
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                            Preview
                        </label>
                        <video
                            src={preview}
                            controls
                            className="w-full max-h-64 rounded-xl bg-black object-contain"
                        />
                    </div>
                )}

                {/* Upload Progress */}
                {uploading && (
                    <div>
                        <div className="flex justify-between text-xs font-bold text-gray-500 mb-1.5">
                            <span className="text-indigo-600">{statusMsg}</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2.5 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Submit */}
                <button
                    onClick={handleUpload}
                    disabled={uploading || success || !file || !caption.trim()}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-black rounded-xl px-4 py-3.5 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
                >
                    {uploading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Uploading ({progress}%)
                        </>
                    ) : success ? (
                        <><CheckCircle size={18} /> Published!</>
                    ) : (
                        <><Upload size={18} /> Publish Reel</>
                    )}
                </button>

                {/* User info debug */}
                {!user && (
                    <p className="text-center text-xs text-red-500 font-bold">
                        ⚠ Not logged in — please sign in as a seller first.
                    </p>
                )}
            </div>
        </div>
    );
};

export default SellerUploadShort;
