/**
 * Utility to dynamically update meta tags for social sharing
 * Used for individual post pages to show rich previews
 */

interface MetaTagsOptions {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
}

/**
 * Truncate text smartly for meta descriptions
 * Tries to break at sentence or word boundaries
 */
export function truncateForMeta(text: string, maxLength: number = 200): string {
    if (!text || text.length <= maxLength) return text;

    // Try to break at sentence
    const sentences = text.match(/[^.!?]+[.!?]+/g);
    if (sentences && sentences[0] && sentences[0].length <= maxLength) {
        return sentences[0].trim();
    }

    // Break at word boundary
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');

    if (lastSpace > maxLength * 0.8) {
        return truncated.substring(0, lastSpace) + '...';
    }

    return truncated + '...';
}

/**
 * Update meta tags for the current page
 * This enables rich previews when sharing links on social media
 */
export function updateMetaTags(options: MetaTagsOptions) {
    const { title, description, image, url } = options;

    // Update document title
    if (title) {
        document.title = `${title} | UniLink`;
    }

    // Helper to update or create meta tag
    const setMetaTag = (property: string, content: string, isName = false) => {
        const attribute = isName ? 'name' : 'property';
        let element = document.querySelector(`meta[${attribute}="${property}"]`);

        if (!element) {
            element = document.createElement('meta');
            element.setAttribute(attribute, property);
            document.head.appendChild(element);
        }

        element.setAttribute('content', content);
    };

    // Update Open Graph tags
    if (title) {
        setMetaTag('og:title', title);
        setMetaTag('twitter:title', title, true);
    }

    if (description) {
        const truncatedDesc = truncateForMeta(description, 200);
        setMetaTag('og:description', truncatedDesc);
        setMetaTag('twitter:description', truncatedDesc, true);
        setMetaTag('description', truncatedDesc, true);
    }

    if (image) {
        setMetaTag('og:image', image);
        setMetaTag('twitter:image', image, true);
        setMetaTag('twitter:card', 'summary_large_image', true);
    }

    if (url) {
        setMetaTag('og:url', url);
    }
}

/**
 * Reset meta tags to default values
 */
export function resetMetaTags() {
    updateMetaTags({
        title: 'UniLink - The #1 Network for Nigerian Students',
        description: 'Connect with students across Nigerian universities. Network, share opportunities, and build your professional profile.',
        image: `${window.location.origin}/icon-512.png`,
        url: window.location.href
    });
}
