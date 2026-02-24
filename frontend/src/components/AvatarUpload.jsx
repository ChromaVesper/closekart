import React, { useRef, useState } from 'react';
import { Camera, Loader } from 'lucide-react';

const AvatarUpload = ({ currentAvatar, onUpload }) => {
    const fileRef = useRef(null);
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const token = localStorage.getItem('token');
            const API = import.meta.env.VITE_API_URL || 'https://closekart.onrender.com/api';
            const res = await fetch(`${API}/upload/avatar`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                if (onUpload) onUpload(data.avatar);
            }
        } catch (err) {
            console.error('Upload error:', err);
        }
        setUploading(false);
    };

    return (
        <div className="relative inline-block">
            <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                {currentAvatar ? (
                    <img src={currentAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">?</div>
                )}
            </div>
            <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md hover:bg-blue-700 transition border-2 border-white"
            >
                {uploading ? <Loader size={14} className="animate-spin" /> : <Camera size={14} />}
            </button>
            <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
            />
        </div>
    );
};

export default AvatarUpload;
