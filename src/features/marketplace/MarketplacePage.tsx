import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
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
    Trash2,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Clock,
    Share2,
    Store,
    Pencil,
    LayoutGrid,
    Trophy,
    ArrowLeft,
    RotateCcw,
    Camera
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { cloudinaryService, getOptimizedMediaUrl } from '../../services/cloudinaryService';
import { nativeShare } from '../../utils/shareUtils';
import { getBaseUrl } from '../../config';
import Modal from '../../components/ui/Modal';
import { useMarketplaceStore } from '../../stores/useMarketplaceStore';
import type { MarketplaceListing } from '../../types';

// ─── Types ────────────────────────────────────────────────────────────────────

// MarketplaceListing interface is now imported from types

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
    onDelete: (id: string) => void;
    onClick: (listing: MarketplaceListing) => void;
}

function ListingCard({ listing, currentUserId, onDelete, onClick }: ListingCardProps) {
    const isOwner = currentUserId === listing.seller_id;
    const imageUrl = getOptimizedMediaUrl(listing.images?.[0] ?? null);
    const gradient = CATEGORY_GRADIENTS[listing.category] ?? CATEGORY_GRADIENTS.Other;
    const seller = listing.profiles;
    const storeDisplayName = seller?.store_name || seller?.name || 'Unknown Seller';

    return (
        <div
            onClick={() => onClick(listing)}
            className="group bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-zinc-200 dark:hover:border-zinc-700 transition-all duration-200 flex flex-col cursor-pointer"
        >
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

                {/* Owner delete badge */}
                {isOwner && !listing.is_sold && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(listing.id); }}
                        className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-red-500/80 backdrop-blur-sm hover:bg-red-600 text-white rounded-lg transition-colors"
                        title="Delete listing"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                )}

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
                {listing.category === 'Food' ? (
                    <div className="flex items-center gap-1.5 mt-1">
                        <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase tracking-tighter bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded-md">
                            <ShoppingBag className="w-2.5 h-2.5" />
                            Menu Available
                        </div>
                    </div>
                ) : null}

                {/* Seller row */}
                <div className="flex items-center gap-1.5 mt-auto pt-1">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                        {seller?.avatar_url ? (
                            <img
                                src={getOptimizedMediaUrl(seller.avatar_url)}
                                alt={seller.name}
                                className="w-full h-full object-cover rounded-full"
                            />
                        ) : (
                            <span className="text-[8px] font-bold text-emerald-700 dark:text-emerald-400">
                                {seller ? getInitials(seller.name) : '?'}
                            </span>
                        )}
                    </div>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                        {storeDisplayName} &middot; {formatTimeAgo(listing.created_at)}
                    </span>
                </div>
            </div>
        </div>
    );
}

// ─── Listing Detail Modal ─────────────────────────────────────────────────────

interface ListingDetailProps {
    listing: MarketplaceListing;
    currentUserId: string | null;
    onClose: () => void;
    onMarkSold: (id: string) => void;
    onDelete: (id: string) => void;
    onEdit: () => void;
    onVisitStore: (sellerId: string, sellerName: string) => void;
    markingSold: string | null;
}

