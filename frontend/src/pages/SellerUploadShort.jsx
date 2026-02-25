import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Video, Upload } from 'lucide-react';

const SellerUploadShort = () => {
    const [title, setTitle] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [thumbnail, setThumbnail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleUpload = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await api.post('/shorts/upload', {
                title,
                videoUrl,
                thumbnail
            });
            navigate('/play'); // Redirect to shorts feed on success
        } catch (err) {
            setError(err.response?.data?.msg || "Failed to upload short");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
                    <Video className="text-brand-primary" /> Upload Short Video
                </h1>
                <p className="text-gray-500 text-sm mt-1">Engage your audience with immersive 9:16 vertical videos.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6">{error}</div>}

                <form onSubmit={handleUpload} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Video Title/Caption</label>
                        <textarea
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition"
                            placeholder="Describe your product or video..."
                            rows="2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Video URL (mp4)</label>
                        <input
                            type="url"
                            required
                            value={videoUrl}
                            onChange={(e) => setVideoUrl(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition"
                            placeholder="https://example.com/video.mp4"
                        />
                        <p className="text-xs text-gray-400 mt-2">In a production environment, this would be an S3/Cloudinary direct file upload instead of string input.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail URL (Optional)</label>
                        <input
                            type="url"
                            value={thumbnail}
                            onChange={(e) => setThumbnail(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition"
                            placeholder="https://example.com/thumbnail.png"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-primary text-white font-bold rounded-xl px-4 py-3.5 flex items-center justify-center gap-2 hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><Upload size={20} /> Publish Short</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SellerUploadShort;
