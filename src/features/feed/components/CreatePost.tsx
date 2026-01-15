import { useState, useRef } from 'react';
import { Send, Image as ImageIcon, Smile, X } from 'lucide-react';

interface CreatePostProps {
    onCreate: (content: string, imageFile: File | null) => Promise<void>;
}

export default function CreatePost({ onCreate }: CreatePostProps) {
    const [content, setContent] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isPosting, setIsPosting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageClick = () => fileInputRef.current?.click();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const maxSize = 10 * 1024 * 1024;
            if (file.size > maxSize) {
                alert('Image size must be less than 10MB.');
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }
            if (!file.type.startsWith('image/')) {
                alert('Please upload a valid image.');
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const clearImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() && !imageFile) return;

        setIsPosting(true);
        try {
            await onCreate(content, imageFile);
            setContent('');
            clearImage();
        } catch (error) {
            console.error(error);
            alert('Failed to create post');
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <div className="bg-white/70 backdrop-blur-md rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                    className="w-full bg-stone-50/50 rounded-2xl p-4 text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:bg-white transition-all resize-none text-lg font-medium"
                    placeholder="What's on your mind? #Hashtags"
                    rows={2}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />

                {imagePreview && (
                    <div className="relative inline-block mt-2">
                        <img src={imagePreview} alt="Preview" className="h-32 rounded-xl object-cover border border-stone-200" />
                        <button
                            type="button"
                            onClick={clearImage}
                            className="absolute -top-2 -right-2 bg-stone-900 text-white rounded-full p-1 shadow-md hover:bg-stone-700"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                <div className="flex justify-between items-center px-1">
                    <div className="flex gap-2">
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                        <button type="button" onClick={handleImageClick} className={`p-2 rounded-xl transition-all ${imageFile ? 'text-emerald-600 bg-emerald-50' : 'text-stone-400 hover:text-emerald-500 hover:bg-emerald-50'}`}>
                            <ImageIcon className="w-5 h-5" />
                        </button>
                        <button type="button" className="p-2 text-stone-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all">
                            <Smile className="w-5 h-5" />
                        </button>
                    </div>
                    <button
                        type="submit"
                        disabled={!content.trim() && !imageFile}
                        className="bg-stone-900 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-200 transition-all disabled:opacity-50 disabled:hover:shadow-none flex items-center gap-2"
                    >
                        <Send className="w-4 h-4" />
                        {isPosting ? 'Posting...' : 'Post'}
                    </button>
                </div>
                {isPosting && (
                    <div className="h-1 w-full bg-stone-100 mt-2 overflow-hidden rounded-full">
                        <div className="h-full bg-emerald-500 animate-[progress_1s_ease-in-out_infinite]" style={{ width: '100%' }}></div>
                    </div>
                )}
            </form>
        </div>
    );
}
