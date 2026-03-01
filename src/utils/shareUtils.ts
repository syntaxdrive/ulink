export const shareToWhatsApp = (text: string, url?: string) => {
    const fullText = url ? `${text}\n\n${url}` : text;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // Direct WhatsApp protocol for mobile, wa.me for web
    const baseUrl = isMobile ? 'whatsapp://send' : 'https://wa.me/';
    const shareUrl = `${baseUrl}?text=${encodeURIComponent(fullText)}`;

    // Open in new tab/app
    window.open(shareUrl, '_blank');
};

export const nativeShare = async (title: string, text: string, url: string) => {
    if (navigator.share) {
        try {
            await navigator.share({
                title,
                text,
                url,
            });
            return true;
        } catch (error) {
            console.error('Error sharing natively:', error);
            return false;
        }
    }
    return false;
};