function ListingDetail({ listing, currentUserId, onClose, onMarkSold, onDelete, onEdit, onVisitStore, markingSold }: ListingDetailProps) {
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);
    const [imgIndex, setImgIndex] = useState(0);
    const [foodQuantities, setFoodQuantities] = useState<Record<string, number>>({});
    const isOwner = currentUserId === listing.seller_id;
    const seller = listing.profiles;
    const images = listing.images?.length ? listing.images : [];
    const gradient = CATEGORY_GRADIENTS[listing.category] ?? CATEGORY_GRADIENTS.Other;

    // Parse food data if present
    let foodData: { options: FoodOption[], description: string } | null = null;
    if (listing.category === 'Food' && listing.description?.startsWith('FOOD_DATA:')) {
        try {
            const jsonStr = listing.description.split('FOOD_DATA:')[1];
            foodData = JSON.parse(jsonStr);
        } catch { /* skip */ }
    }

    const totalFoodPrice = foodData?.options.reduce((sum, opt) => {
        return sum + (opt.price * (foodQuantities[opt.name] || 0));
    }, 0) || 0;

    const handleContact = () => {
        let summary = '';
        if (foodData && totalFoodPrice > 0) {
            const items = foodData.options
                .filter(o => (foodQuantities[o.name] || 0) > 0)
                .map(o => `• ${foodQuantities[o.name]}x ${o.name} (₦${formatPrice(o.price * foodQuantities[o.name])})`);
            
            summary = `🛒 [ORDER SUMMARY]\nItem: ${listing.title}\n\n${items.join('\n')}\n\nTotal: ₦${formatPrice(totalFoodPrice)}\n\nHi! I'd like to place this order. Is it available for delivery/pickup?`;
        } else {
            summary = `🛒 [MARKET INQUIRY]\nItem: ${listing.title}\nPrice: ₦${formatPrice(listing.price)}\nCondition: ${listing.condition}\n\nHi! I'm interested in this listing. Is it still available?`;
        }

        onClose();
        const refLink = `\n\n[Ref: ${listing.id}]`;
        navigate(`/app/messages?chat=${listing.seller_id}&text=${encodeURIComponent(summary + refLink)}`);
    };

    const handleCopyContact = async () => {
        if (!listing.contact_info) return;
        try {
            await navigator.clipboard.writeText(listing.contact_info);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch { /* */ }
    };

    const handleShare = async () => {
        const url = `${getBaseUrl()}/app/marketplace`;
        const title = `${listing.title} - ₦${formatPrice(listing.price)}`;
        const text = `Check out "${listing.title}" on UniLink Campus Market!\n₦${formatPrice(listing.price)} · ${listing.condition}`;
        const imageUrl = images[0] || undefined;
        const shared = await nativeShare(title, text, url, imageUrl);
        if (!shared) {
            await navigator.clipboard.writeText(url);
            alert('Link copied!');
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white dark:bg-zinc-900 w-full sm:max-w-lg sm:rounded-2xl rounded-t-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-8 fade-in duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Image carousel */}
                <div className="relative aspect-[4/3] bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    {images.length > 0 ? (
                        <>
                            <img
                                src={images[imgIndex]}
                                alt={listing.title}
                                className="w-full h-full object-cover"
                            />
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setImgIndex((imgIndex - 1 + images.length) % images.length)}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setImgIndex((imgIndex + 1) % images.length)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                                        {images.map((_, i) => (
                                            <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === imgIndex ? 'bg-white w-4' : 'bg-white/50'}`} />
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                            <ShoppingBag className="w-16 h-16 text-white/60" />
                        </div>
                    )}

                    {/* Close */}
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    {/* Price badge */}
                    <div className="absolute bottom-3 left-3 bg-zinc-900/80 backdrop-blur-sm text-white font-bold px-3 py-1.5 rounded-xl text-lg">
                        ₦{formatPrice(listing.price)}
                    </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                    {/* Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CATEGORY_COLORS[listing.category] ?? CATEGORY_COLORS.Other}`}>
                            {listing.category}
                        </span>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CONDITION_COLORS[listing.condition] ?? ''}`}>
                            {listing.condition}
                        </span>
                        {listing.is_sold && (
                            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Sold</span>
                        )}
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 leading-snug">{listing.title}</h2>

                    {/* Description / Food Order Builder */}
                    {foodData ? (
                        <div className="space-y-4">
                            {foodData.description && (
                                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed italic border-l-2 border-emerald-500 pl-3">
                                    {foodData.description}
                                </p>
                            )}
                            
                            <div className="bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800">
                                <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <ShoppingBag className="w-3.5 h-3.5 text-emerald-500" />
                                    Explore the Menu
                                </h4>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {foodData.options.map((opt, i) => (
                                        <div key={i} className="flex flex-col gap-2 p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-sm hover:shadow-md transition-all group overflow-hidden">
                                            {opt.image_url && (
                                                <div className="aspect-video w-full rounded-xl overflow-hidden mb-1 relative">
                                                    <img src={opt.image_url} alt={opt.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                                </div>
                                            )}
                                            <div className="flex justify-between items-start gap-2">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 truncate">{opt.name}</p>
                                                    <p className="text-xs font-black text-emerald-600">₦{formatPrice(opt.price)}</p>
                                                </div>
                                                <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg p-1">
                                                    <button
                                                        onClick={() => setFoodQuantities(prev => ({ ...prev, [opt.name]: Math.max(0, (prev[opt.name] || 0) - 1) }))}
                                                        className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-emerald-500 rounded-md transition-colors"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="w-4 text-center text-[10px] font-black text-zinc-700 dark:text-zinc-300">
                                                        {foodQuantities[opt.name] || 0}
                                                    </span>
                                                    <button
                                                        onClick={() => setFoodQuantities(prev => ({ ...prev, [opt.name]: (prev[opt.name] || 0) + 1 }))}
                                                        className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-emerald-500 rounded-md transition-colors"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {totalFoodPrice > 0 && (
                                    <div className="mt-6 p-4 bg-emerald-600 text-white rounded-2xl flex justify-between items-center animate-in zoom-in-95 duration-300 shadow-lg shadow-emerald-500/20">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Order Summary</p>
                                            <p className="text-lg font-black leading-none">₦{formatPrice(totalFoodPrice)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold opacity-80">
                                                {Object.values(foodQuantities).reduce((a, b) => a + b, 0)} items selected
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : listing.description && (
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">{listing.description}</p>
                    )}

                    {/* Meta info */}
                    <div className="flex items-center gap-4 text-xs text-zinc-400 dark:text-zinc-500">
                        <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {formatTimeAgo(listing.created_at)}
                        </span>
                        {listing.university && (
                            <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {listing.university}
                            </span>
                        )}
                    </div>

                    {/* Seller */}
                    <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                            {seller?.avatar_url ? (
                                <img src={getOptimizedMediaUrl(seller.avatar_url)} alt={seller.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                                        {seller ? getInitials(seller.name) : '?'}
                                    </span>
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                                    {seller?.store_name || seller?.name || 'Unknown Seller'}
                                </p>
                                {seller?.university && (
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{seller.university}</p>
                                )}
                            </div>
                        </div>
                        {listing.seller_id && (
                            <button
                                onClick={() => {
                                    onClose();
                                    onVisitStore(listing.seller_id, seller?.store_name || seller?.name || 'Store');
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 focus:outline-emerald-500 text-zinc-700 dark:text-zinc-200 text-xs font-bold rounded-lg transition-colors shrink-0"
                            >
                                <Store className="w-3.5 h-3.5" />
                                Store
                            </button>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                        {!listing.is_sold && (
                            <>
                                <button
                                    onClick={handleContact}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-emerald-500/10 active:scale-[0.98]"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    {foodData && totalFoodPrice > 0 ? 'Send Order' : 'Message Seller'}
                                </button>
                                {listing.contact_info && (
                                    <button
                                        onClick={handleCopyContact}
                                        className="px-3 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-xl transition-colors"
                                        title="Copy number"
                                    >
                                        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                )}
                            </>
                        )}
                        <button
                            onClick={handleShare}
                            className="px-3 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-xl transition-colors"
                            title="Share listing"
                        >
                            <Share2 className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Owner actions */}
                    {isOwner && (
                        <div className="flex gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                            {!listing.is_sold && (
                                <button
                                    onClick={() => onMarkSold(listing.id)}
                                    disabled={markingSold === listing.id}
                                    className="flex items-center justify-center gap-2 py-2.5 px-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
                                >
                                    {markingSold === listing.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                    Sold
                                </button>
                            )}
                            <button
                                onClick={() => { onEdit(); onClose(); }}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-sm font-semibold rounded-xl transition-colors"
                            >
                                <Pencil className="w-4 h-4" />
                                Edit
                            </button>
                            <button
                                onClick={() => { onDelete(listing.id); onClose(); }}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 text-sm font-semibold rounded-xl transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Create/Edit Listing Modal Content ───────────────────────────────────────

interface ListingFormProps {
    onClose: () => void;
    onComplete: (listing: MarketplaceListing, isEdit: boolean) => void;
    currentUserId: string;
    userUniversity: string | null;
    initialData?: MarketplaceListing | null;
}

interface FoodOption {
    name: string;
    price: number;
    image_url?: string;
}

function ListingForm({ onClose: _onClose, onComplete, currentUserId, userUniversity, initialData }: ListingFormProps) {
    const isEdit = !!initialData;
    const [title, setTitle]             = useState(initialData?.title ?? '');
    const [description, setDescription] = useState(() => {
        if (initialData?.description?.startsWith('FOOD_DATA:')) {
            try {
                const jsonStr = initialData.description.split('FOOD_DATA:')[1];
                const data = JSON.parse(jsonStr);
                return data.description || '';
            } catch { return ''; }
        }
        return initialData?.description ?? '';
    });
    const [price, setPrice]             = useState(initialData ? String(initialData.price) : '');
    const [category, setCategory]       = useState<string>(initialData?.category ?? 'Textbooks');
    const [condition, setCondition]     = useState<Condition>((initialData?.condition as Condition) ?? 'Good');
    const [contactInfo, setContactInfo] = useState(initialData?.contact_info ?? '');
    const [imageFile, setImageFile]     = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(initialData?.images?.[0] ?? null);
    const [uploading, setUploading]     = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError]             = useState<string | null>(null);
    const [foodOptions, setFoodOptions] = useState<FoodOption[]>(() => {
        if (initialData?.description?.startsWith('FOOD_DATA:')) {
            try {
                const jsonStr = initialData.description.split('FOOD_DATA:')[1];
                const data = JSON.parse(jsonStr);
                return data.options || [];
            } catch { return []; }
        }
        return [];
    });
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

        let finalDescription = description.trim();
        if (category === 'Food' && foodOptions.length > 0) {
            finalDescription = `FOOD_DATA:${JSON.stringify({ options: foodOptions, description: description.trim() })}`;
        }

        try {
            let listingId = initialData?.id;
            let resultData: MarketplaceListing;

            if (isEdit && listingId) {
                // UPDATE
                const { data: updated, error: updateErr } = await supabase
                    .from('marketplace_listings')
                    .update({
                        title:        title.trim(),
                        description:  finalDescription || null,
                        price:        priceNum,
                        category,
                        condition,
                        contact_info: contactInfo.trim() || null,
                    })
                    .eq('id', listingId)
                    .eq('seller_id', currentUserId)
                    .select('*, profiles:seller_id(name, avatar_url, username, university)')
                    .single();

                if (updateErr || !updated) {
                    throw new Error(updateErr?.message ?? 'Failed to update listing.');
                }
                resultData = updated as MarketplaceListing;
            } else {
                // INSERT
                const { data: inserted, error: insertErr } = await supabase
                    .from('marketplace_listings')
                    .insert({
                        seller_id:    currentUserId,
                        title:        title.trim(),
                        description:  finalDescription || null,
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
                listingId = inserted.id;
                resultData = inserted as MarketplaceListing;
            }

            let imageUrl: string | null = null;
            let finalImages: string[] = isEdit && resultData.images ? [...resultData.images] : [];

            if (imageFile && listingId) {
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
                        const path     = `marketplace/${listingId}/${filename}`;

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
                    finalImages = [imageUrl]; // Replace existing image for simplicity
                    await supabase
                        .from('marketplace_listings')
                        .update({ images: finalImages })
                        .eq('id', listingId);
                }
            } else if (!imagePreview) {
                // Image was removed during edit
                finalImages = [];
                await supabase
                    .from('marketplace_listings')
                    .update({ images: finalImages })
                    .eq('id', listingId);
            }

            setUploadProgress(100);

            const finalListing: MarketplaceListing = {
                ...resultData,
                images: finalImages,
            };

            onComplete(finalListing, isEdit);
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
                    placeholder={category === 'Food' ? "e.g. Open for orders from 9am-6pm. Delivery available." : "Add details about the item..."}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all resize-none"
                />
            </div>

            {/* Food Options */}
            {category === 'Food' && (
                <div className="space-y-3 bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4 text-emerald-500" />
                            Menu Items
                        </label>
                        <button
                            type="button"
                            onClick={() => setFoodOptions([...foodOptions, { name: '', price: 0 }])}
                            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                        >
                            <Plus className="w-3 h-3" /> Add Item
                        </button>
                    </div>
                    
                    {foodOptions.map((opt, idx) => (
                        <div key={idx} className="flex gap-2 animate-in fade-in slide-in-from-top-1">
                            <input
                                type="text"
                                placeholder="Item name (e.g. White Rice)"
                                value={opt.name}
                                onChange={(e) => {
                                    const next = [...foodOptions];
                                    next[idx].name = e.target.value;
                                    setFoodOptions(next);
                                }}
                                className="flex-[2] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs focus:outline-emerald-500"
                            />
                            <div className="relative flex-1">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400 text-[10px]">₦</span>
                                <input
                                    type="number"
                                    placeholder="Price"
                                    value={opt.price || ''}
                                    onChange={(e) => {
                                        const next = [...foodOptions];
                                        next[idx].price = parseFloat(e.target.value) || 0;
                                        setFoodOptions(next);
                                    }}
                                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg pl-5 pr-2 py-2 text-xs focus:outline-emerald-500"
                                />
                            </div>
                            
                            {/* Option Image Upload */}
                            <div className="relative shrink-0">
                                <input
                                    type="file"
                                    id={`opt-img-${idx}`}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        
                                        // Simple preview
                                        const next = [...foodOptions];
                                        next[idx].image_url = URL.createObjectURL(file);
                                        setFoodOptions(next);

                                        // Upload to Cloudinary
                                        try {
                                            const url = await cloudinaryService.uploadImage(file);
                                            if (url) {
                                                const updated = [...foodOptions];
                                                updated[idx].image_url = url;
                                                setFoodOptions(updated);
                                            }
                                        } catch (err) {
                                            console.error('Opt upload failed', err);
                                        }
                                    }}
                                />
                                <label
                                    htmlFor={`opt-img-${idx}`}
                                    className="w-8 h-8 flex items-center justify-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg cursor-pointer hover:bg-zinc-50 transition-colors overflow-hidden"
                                >
                                    {opt.image_url ? (
                                        <img src={opt.image_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <Camera className="w-3.5 h-3.5 text-zinc-400" />
                                    )}
                                </label>
                            </div>

                            <button
                                type="button"
                                onClick={() => setFoodOptions(foodOptions.filter((_, i) => i !== idx))}
                                className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    
                    {foodOptions.length === 0 && (
                        <p className="text-[10px] text-zinc-400 italic text-center py-2">Add individual items like Rice, Chicken, Eggs etc.</p>
                    )}
                </div>
            )}

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
                <p className="text-xs text-zinc-400 mt-1">Buyers can message you directly on UniLink. This number is for optional WhatsApp contact.</p>
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
    const store = useMarketplaceStore();
    const [listings, setListings]           = useState<MarketplaceListing[]>(store.listings);
    const [loading, setLoading]             = useState(store.listings.length === 0);
    const [searchQuery, setSearchQuery]     = useState('');
    const [activeCategory, setActiveCategory] = useState<Category>('All');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingListing, setEditingListing]   = useState<MarketplaceListing | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [userUniversity, setUserUniversity] = useState<string | null>(null);
    const [markingSold, setMarkingSold]     = useState<string | null>(null);
    const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);
    const [viewMode, setViewMode]           = useState<'listings' | 'stores' | 'dashboard'>('listings');
    const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
    const [stores, setStores]               = useState<Profile[]>([]);
    const [loadingStores, setLoadingStores] = useState(false);
    const [fetchError, setFetchError]       = useState<string | null>(null);
    const [showDashboard, setShowDashboard] = useState(false);
    const [myProfile, setMyProfile]         = useState<Profile | null>(null);

    const selectedStore = useMemo(() => {
        return stores.find(s => s.id === selectedStoreId);
    }, [stores, selectedStoreId]);

    // ── Load current user ─────────────────────────────────────────────────────
    useEffect(() => {
        supabase.auth.getUser().then(async ({ data }) => {
            const uid = data.user?.id ?? null;
            setCurrentUserId(uid);
            if (uid) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('id, university, store_name, store_banner_url, store_description, store_slug')
                    .eq('id', uid)
                    .single();
                setUserUniversity(profile?.university ?? null);
                setMyProfile(profile as Profile);
            }
        });
    }, []);

    // ── Fetch listings ────────────────────────────────────────────────────────
    const fetchListings = useCallback(async (isInitial = false) => {
        // Skip fetch if cache is fresh and we're not in a store view
        if (isInitial && !store.needsRefresh() && store.listings.length > 0) {
            setLoading(false);
            return;
        }

        if (isInitial && store.listings.length === 0) {
            setLoading(true);
        }
        
        setFetchError(null);
        try {
            const { data, error } = await supabase
                .from('marketplace_listings')
                .select('*, profiles(*)')
                .eq('is_sold', false)
                .order('created_at', { ascending: false })
                .limit(120);

            if (error) throw error;
            const fetched = (data ?? []) as MarketplaceListing[];
            setListings(fetched);
            store.setListings(fetched);
        } catch (err: any) {
            console.error('[Marketplace] fetch error:', err);
            // Only show full error state if we have no cached data
            if (store.listings.length === 0) {
                setFetchError('Could not load listings. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    }, [store]);

    const fetchStores = useCallback(async () => {
        setLoadingStores(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .not('store_name', 'is', null)
                .order('store_name');
            if (error) throw error;
            setStores(data || []);
        } catch (err) {
            console.error('Fetch stores error:', err);
        } finally {
            setLoadingStores(false);
        }
    }, []);

    useEffect(() => {
        fetchListings(true);
        fetchStores();
    }, [fetchListings, fetchStores]);

    // ── Handle deep-linked listing ────────────────────────────────────────────
    const [searchParams] = useSearchParams();
    useEffect(() => {
        const linkedId = searchParams.get('id');
        if (linkedId && listings.length > 0) {
            const linked = listings.find(l => l.id === linkedId);
            if (linked) setSelectedListing(linked);
        }
    }, [searchParams, listings]);

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
            store.removeListing(id);
        } catch (err: any) {
            console.error('[Marketplace] mark sold error:', err);
            alert('Could not mark item as sold. Please try again.');
        } finally {
            setMarkingSold(null);
        }
    };

    // ── Delete listing ─────────────────────────────────────────────────────────
    const handleDelete = async (id: string) => {
        if (!currentUserId) return;
        if (!confirm('Are you sure you want to permanently delete this listing?')) return;
        try {
            const { error } = await supabase
                .from('marketplace_listings')
                .delete()
                .eq('id', id)
                .eq('seller_id', currentUserId);
            if (error) throw error;
            setListings(prev => prev.filter(l => l.id !== id));
            store.removeListing(id);
            setSelectedListing(null);
        } catch (err: any) {
            console.error('[Marketplace] delete error:', err);
            alert('Could not delete listing. Please try again.');
        }
    };

    // ── On listing created / updated ──────────────────────────────────────────
    const handleListingComplete = (savedListing: MarketplaceListing, isEdit: boolean) => {
        if (isEdit) {
            setListings(prev => prev.map(l => l.id === savedListing.id ? savedListing : l));
            store.updateListing(savedListing.id, savedListing);
        } else {
            setListings(prev => [savedListing, ...prev]);
            store.addListing(savedListing);
        }
        setShowCreateModal(false);
        setEditingListing(null);
    };

    // ── Filtered listings ─────────────────────────────────────────────────────
    const filteredListings = listings.filter(l => {
        if (selectedStoreId && l.seller_id !== selectedStoreId) return false;
        
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
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-32">
            {/* Navbar */}
            <div className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 px-4 py-4 sm:px-6">
                <div className="max-w-7xl mx-auto space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <ShoppingBag className="w-8 h-8 text-emerald-600" />
                            <div>
                                <h1 className="text-xl font-display font-bold text-zinc-900 dark:text-zinc-100">Marketplace</h1>
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{userUniversity || 'UniLink Nigeria'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {currentUserId && (
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/10 transition-all flex items-center gap-2 text-sm"
                                >
                                    <Plus className="w-4 h-4" />
                                    Sell
                                </button>
                            )}
                        </div>
                    </div>

                    {/* View Modes Tabs */}
                    <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl w-fit">
                        {[
                            { id: 'listings', label: 'All Items', icon: LayoutGrid },
                            { id: 'stores', label: 'Stores', icon: Store },
                            { id: 'dashboard', label: 'My Dashboard', icon: Trophy, auth: true },
                        ].map(tab => (
                            (!tab.auth || currentUserId) && (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setViewMode(tab.id as any);
                                        setSelectedStoreId(null);
                                    }}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === tab.id
                                        ? 'bg-white dark:bg-zinc-700 text-emerald-600 shadow-sm'
                                        : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                                        }`}
                                >
                                    <tab.icon className="w-3.5 h-3.5" />
                                    {tab.label}
                                </button>
                            )
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
                
                {/* Search & Categories (Only for Listings View) */}
                {viewMode === 'listings' && !selectedStoreId && (
                    <div className="space-y-6 mb-8 animate-in fade-in slide-in-from-top-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search books, gadgets, food..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm"
                            />
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-xs font-bold transition-all border ${activeCategory === cat
                                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-500/20 scale-105'
                                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Store Header (When viewing a specific store) */}
                {selectedStoreId && selectedStore && (
                    <div className="mb-8 animate-in fade-in slide-in-from-top-4">
                        <button 
                            onClick={() => setSelectedStoreId(null)}
                            className="flex items-center gap-2 text-zinc-500 hover:text-emerald-600 mb-4 font-bold text-sm transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to all
                        </button>
                        <div className="relative h-48 sm:h-64 rounded-3xl overflow-hidden mb-12 shadow-xl group">
                            {selectedStore.store_banner_url ? (
                                <img src={selectedStore.store_banner_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            
                            <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row items-end sm:items-center gap-6">
                                <div className="w-24 h-24 rounded-3xl bg-white dark:bg-zinc-800 p-1.5 shadow-2xl relative overflow-hidden shrink-0 translate-y-12 sm:translate-y-0">
                                    {selectedStore.avatar_url ? (
                                        <img src={getOptimizedMediaUrl(selectedStore.avatar_url)} className="w-full h-full object-cover rounded-[18px]" />
                                    ) : (
                                        <div className="w-full h-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center rounded-[18px]">
                                            <Store className="w-10 h-10 text-emerald-600" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 pb-2">
                                    <h1 className="text-3xl font-display font-black text-white drop-shadow-md">
                                        {selectedStore.store_name || selectedStore.name}
                                    </h1>
                                    <p className="text-emerald-100/90 text-sm font-medium line-clamp-1 max-w-xl">
                                        {selectedStore.store_description || selectedStore.about || `Welcome to our campus store!`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Grid Displays */}
                {viewMode === 'listings' && (
                    <>
                        {loading ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {[...Array(10)].map((_, i) => <SkeletonCard key={i} />)}
                            </div>
                        ) : filteredListings.length === 0 ? (
                            <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-100 dark:border-zinc-800">
                                <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                    <Search className="w-10 h-10 text-zinc-300" />
                                </div>
                                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">No items found</h3>
                                <p className="text-zinc-500 max-w-xs mx-auto">Try a different search term or category.</p>
                                <button 
                                    onClick={() => { setSearchQuery(''); setActiveCategory('All'); setSelectedStoreId(null); }}
                                    className="mt-6 text-emerald-600 font-bold hover:underline"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {filteredListings.map(listing => (
                                    <ListingCard
                                        key={listing.id}
                                        listing={listing}
                                        currentUserId={currentUserId}
                                        onDelete={handleDelete}
                                        onClick={setSelectedListing}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}

                {viewMode === 'stores' && (
                    <>
                        {loadingStores ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="h-64 bg-zinc-100 dark:bg-zinc-800 rounded-3xl animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {stores.map(profile => (
                                    <StoreCard 
                                        key={profile.id} 
                                        profile={profile} 
                                        onClick={(id) => {
                                            setSelectedStoreId(id);
                                            setViewMode('listings');
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }} 
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}

                {viewMode === 'dashboard' && currentUserId && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                        {myProfile && (
                            <SellerStoreSettings 
                                profile={myProfile} 
                                onUpdate={setMyProfile} 
                            />
                        )}
                        <SellerDashboard
                            currentUserId={currentUserId}
                            onEditListing={(l) => {
                                setEditingListing(l);
                                setShowCreateModal(true);
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Mobile FAB */}
            {currentUserId && (
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="md:hidden fixed bottom-24 right-4 w-14 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-xl z-40 transition-all active:scale-95 flex items-center justify-center"
                >
                    <Plus className="w-7 h-7" />
                </button>
            )}

            {/* Modals */}
            <Modal
                isOpen={showCreateModal || !!editingListing}
                onClose={() => { setShowCreateModal(false); setEditingListing(null); }}
                title={editingListing ? "Edit Listing" : "List an Item"}
                size="md"
                footer={null}
            >
                {currentUserId ? (
                    <ListingForm
                        onClose={() => { setShowCreateModal(false); setEditingListing(null); }}
                        onComplete={handleListingComplete}
                        currentUserId={currentUserId}
                        userUniversity={userUniversity}
                        initialData={editingListing}
                    />
                ) : (
                    <div className="p-8 text-center">
                        <p className="text-zinc-600 dark:text-zinc-400">Please sign in to list items.</p>
                    </div>
                )}
            </Modal>

            {selectedListing && !editingListing && (
                <ListingDetail
                    listing={selectedListing}
                    currentUserId={currentUserId}
                    onClose={() => setSelectedListing(null)}
                    onMarkSold={handleMarkSold}
                    onDelete={handleDelete}
                    onEdit={() => setEditingListing(selectedListing)}
                    onVisitStore={(id, name) => {
                        setSelectedStoreId(id);
                        setViewMode('listings');
                        setSelectedListing(null);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    markingSold={markingSold}
                />
            )}
        </div>
    );
}

function StoreCard({ profile, onClick }: { profile: Profile, onClick: (id: string) => void }) {
    return (
        <div 
            onClick={() => onClick(profile.id)}
            className="group bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
        >
            <div className="h-24 relative">
                {profile.store_banner_url ? (
                    <img src={profile.store_banner_url} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-emerald-500 to-teal-600 opacity-20" />
                )}
                <div className="absolute -bottom-6 left-6">
                    <div className="w-16 h-16 rounded-2xl bg-white dark:bg-zinc-800 p-1 shadow-lg">
                        {profile.avatar_url ? (
                            <img src={getOptimizedMediaUrl(profile.avatar_url)} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                            <div className="w-full h-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center rounded-xl">
                                <Store className="w-8 h-8 text-emerald-600" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="pt-8 p-6">
                <h3 className="font-display font-bold text-lg text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 transition-colors">
                    {profile.store_name || profile.name}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1 mb-4 min-h-[40px]">
                    {profile.store_description || profile.about || 'No description provided.'}
                </p>
                <div className="flex items-center justify-between border-t border-zinc-50 dark:border-zinc-800 pt-4">
                    <div className="flex items-center gap-1 text-emerald-600">
                        <LayoutGrid className="w-4 h-4" />
                        <span className="text-xs font-bold">Browse Collection</span>
                    </div>
                    {profile.university && (
                        <div className="flex items-center gap-1 text-zinc-400">
                            <MapPin className="w-3 h-3" />
                            <span className="text-[10px]">{profile.university}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function SellerStoreSettings({ profile, onUpdate }: { profile: Profile, onUpdate: (p: Profile) => void }) {
    const [name, setName] = useState(profile.store_name || '');
    const [desc, setDesc] = useState(profile.store_description || '');
    const [bannerUrl, setBannerUrl] = useState(profile.store_banner_url || '');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    store_name: name,
                    store_description: desc,
                    store_banner_url: bannerUrl
                })
                .eq('id', profile.id);

            if (error) throw error;
            onUpdate({ ...profile, store_name: name, store_description: desc, store_banner_url: bannerUrl });
            alert('Store settings saved!');
        } catch (err: any) {
            console.error('Save store error:', err);
            alert(`Failed to save settings: ${err.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const url = await cloudinaryService.uploadImage(file, { folder: 'ulink/stores' });
            setBannerUrl(url);
        } catch (err) {
            console.error('Upload banner error:', err);
            alert('Failed to upload banner.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <Store className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                    <h2 className="text-xl font-display font-bold text-zinc-900 dark:text-zinc-100">Store Settings</h2>
                    <p className="text-sm text-zinc-500">Customize your store's public identity</p>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Store Name</label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Amaka's Boutique"
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Store Description</label>
                    <textarea 
                        value={desc}
                        onChange={e => setDesc(e.target.value)}
                        placeholder="Tell buyers what you sell and why they should buy from you..."
                        rows={3}
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Store Banner</label>
                    <div className="relative group aspect-[3/1] rounded-2xl overflow-hidden border-2 border-dashed border-zinc-200 dark:border-zinc-700 hover:border-emerald-500 transition-colors">
                        {bannerUrl ? (
                            <img src={bannerUrl} className="w-full h-full object-cover" />
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400">
                                <Upload className="w-8 h-8 mb-2" />
                                <span className="text-xs font-medium">Upload Banner (3:1 aspect)</span>
                            </div>
                        )}
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleBannerUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        {uploading && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                            </div>
                        )}
                    </div>
                </div>

                <button 
                    onClick={handleSave}
                    disabled={loading || uploading}
                    className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-2xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Save Store Changes'}
                </button>
            </div>
        </div>
    );
}

// ─── Seller Dashboard ────────────────────────────────────────────────────────

function SellerDashboard({ currentUserId, onEditListing }: { currentUserId: string, onEditListing: (l: MarketplaceListing) => void }) {
    const [myListings, setMyListings] = useState<MarketplaceListing[]>([]);
    const [inquiryCounts, setInquiryCounts] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'active' | 'sold'>('active');

    const fetchMyListings = async () => {
        setLoading(true);
        try {
            // 1. Fetch listings
            const { data, error } = await supabase
                .from('marketplace_listings')
                .select('*, profiles(name, avatar_url, username, university)')
                .eq('seller_id', currentUserId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setMyListings(data || []);

            // 2. Fetch inquiry counts from messages
            // We search for messages sent to this user containing "🛒 [Market]"
            const { data: msgData } = await supabase
                .from('messages')
                .select('content')
                .eq('recipient_id', currentUserId)
                .filter('content', 'ilike', '%🛒 [Market]%');

            if (msgData) {
                const counts: Record<string, number> = {};
                msgData.forEach(m => {
                    // Extract listing title if possible, or just count general inquiries
                    // For now, let's just count how many times each listing title appears
                    data?.forEach(listing => {
                        if (m.content.includes(listing.title)) {
                            counts[listing.id] = (counts[listing.id] || 0) + 1;
                        }
                    });
                });
                setInquiryCounts(counts);
            }
        } catch (err) {
            console.error('Dashboard fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyListings();
    }, [currentUserId]);

    const activeListings = myListings.filter(l => !l.is_sold);
    const soldListings = myListings.filter(l => l.is_sold);
    const stats = [
        { label: 'Active Items', value: activeListings.length, icon: ShoppingBag, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
        { label: 'Items Sold', value: soldListings.length, icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {stats.map((s, i) => (
                    <div key={i} className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center ${s.color}`}>
                            <s.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">{s.label}</p>
                            <p className="text-xl font-black text-zinc-900 dark:text-zinc-100 leading-none">{s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-zinc-900 p-1.5 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex w-full max-w-xs shadow-sm">
                <button
                    onClick={() => setActiveTab('active')}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'active' ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-lg shadow-zinc-200 dark:shadow-none' : 'text-zinc-500 hover:text-zinc-700'}`}
                >
                    Active ({activeListings.length})
                </button>
                <button
                    onClick={() => setActiveTab('sold')}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'sold' ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-lg shadow-zinc-200 dark:shadow-none' : 'text-zinc-500 hover:text-zinc-700'}`}
                >
                    Sold ({soldListings.length})
                </button>
            </div>

            {/* List */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                </div>
            ) : (
                <div className="space-y-3">
                    {(activeTab === 'active' ? activeListings : soldListings).map((l) => (
                        <div key={l.id} className="group bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-100 dark:border-zinc-800 hover:border-emerald-500/30 transition-all flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0">
                                {l.images?.[0] ? (
                                    <img src={l.images[0]} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                        <ShoppingBag className="w-6 h-6" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-black px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-lg uppercase tracking-wider">
                                        {l.category}
                                    </span>
                                    <span className="text-[10px] font-black text-emerald-600">
                                        ₦{formatPrice(l.price)}
                                    </span>
                                </div>
                                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">{l.title}</h3>
                                <div className="flex items-center gap-3 mt-1">
                                    <p className="text-[10px] text-zinc-400">Listed {formatTimeAgo(l.created_at)}</p>
                                    <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600">
                                        <MessageCircle className="w-3 h-3" />
                                        {inquiryCounts[l.id] || 0} Inquiries
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                {activeTab === 'active' ? (
                                    <>
                                        <button 
                                            onClick={() => {
                                                if (window.confirm('Mark this item as sold?')) {
                                                    supabase
                                                        .from('marketplace_listings')
                                                        .update({ is_sold: true })
                                                        .eq('id', l.id)
                                                        .then(() => fetchMyListings());
                                                }
                                            }}
                                            className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 text-emerald-600 rounded-xl transition-colors shadow-sm"
                                            title="Mark as Sold"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => onEditListing(l)}
                                            className="p-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-600 dark:text-zinc-300 rounded-xl transition-colors shadow-sm"
                                            title="Edit Listing"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => {
                                                if (window.confirm('Delete this listing permanently?')) {
                                                    supabase
                                                        .from('marketplace_listings')
                                                        .delete()
                                                        .eq('id', l.id)
                                                        .then(() => fetchMyListings());
                                                }
                                            }}
                                            className="p-2.5 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 text-red-600 rounded-xl transition-colors shadow-sm"
                                            title="Delete Listing"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                            <CheckCircle2 className="w-3.5 h-3.5" /> Sold
                                        </div>
                                        <button 
                                            onClick={() => {
                                                if (window.confirm('Relist this item? It will appear back in the market.')) {
                                                    supabase
                                                        .from('marketplace_listings')
                                                        .update({ is_sold: false })
                                                        .eq('id', l.id)
                                                        .then(() => fetchMyListings());
                                                }
                                            }}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-600 dark:text-zinc-300 rounded-xl transition-colors shadow-sm text-[10px] font-black uppercase tracking-widest"
                                            title="Relist Item"
                                        >
                                            <RotateCcw className="w-3.5 h-3.5" /> Relist
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {(activeTab === 'active' ? activeListings : soldListings).length === 0 && (
                        <div className="text-center py-12 px-6">
                            <p className="text-sm text-zinc-500 italic">No {activeTab} listings found.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
