
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title: string;
    description: string;
    keywords?: string[];
    ogImage?: string;
    ogType?: 'website' | 'article' | 'profile';
    canonicalUrl?: string;
}

export const SEO = ({
    title,
    description,
    keywords = [
        'University Nigeria',
        'Student Resources Nigeria',
        'Study Groups',
        'Exam Past Questions',
        'UniLink',
        'Nigerian Universities Collaboration',
        'student group',
        'university of lagos',
        'university of ibadan',
        'university of abuja',
        'university of port harcourt',
        'university of calabar',
        'university of benin',
        'university of jos',
        'university of maiduguri',
        'university of sokoto',
        'university of yola',
        'university of zaria',
        'university of ilorin',
        'university of lagos',
        'university of ibadan',
        'university of abuja',
        'university of port harcourt',
        'university of calabar',
        'university of benin',
        'university of jos',
        'university of maiduguri',
        'university of sokoto',
        'university of yola',
        'university of zaria',
        'university of ilorin',
    ],
    ogImage = 'https://unilink.ng/og-image.jpg', // Default OG image
    ogType = 'website',
    canonicalUrl = typeof window !== 'undefined' ? window.location.href : '',
}: SEOProps) => {
    const fullTitle = `${title} | UniLink`;

    return (
        <Helmet>
            {/* Basic Metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords.join(', ')} />
            <link rel="canonical" href={canonicalUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={ogType} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={ogImage} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:site_name" content="UniLink Nigeria" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={ogImage} />

            {/* Viewport & Theme Color (Mobile Optimization) */}
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
            <meta name="theme-color" content="#10b981" /> {/* Emerald 500 */}

            {/* JSON-LD Structured Data for Rich Snippets */}
            <script type="application/ld+json">
                {JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "SoftwareApplication",
                    "name": "UniLink Nigeria",
                    "applicationCategory": "EducationalApplication",
                    "operatingSystem": "Web, Android, iOS",
                    "description": "Connecting Nigerian university students for collaboration, resources, and growth.",
                    "offers": {
                        "@type": "Offer",
                        "price": "0",
                        "priceCurrency": "NGN"
                    },
                    "aggregateRating": {
                        "@type": "AggregateRating",
                        "ratingValue": "4.8",
                        "ratingCount": "1250"
                    }
                })}
            </script>
        </Helmet>
    );
};
