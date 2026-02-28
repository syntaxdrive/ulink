import { useState, useRef } from 'react';
import { Send, Image as ImageIcon, Smile, X, BarChart2, Plus, Minus, Video } from 'lucide-react';
import { compressImages, formatFileSize } from '../../../lib/mediaCompression';

interface CreatePostProps {
    onCreate: (content: string, imageFiles: File[], videoFile: File | null, communityId?: string, pollOptions?: string[]) => Promise<void>;
    communityId?: string;
    user?: any; // Just for types, usually passed down
    onPostCreated?: (post: any) => void;
}

export default function CreatePost({ onCreate, communityId, user }: CreatePostProps) {
    const MAX_CHARS = 1000;
    const [content, setContent] = useState('');
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [previews, setPreviews] = useState<string[]>([]);
    const [videoPreview, setVideoPreview] = useState<string | null>(null);
    const [isPosting, setIsPosting] = useState(false);
    const [showPoll, setShowPoll] = useState(false);
    const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
    const [isCompressing, setIsCompressing] = useState(false);


    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    const handleImageClick = () => fileInputRef.current?.click();


    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            // If we have a video, don't allow images and vice versa for MVP simplicity
            if (videoFile) {
                alert('You cannot attach images and video to the same post.');
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }

            const newFiles = Array.from(files);
            const totalFiles = imageFiles.length + newFiles.length;

            if (totalFiles > 4) {
                alert('You can only select up to 4 images.');
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }

            const validFiles: File[] = [];
            const newPreviews: string[] = [];

            // Validate files first
            for (const file of newFiles) {
                if (file.size > 10 * 1024 * 1024) {
                    alert(`Skipped ${file.name}: Image size must be less than 10MB.`);
                    continue;
                }
                if (!file.type.startsWith('image/')) {
                    alert(`Skipped ${file.name}: Not an image.`);
                    continue;
                }
                validFiles.push(file);
            }

            if (validFiles.length === 0) {
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }

            // Compress images
            try {
                setIsCompressing(true);
                const compressedBlobs = await compressImages(validFiles, {
                    maxWidth: 1920,
                    maxHeight: 1080,
                    quality: 0.85
                });

                // Convert blobs to files and create previews
                const compressedFiles: File[] = [];
                for (let i = 0; i < compressedBlobs.length; i++) {
                    const blob = compressedBlobs[i];
                    const originalFile = validFiles[i];
                    const compressedFile = new File(
                        [blob],
                        originalFile.name,
                        { type: 'image/jpeg' }
                    );
                    compressedFiles.push(compressedFile);
                    newPreviews.push(URL.createObjectURL(blob));

                    // Log compression ratio
                    const ratio = Math.round(((originalFile.size - blob.size) / originalFile.size) * 100);
                    console.log(`Compressed ${originalFile.name}: ${formatFileSize(originalFile.size)} → ${formatFileSize(blob.size)} (${ratio}% reduction)`);
                }

                setImageFiles(prev => [...prev, ...compressedFiles]);
                setPreviews(prev => [...prev, ...newPreviews]);
            } catch (error) {
                console.error('Error compressing images:', error);
                alert('Failed to compress images. Please try again.');
            } finally {
                setIsCompressing(false);
            }
        }
        // Reset input so same file can be selected again
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (imageFiles.length > 0) {
                alert('You cannot attach video and images to the same post.');
                if (videoInputRef.current) videoInputRef.current.value = '';
                return;
            }
            if (file.size > 50 * 1024 * 1024) { // 50MB Limit
                alert('Video size must be less than 50MB.');
                return;
            }
            if (!file.type.startsWith('video/')) {
                alert('Invalid file type. Please select a video.');
                return;
            }

            setVideoFile(file);
            setVideoPreview(URL.createObjectURL(file));
        }
        if (videoInputRef.current) videoInputRef.current.value = '';
    };

    const removeImage = (index: number) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const removeVideo = () => {
        setVideoFile(null);
        setVideoPreview(null);
        if (videoInputRef.current) videoInputRef.current.value = '';
    };

    const clearAllImages = () => {
        setImageFiles([]);
        setPreviews([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handlePollChange = (index: number, value: string) => {
        const newOptions = [...pollOptions];
        newOptions[index] = value;
        setPollOptions(newOptions);
    };

    const addPollOption = () => {
        if (pollOptions.length < 5) setPollOptions([...pollOptions, '']);
    };

    const removePollOption = (index: number) => {
        if (pollOptions.length > 2) {
            setPollOptions(pollOptions.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() && imageFiles.length === 0 && !videoFile && !showPoll) return;

        let finalPollOptions: string[] | undefined;
        if (showPoll) {
            finalPollOptions = pollOptions.filter(o => o.trim());
            if (finalPollOptions.length < 2) {
                alert('Poll must have at least 2 options.');
                return;
            }
        }

        setIsPosting(true);
        try {
            await onCreate(content, imageFiles, videoFile, communityId, finalPollOptions);
            setContent('');
            clearAllImages();
            removeVideo();
            setShowPoll(false);
            setPollOptions(['', '']);
        } catch (error) {
            console.error(error);
            alert('Failed to create post');
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-white/50 dark:border-zinc-800/50 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-4 items-start">
                    {user && (
                        <div className={`w-12 h-12 flex-shrink-0 bg-stone-100 dark:bg-zinc-800 overflow-hidden border-2 border-white dark:border-zinc-900 shadow-sm ${user.role === 'org' ? 'rounded-xl' : 'rounded-full'}`}>
                            <img
                                src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                                alt={user.name}
                                className={`w-full h-full ${user.role === 'org' ? 'object-contain p-1' : 'object-cover'}`}
                            />
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <textarea
                            className="w-full bg-stone-50/50 dark:bg-zinc-950/50 border border-transparent focus:border-emerald-500/30 rounded-2xl p-4 text-stone-700 dark:text-zinc-200 placeholder:text-stone-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/20 focus:bg-white dark:focus:bg-zinc-900 transition-all resize-none text-lg font-medium"
                            placeholder={user?.role === 'org' ? "Share an update with your contacts..." : "What's on your mind? #Hashtags"}
                            rows={4}
                            value={content}
                            onChange={(e) => {
                                if (e.target.value.length <= MAX_CHARS) {
                                    setContent(e.target.value);
                                }
                            }}
                        />
                        <div className="text-right text-xs text-stone-400 dark:text-zinc-600 mt-1 mr-2 font-medium">
                            {content.length}/{MAX_CHARS}
                        </div>
                    </div>
                </div>

                {/* Post prompt suggestions — below the textarea, full width */}
                {!content && (
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5 -mx-1 px-1">
                        {(user?.role === 'org'
                            ? [
                                { label: '📣 Share an announcement', text: 'Exciting news from us! ' },
                                { label: '💼 Post a job opening', text: "We're hiring! 🚀\n\nRole: \nLocation: \nHow to apply: " },
                                { label: '🤝 Partnership update', text: "We're thrilled to partner with " },
                                { label: '📊 Share a milestone', text: "We just hit " },
                            ]
                            : [
                                { label: '😂 Campus story', text: "This just happened on campus and I can't stop laughing 😂\n\n" },
                                { label: '📚 Need study help', text: "Does anyone have good resources for " },
                                { label: '🔥 Hot take', text: "Unpopular opinion: " },
                                { label: '💼 Share an opportunity', text: "PSA: " },
                                { label: '🎓 Advice for freshers', text: "Things I wish I knew before coming to uni:\n\n1. " },
                                { label: '😤 Campus rant', text: "Can someone explain why " },
                            ]
                        ).map((prompt) => (
                            <button
                                key={prompt.label}
                                type="button"
                                onClick={() => setContent(prompt.text)}
                                className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full bg-stone-100 dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-400 text-stone-500 dark:text-zinc-400 font-medium transition-all border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800 whitespace-nowrap"
                            >
                                {prompt.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Image Grid Preview */}
                {previews.length > 0 && (
                    <div className={`grid gap-2 ${previews.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                        {previews.map((src, index) => (
                            <div key={index} className="relative group">
                                <img
                                    src={src}
                                    alt={`Preview ${index}`}
                                    className={`w-full object-cover rounded-xl border border-stone-200 dark:border-zinc-800 ${previews.length === 1 ? 'max-h-80' : 'h-40'}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors backdrop-blur-sm opacity-0 group-hover:opacity-100"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Video Preview */}
                {videoPreview && (
                    <div className="relative group rounded-xl overflow-hidden bg-black/5">
                        <video src={videoPreview} className="w-full max-h-80 rounded-xl" controls />
                        <button
                            type="button"
                            onClick={removeVideo}
                            className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors backdrop-blur-sm opacity-0 group-hover:opacity-100"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                )}

                {/* Poll Creator */}
                {showPoll && (
                    <div className="space-y-2 p-3 bg-stone-50 dark:bg-zinc-950/50 rounded-xl border border-stone-200 dark:border-zinc-800 transition-colors">
                        {pollOptions.map((option, index) => (
                            <div key={index} className="flex gap-2">
                                <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => handlePollChange(index, e.target.value)}
                                    placeholder={`Option ${index + 1}`}
                                    className="flex-1 px-3 py-2 rounded-lg border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm"
                                />
                                {pollOptions.length > 2 && (
                                    <button
                                        type="button"
                                        onClick={() => removePollOption(index)}
                                        className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                        {pollOptions.length < 5 && (
                            <button
                                type="button"
                                onClick={addPollOption}
                                className="text-sm text-emerald-600 font-medium hover:underline flex items-center gap-1 pl-1"
                            >
                                <Plus className="w-3 h-3" /> Add Option
                            </button>
                        )}
                    </div>
                )}

                <div className="flex justify-between items-center px-1">
                    <div className="flex gap-2">
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            multiple
                            onChange={handleFileChange}
                        />
                        <input
                            type="file"
                            ref={videoInputRef}
                            className="hidden"
                            accept="video/*"
                            onChange={handleVideoChange}
                        />
                        <button
                            type="button"
                            onClick={handleImageClick}
                            disabled={!!videoFile || isCompressing}
                            className={`p-2 rounded-xl transition-all ${imageFiles.length > 0 ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30' : 'text-stone-400 dark:text-zinc-600 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-zinc-800 disabled:opacity-30'}`}
                            title="Add Images"
                        >
                            <ImageIcon className="w-5 h-5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => videoInputRef.current?.click()}
                            disabled={imageFiles.length > 0 || isCompressing}
                            className={`p-2 rounded-xl transition-all ${videoFile ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30' : 'text-stone-400 dark:text-zinc-600 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-zinc-800 disabled:opacity-30'}`}
                            title="Add Video"
                        >
                            <Video className="w-5 h-5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowPoll(!showPoll)}
                            disabled={isCompressing}
                            className={`p-2 rounded-xl transition-all ${showPoll ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30' : 'text-stone-400 dark:text-zinc-600 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-zinc-800'}`}
                            title="Create Poll"
                        >
                            <BarChart2 className="w-5 h-5" />
                        </button>
                        <button type="button" className="p-2 text-stone-400 dark:text-zinc-600 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-zinc-800 rounded-xl transition-all">
                            <Smile className="w-5 h-5" />
                        </button>
                        {isCompressing && (
                            <span className="text-xs text-emerald-600 font-medium animate-pulse">
                                Compressing...
                            </span>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={(!content.trim() && imageFiles.length === 0 && !videoFile && !showPoll) || isPosting}
                        className="bg-stone-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-emerald-600 dark:hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-200 dark:hover:shadow-none transition-all disabled:opacity-50 disabled:hover:shadow-none flex items-center gap-2"
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
