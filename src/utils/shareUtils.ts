import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

export interface ShareOptions {
    title: string;
    text: string;
    url: string;
}

/**
 * Standardizes share text with UniLink branding
 */
export const formatShareText = (text: string): string => {
    return `${text}\n\nShared via UniLink Nigeria 🇳🇬`;
};

export const shareToWhatsApp = (text: string, url?: string) => {
    const brandedText = formatShareText(text);
    const fullText = url ? `${brandedText}\n${url}` : brandedText;

    // Modern WhatsApp share URL
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(fullText)}`;
    window.open(shareUrl, '_blank');
};

export const nativeShare = async (title: string, text: string, url: string, imageUrl?: string) => {
    try {
        const brandedText = formatShareText(text);

        // Try to fetch image to share natively across platforms
        let files: File[] = [];
        if (imageUrl) {
            try {
                // Determine file extension from URL or fallback to png
                const ext = imageUrl.split('?')[0].split('.').pop()?.toLowerCase() || 'png';
                const mimeType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' 
                               : ext === 'webp' ? 'image/webp'
                               : 'image/png';
                               
                const response = await fetch(imageUrl, { mode: 'cors' });
                const blob = await response.blob();
                
                // Construct a valid File object
                const file = new File([blob], `shared_image.${ext}`, { type: mimeType });
                files = [file];
            } catch (imageErr) {
                console.warn('Could not fetch share image blob:', imageErr);
            }
        }

        if (Capacitor.isNativePlatform()) {
            await Share.share({
                title,
                text: brandedText,
                url,
                dialogTitle: `Share ${title}`,
                // We do not pass `files` to Capacitor share this way;
                // Capacitor requires local file URI strings.
                // It will naturally fallback to link preview sharing which is fine.
            });
            return true;
        } else if (navigator.share) {
            // Check if user's browser supports sharing this specific file setup
            const shareData: any = {
                title,
                text: brandedText,
                url,
            };

            if (files.length > 0 && navigator.canShare && navigator.canShare({ files })) {
                shareData.files = files;
            }

            await navigator.share(shareData);
            return true;
        }
        return false;
    } catch (error: any) {
        if (error.name !== 'AbortError') {
            console.error('Error sharing natively:', error);
        }
        return false;
    }
};
