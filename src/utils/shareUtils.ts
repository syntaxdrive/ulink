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

export const nativeShare = async (title: string, text: string, url: string) => {
    try {
        const brandedText = formatShareText(text);

        if (Capacitor.isNativePlatform()) {
            await Share.share({
                title,
                text: brandedText,
                url,
                dialogTitle: `Share ${title}`,
            });
            return true;
        } else if (navigator.share) {
            await navigator.share({
                title,
                text: brandedText,
                url,
            });
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
