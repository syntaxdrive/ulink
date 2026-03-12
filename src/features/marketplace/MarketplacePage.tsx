import { useState, useEffect, useCallback, useRef } from 'react';
import {
    ShoppingBag,
    Search,
    Plus,
    X,
    MessageCircle,
    CheckCircle2,
    Upload,
    Tag,
    Loader2,
    PackageOpen,
    AlertCircle,
    ChevronDown,
    Copy,
    Check,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { cloudinaryService } from '../../services/cloudinaryService';
import Modal from '../../components/ui/Modal';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MarketplaceListing {
    id: string;
    seller_id: string;
    title: string;
    description: string | null;
    price: number;
    category: string;
    condition: string;
    images: string[];
    is_sold: boolean;
    contact_info: string | null;
    university: string | null;
    created_at: string;
    profiles?: {
        name: string;
        avatar_url: string | null;
        username: string | null;
        university: string | null;
    };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = ['All', 'Textbooks', 'Electronics', 'Clothing', 'Food', 'Services', 'Housing', 'Other'] as const;
type Category = typeof CATEGORIES[number];

const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'] as const;
type Condition = typeof CONDITIONS[number];

const CATEGORY_COLORS: Record<string, string> = {
    Textbooks:   'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    Electronics: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    Clothing:    'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
    Food:        'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    Services:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    Housing:     'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    Other:       'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
};

const CONDITION_COLORS: Record<string, string> = {
    New:        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    'Like New': 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
    Good:       'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    Fair:       'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300',
};

const CATEGORY_GRADIENTS: Record<string, string> = {
    Textbooks:   'from-blue-400 to-blue-600',
    Electronics: 'from-purple-400 to-purple-600',
    Clothing:    'from-pink-400 to-pink-600',
    Food:        'from-orange-400 to-orange-600',
    Services:    'from-emerald-400 to-emerald-600',
    Housing:     'from-amber-400 to-amber-600',
    Other:       'from-slate-400 to-slate-600',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTimeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins  = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days  = Math.floor(diff / 86_400_000);
    if (mins  < 1)  return 'Just now';
    if (mins  < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days  < 7)  return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
}

function formatPrice(price: number): string {
    return new Intl.NumberFormat('en-NG', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
}

/** Strip leading 0 from Nigerian number for wa.me links */
function buildWhatsAppUrl(contactInfo: string): string {
    const cleaned = contactInfo.replace(/\D/g, '');
    // If starts with 0, replace with country code 234
    const national = cleaned.startsWith('0') ? '234' + cleaned.slice(1) : cleaned;
    return `https://wa.me/${national}`;
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .map(w => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SkeletonCard() {
    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 animate-pulse">
            <div className="aspect-square bg-zinc-200 dark:bg-zinc-800" />
            <div className="p-3 space-y-2">
                <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded-full w-1/3" />
                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-full w-4/5" />
                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-full w-3/5" />
                <div className="flex items-center gap-2 pt-1">
                    <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                    <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded-full w-2/5" />
                </div>
            </div>
        </div>
    );
}

interface ListingCardProps {
    listing: MarketplaceListing;
    currentUserId: string | null;
    onMarkSold: (id: string) => void;
    markingSold: string | null;
}

function ListingCard({ listing, currentUserId, onMarkSold, markingSold }: ListingCardProps) {
    const [copied, setCopied] = useState(false);
    const isOwner = currentUserId === listing.seller_id;
    const imageUrl = listing.images?.[0] ?? null;
    const gradient = CATEGORY_GRADIENTS[listing.category] ?? CATEGORY_GRADIENTS.Other;
    const seller = listing.profiles;

    const handleContact = () => {
        if (!listing.contact_info) return;
        window.open(buildWhatsAppUrl(listing.contact_info), '_blank', 'noopener,noreferrer');
    };

    const handleCopyContact = async () => {
        if (!listing.contact_info) return;
        try {
            await navigator.clipboard.writeText(listing.contact_info);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback
        }
    };

    return (
        <div className="group bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-zinc-200 dark:hover:border-zinc-700 transition-all duration-200 flex flex-col">
            {/* Image */}
            <div className="relative aspect-square overflow-hidden flex-shrink-0">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                            const target = e.currentTarget;
                            target.onerror = null;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                                const fallback = document.createElement('div');
                                fallback.className = `w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`;
                                fallback.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" /></svg>`;
                                parent.appendChild(fallback);
                            }
                        }}
                    />
                ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                        <ShoppingBag className="w-10 h-10 text-white/70" />
                    </div>
                )}

                {/* Price badge */}
                <div className="absolute top-2 left-2 bg-zinc-900/80 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-lg">
                    ₦{formatPrice(listing.price)}
                </div>

                {/* Sold overlay */}
                {listing.is_sold && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-1">
                        <CheckCircle2 className="w-8 h-8 text-white" />
                        <span className="text-white font-bold text-sm tracking-wide uppercase">Sold</span>
                    </div>
                )}
            </div>

            {/* Body */}
            <div className="p-3 flex flex-col gap-2 flex-1">
                {/* Category + Condition */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[listing.category] ?? CATEGORY_COLORS.Other}`}>
                        {listing.category}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${CONDITION_COLORS[listing.condition] ?? ''}`}>
                        {listing.condition}
                    </span>
                </div>

                {/* Title */}
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug">
                    {listing.title}
                </h3>

                {/* Seller row */}
                <div className="flex items-center gap-1.5 mt-auto pt-1">
                    {seller?.avatar_url ? (
                        <img
                            src={seller.avatar_url}
                            alt={seller.name}
                            className="w-5 h-5 rounded-full object-cover flex-shrink-0"
                        />
                    ) : (
                        <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                            <span className="text-[8px] font-bold text-emerald-700 dark:text-emerald-400">
                                {seller ? getInitials(seller.name) : '?'}
                            </span>
                        </div>
                    )}
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                        {seller?.name ?? 'Unknown'} &middot; {formatTimeAgo(listing.created_at)}
                    </span>
                </div>

                {/* Actions */}
                {!listing.is_sold && (
                    <div className="flex gap-1.5 pt-1">
                        {listing.contact_info && (
                            <>
                                <button
                                    onClick={handleContact}
                                    className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors"
                                    title="Contact via WhatsApp"
                                >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">WhatsApp</span>
                                    <span className="sm:hidden">Chat</span>
                                </button>
                                <button
                                    onClick={handleCopyContact}
                                    className="p-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-xl transition-colors"
                                    title="Copy contact number"
                                >
                                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                            </>
                        )}

                        {isOwner && (
                            <button
                                onClick={() => onMarkSold(listing.id)}
                                disabled={markingSold === listing.id}
                                className={`${listing.contact_info ? '' : 'flex-1'} flex items-center justify-center gap-1 py-1.5 px-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold rounded-xl transition-colors`}
                                title="Mark as sold"
                            >
                                {markingSold === listing.id
                                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    : <CheckCircle2 className="w-3.5 h-3.5" />
                                }
                                <span>Sold</span>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Create Listing Modal Content ─────────────────────────────────────────────

interface CreateListingFormProps {
    onClose: () => void;
    onCreated: (listing: MarketplaceListing) => void;
    currentUserId: string;
    userUniversity: string | null;
}

function CreateListingForm({ onClose: _onClose, onCreated, currentUserId, userUniversity }: CreateListingFormProps) {
    const [title, setTitle]             = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice]             = useState('');
    const [category, setCategory]       = useState<string>('Textbooks');
    const [condition, setCondition]     = useState<Condition>('Good');
    const [contactInfo, setContactInfo] = useState('');
    const [imageFile, setImageFile]     = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploading, setUploading]     = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError]             = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file.');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setError('Image must be under 10MB.');
            return;
        }
        setImageFile(file);
        setError(null);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const priceNum = parseFloat(price);
        if (!title.trim()) { setError('Please enter a title.'); return; }
        if (isNaN(priceNum) || priceNum < 0) { setError('Please enter a valid price.'); return; }

        setUploading(true);
        setUploadProgress(0);

        try {
            // First, insert the listing to get an ID
            const { data: inserted, error: insertErr } = await supabase
                .from('marketplace_listings')
                .insert({
                    seller_id:    currentUserId,
                    title:        title.trim(),
                    description:  description.trim() || null,
                    price:        priceNum,
                    category,
                    condition,
                    images:       [],
                    contact_info: contactInfo.trim() || null,
                    university:   userUniversity,
                    is_sold:      false,
                })
                .select('*, profiles:seller_id(name, avatar_url, username, university)')
                .single();

            if (insertErr || !inserted) {
                throw new Error(insertErr?.message ?? 'Failed to create listing.');
            }

            let imageUrl: string | null = null;

            if (imageFile) {
                try {
                    // Try Cloudinary first
                    if (cloudinaryService.isConfigured()) {
                        const result = await cloudinaryService.uploadImage(imageFile, {
                            folder: 'ulink/marketplace',
                            onProgress: (p) => setUploadProgress(p),
                        });
                        imageUrl = result.secureUrl;
                    } else {
                        // Supabase Storage fallback
                        setUploadProgress(30);
                        const ext      = imageFile.name.split('.').pop() ?? 'jpg';
                        const filename = `${Date.now()}.${ext}`;
                        const path     = `marketplace/${inserted.id}/${filename}`;

                        const { error: storageErr } = await supabase.storage
                            .from('uploads')
                            .upload(path, imageFile, { upsert: true });

                        if (!storageErr) {
                            const { data: urlData } = supabase.storage
                                .from('uploads')
                                .getPublicUrl(path);
                            imageUrl = urlData.publicUrl;
                        }
                        setUploadProgress(90);
                    }
                } catch (uploadErr) {
                    console.warn('[Marketplace] Image upload failed, continuing without image:', uploadErr);
                }

                // Update listing with image URL
                if (imageUrl) {
                    await supabase
                        .from('marketplace_listings')
                        .update({ images: [imageUrl] })
                        .eq('id', inserted.id);
                }
            }

            setUploadProgress(100);

            const finalListing: MarketplaceListing = {
                ...inserted,
                images: imageUrl ? [imageUrl] : [],
            };

            onCreated(finalListing);
        } catch (err: any) {
            setError(err.message ?? 'Something went wrong. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
            {error && (
                <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 py-2.5 rounded-xl text-sm border border-red-100 dark:border-red-800/40">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Image upload */}
            <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Photo <span className="text-zinc-400 font-normal">(optional)</span>
                </label>
                {imagePreview ? (
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <button
                            type="button"
                            onClick={removeImage}
                            className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full aspect-video rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex flex-col items-center justify-center gap-2 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all text-zinc-500 dark:text-zinc-400"
                    >
                        <Upload className="w-7 h-7" />
                        <span className="text-sm font-medium">Tap to upload photo</span>
                        <span className="text-xs text-zinc-400">JPG, PNG, WEBP &mdash; max 10MB</span>
                    </button>
                )}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>

            {/* Title */}
            <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Title <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    required
                    maxLength={100}
                    placeholder="e.g. Engineering Maths Textbook"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                />
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Description <span className="text-zinc-400 font-normal">(optional)</span>
                </label>
                <textarea
                    rows={3}
                    maxLength={500}
                    placeholder="Add details about the item..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all resize-none"
                />
            </div>

            {/* Price */}
            <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Price (NGN) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 font-semibold text-sm pointer-events-none">₦</span>
                    <input
                        type="number"
                        required
                        min={0}
                        step={50}
                        placeholder="0"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-8 pr-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                    />
                </div>
            </div>

            {/* Category + Condition (side by side) */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Category</label>
                    <div className="relative">
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full appearance-none bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 pr-9 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                        >
                            {CATEGORIES.filter(c => c !== 'All').map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Condition</label>
                    <div className="relative">
                        <select
                            value={condition}
                            onChange={(e) => setCondition(e.target.value as Condition)}
                            className="w-full appearance-none bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 pr-9 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                        >
                            {CONDITIONS.map(cond => (
                                <option key={cond} value={cond}>{cond}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Contact (WhatsApp) */}
            <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    WhatsApp Number <span className="text-zinc-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                    <MessageCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                    <input
                        type="tel"
                        maxLength={15}
                        placeholder="e.g. 08012345678"
                        value={contactInfo}
                        onChange={(e) => setContactInfo(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                    />
                </div>
                <p className="text-xs text-zinc-400 mt-1">Buyers will use this to contact you on WhatsApp.</p>
            </div>

            {/* Upload progress bar */}
            {uploading && uploadProgress > 0 && uploadProgress < 100 && (
                <div className="space-y-1">
                    <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
                        <span>Uploading image...</span>
                        <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <div className="h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Submit */}
            <button
                type="submit"
                disabled={uploading}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-colors flex items-center justify-center gap-2"
            >
                {uploading
                    ? <><Loader2 className="w-5 h-5 animate-spin" /> Publishing...</>
                    : <><Tag className="w-5 h-5" /> List Item</>
                }
            </button>
        </form>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MarketplacePage() {
    const [listings, setListings]           = useState<MarketplaceListing[]>([]);
    const [loading, setLoading]             = useState(true);
    const [searchQuery, setSearchQuery]     = useState('');
    const [activeCategory, setActiveCategory] = useState<Category>('All');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [userUniversity, setUserUniversity] = useState<string | null>(null);
    const [markingSold, setMarkingSold]     = useState<string | null>(null);
    const [fetchError, setFetchError]       = useState<string | null>(null);

    // ── Load current user ─────────────────────────────────────────────────────
    useEffect(() => {
        supabase.auth.getUser().then(async ({ data }) => {
            const uid = data.user?.id ?? null;
            setCurrentUserId(uid);
            if (uid) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('university')
                    .eq('id', uid)
                    .single();
                setUserUniversity(profile?.university ?? null);
            }
        });
    }, []);

    // ── Fetch listings ────────────────────────────────────────────────────────
    const fetchListings = useCallback(async () => {
        setLoading(true);
        setFetchError(null);
        try {
            const { data, error } = await supabase
                .from('marketplace_listings')
                .select('*, profiles:seller_id(name, avatar_url, username, university)')
                .eq('is_sold', false)
                .order('created_at', { ascending: false })
                .limit(120);

            if (error) throw error;
            setListings((data ?? []) as MarketplaceListing[]);
        } catch (err: any) {
            console.error('[Marketplace] fetch error:', err);
            setFetchError('Could not load listings. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchListings();
    }, [fetchListings]);

    // ── Real-time subscription ────────────────────────────────────────────────
    useEffect(() => {
        const channel = supabase
            .channel('marketplace_listings_changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'marketplace_listings' },
                () => { fetchListings(); }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [fetchListings]);

    // ── Mark as sold ─────────────────────────────────────────────────────────
    const handleMarkSold = async (id: string) => {
        if (!currentUserId) return;
        if (!confirm('Mark this item as sold? It will be removed from the feed.')) return;

        setMarkingSold(id);
        try {
            const { error } = await supabase
                .from('marketplace_listings')
                .update({ is_sold: true })
                .eq('id', id)
                .eq('seller_id', currentUserId);

            if (error) throw error;

            // Optimistic: remove from list (since we only show unsold)
            setListings(prev => prev.filter(l => l.id !== id));
        } catch (err: any) {
            console.error('[Marketplace] mark sold error:', err);
            alert('Could not mark item as sold. Please try again.');
        } finally {
            setMarkingSold(null);
        }
    };

    // ── On listing created ────────────────────────────────────────────────────
    const handleListingCreated = (newListing: MarketplaceListing) => {
        setListings(prev => [newListing, ...prev]);
        setShowCreateModal(false);
    };

    // ── Filtered listings ─────────────────────────────────────────────────────
    const filteredListings = listings.filter(l => {
        const matchesCategory = activeCategory === 'All' || l.category === activeCategory;
        const q = searchQuery.toLowerCase();
        const matchesSearch = !q
            || l.title.toLowerCase().includes(q)
            || (l.description ?? '').toLowerCase().includes(q)
            || l.category.toLowerCase().includes(q)
            || (l.profiles?.name ?? '').toLowerCase().includes(q);
        return matchesCategory && matchesSearch;
    });

    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="max-w-7xl mx-auto pb-28 px-3 sm:px-4">

            {/* ── Header ── */}
            <div className="sticky top-0 z-30 bg-zinc-50/90 dark:bg-zinc-950/90 backdrop-blur-xl pt-3 pb-3 -mx-3 sm:-mx-4 px-3 sm:px-4 border-b border-zinc-100 dark:border-zinc-800/60 mb-4">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 bg-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                            <ShoppingBag className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                                Campus Market
                            </h1>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">
                                Buy &amp; sell within your campus community
                            </p>
                        </div>
                    </div>

                    {currentUserId ? (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-2xl transition-colors shadow-sm shadow-emerald-200 dark:shadow-none flex-shrink-0"
                        >
                            <Plus className="w-4 h-4" />
                            <span>List Item</span>
                        </button>
                    ) : (
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 text-right hidden sm:block">
                            Sign in to list items
                        </div>
                    )}
                </div>

                {/* Search bar */}
                <div className="relative mt-3">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search listings..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/60 transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                        >
                            <X className="w-4 h-4 text-zinc-400" />
                        </button>
                    )}
                </div>

                {/* Category chips */}
                <div className="flex gap-2 mt-2.5 overflow-x-auto no-scrollbar pb-0.5">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`whitespace-nowrap px-3.5 py-1.5 rounded-2xl text-xs font-semibold transition-all border flex-shrink-0 ${
                                activeCategory === cat
                                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-sm'
                                    : 'bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Result count ── */}
            {!loading && !fetchError && (
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-3">
                    {filteredListings.length === 0
                        ? 'No listings found'
                        : `${filteredListings.length} listing${filteredListings.length === 1 ? '' : 's'}`}
                    {activeCategory !== 'All' && ` in ${activeCategory}`}
                    {searchQuery && ` matching "${searchQuery}"`}
                </p>
            )}

            {/* ── Error state ── */}
            {fetchError && !loading && (
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                    <div className="w-14 h-14 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center">
                        <AlertCircle className="w-7 h-7 text-red-500" />
                    </div>
                    <div>
                        <p className="font-semibold text-zinc-700 dark:text-zinc-300">{fetchError}</p>
                        <button
                            onClick={fetchListings}
                            className="mt-2 text-sm text-emerald-600 hover:underline"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            )}

            {/* ── Loading skeletons ── */}
            {loading && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
            )}

            {/* ── Empty state ── */}
            {!loading && !fetchError && filteredListings.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 gap-4 text-center px-6">
                    <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl flex items-center justify-center">
                        <PackageOpen className="w-10 h-10 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-zinc-800 dark:text-zinc-200 text-lg">
                            {searchQuery || activeCategory !== 'All'
                                ? 'No listings match your search'
                                : 'No listings yet'}
                        </h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs">
                            {searchQuery || activeCategory !== 'All'
                                ? 'Try a different search term or category.'
                                : 'Be the first to list something for sale on your campus!'}
                        </p>
                    </div>
                    {currentUserId && !searchQuery && activeCategory === 'All' && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-2xl transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            List an Item
                        </button>
                    )}
                    {!currentUserId && (
                        <p className="text-xs text-zinc-400 italic">Sign in to list items for sale</p>
                    )}
                </div>
            )}

            {/* ── Listings grid ── */}
            {!loading && !fetchError && filteredListings.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {filteredListings.map(listing => (
                        <ListingCard
                            key={listing.id}
                            listing={listing}
                            currentUserId={currentUserId}
                            onMarkSold={handleMarkSold}
                            markingSold={markingSold}
                        />
                    ))}
                </div>
            )}

            {/* ── Mobile FAB (when not authenticated, hidden) ── */}
            {currentUserId && (
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="md:hidden fixed bottom-24 right-4 w-14 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-xl shadow-emerald-200 dark:shadow-none flex items-center justify-center z-40 transition-all active:scale-95"
                    aria-label="List a new item"
                >
                    <Plus className="w-7 h-7" />
                </button>
            )}

            {/* ── Create listing modal ── */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="List an Item"
                size="md"
                footer={null}
            >
                {currentUserId ? (
                    <CreateListingForm
                        onClose={() => setShowCreateModal(false)}
                        onCreated={handleListingCreated}
                        currentUserId={currentUserId}
                        userUniversity={userUniversity}
                    />
                ) : (
                    <div className="p-8 text-center">
                        <p className="text-zinc-600 dark:text-zinc-400">Please sign in to list items.</p>
                    </div>
                )}
            </Modal>
        </div>
    );
}
