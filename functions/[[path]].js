export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        
        // Only intercept requests for specific shareable paths we care about
        const isPostShare = url.pathname.startsWith('/app/post/');
        const isPodcastShare = url.pathname.startsWith('/app/podcasts/');
        const isStudyRoomShare = url.pathname.startsWith('/app/study') && url.searchParams.has('room');
        const isProfileShare = url.pathname.startsWith('/app/profile/');
        const isMarketplaceItem = url.pathname.startsWith('/app/marketplace/') && url.pathname.split('/').length > 3;
        const isCommunityPage = url.pathname.startsWith('/app/communities/') && url.pathname.split('/').length > 3;
        const isJobPage = url.pathname.startsWith('/app/jobs/') && url.pathname.split('/').length > 3;
        
        // If it's an API request or static asset, pass it through normal mapping
        if (
            url.pathname.startsWith('/assets/') ||
            url.pathname.endsWith('.js') ||
            url.pathname.endsWith('.css') ||
            url.pathname.endsWith('.png') ||
            url.pathname.endsWith('.jpg') ||
            url.pathname.endsWith('.svg') ||
            url.pathname.endsWith('.ico') ||
            url.pathname.endsWith('.json') ||
            url.pathname.endsWith('.webmanifest')
        ) {
            return env.ASSETS.fetch(request);
        }

        // --- Fetch Metadata logic ---
        let metadata = {
            title: "UniLink — Where Nigerian Students Connect & Grow",
            description: "Join thousands of Nigerian university students on UniLink. Network with peers, discover jobs & internships, share ideas, and build your career.",
            image: "https://unilink.ng/icon-512.png",
            video: null,
            twitterCard: "summary_large_image"
        };
        
        const sbUrlHost = env.VITE_SUPABASE_URL;
        const sbAnonKey = env.VITE_SUPABASE_ANON_KEY;
        
        try {
            if (isPostShare) {
                const postId = url.pathname.split('/').pop();
                if (postId && sbUrlHost && sbAnonKey) {
                    const sbUrl = `${sbUrlHost}/rest/v1/posts?id=eq.${postId}&select=content,image_url,image_urls,video_url,profiles(name)&limit=1`;
                    const res = await fetch(sbUrl, {
                        headers: { 'apikey': sbAnonKey, 'Authorization': `Bearer ${sbAnonKey}`, 'Accept': 'application/json' }
                    });
                    
                    if (res.ok) {
                        const data = await res.json();
                        if (data && data.length > 0) {
                            const post = data[0];
                            const authorName = post.profiles?.name || 'UniLink User';
                            metadata.title = `Post by ${authorName} on UniLink`;
                            
                            // Image logic
                            metadata.image = post.image_url || (post.image_urls && post.image_urls.length > 0 ? post.image_urls[0] : metadata.image);
                            
                            if (post.video_url) {
                                let vUrl = post.video_url;
                                if (vUrl.includes('res.cloudinary.com') && !vUrl.match(/\.[a-zA-Z0-9]+$/)) {
                                    vUrl += '.mp4';
                                }
                                metadata.video = vUrl;
                                metadata.twitterCard = "player";
                                
                                // Video thumbnail logic
                                if (!post.image_url && metadata.video.includes('res.cloudinary.com')) {
                                    const match = metadata.video.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
                                    if (match) {
                                        metadata.image = `https://res.cloudinary.com/dh5odmxyi/video/upload/so_0,f_auto,q_auto,c_fill,w_1200,h_630/${match[1]}.jpg`;
                                    }
                                }
                            }
                            
                            if (post.content) {
                                const cleanContent = post.content.replace(/<[^>]*>?/gm, '');
                                metadata.description = cleanContent.length > 150 ? cleanContent.substring(0, 150) + '...' : cleanContent;
                            }
                        }
                    }
                }
            } 
            else if (isProfileShare) {
                const username = url.pathname.split('/').pop();
                if (username && sbUrlHost && sbAnonKey) {
                    const sbUrl = `${sbUrlHost}/rest/v1/profiles?username=eq.${username}&select=name,bio,avatar_url,university&limit=1`;
                    const res = await fetch(sbUrl, {
                        headers: { 'apikey': sbAnonKey, 'Authorization': `Bearer ${sbAnonKey}`, 'Accept': 'application/json' }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        if (data && data.length > 0) {
                            const p = data[0];
                            metadata.title = `${p.name} (@${username}) on UniLink`;
                            metadata.description = p.bio || `Connect with ${p.name} from ${p.university || 'university'} on UniLink.`;
                            if (p.avatar_url) metadata.image = p.avatar_url;
                        }
                    }
                }
            }
            else if (isPodcastShare) {
                const podcastId = url.pathname.split('/').pop();
                if (podcastId && sbUrlHost && sbAnonKey) {
                    const sbUrl = `${sbUrlHost}/rest/v1/podcasts?id=eq.${podcastId}&select=title,description,cover_url&limit=1`;
                    const res = await fetch(sbUrl, {
                        headers: { 'apikey': sbAnonKey, 'Authorization': `Bearer ${sbAnonKey}`, 'Accept': 'application/json' }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        if (data && data.length > 0) {
                            const p = data[0];
                            metadata.title = `${p.title} on UniLink Podcasts`;
                            metadata.description = p.description || `Listen to ${p.title} on UniLink. The pulse of Nigerian campus life.`;
                            if (p.cover_url) metadata.image = p.cover_url;
                        }
                    }
                }
            }
            else if (isStudyRoomShare) {
                const roomId = url.searchParams.get('room');
                if (roomId && sbUrlHost && sbAnonKey) {
                    const sbUrl = `${sbUrlHost}/rest/v1/study_rooms?id=eq.${roomId}&select=name,description&limit=1`;
                    const res = await fetch(sbUrl, {
                        headers: { 'apikey': sbAnonKey, 'Authorization': `Bearer ${sbAnonKey}`, 'Accept': 'application/json' }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        if (data && data.length > 0) {
                            const r = data[0];
                            metadata.title = `${r.name} - Study Room on UniLink`;
                            metadata.description = r.description || `Join this virtual study room on UniLink to collaborate and learn together.`;
                        }
                    }
                }
            }
            else if (isMarketplaceItem) {
                const parts = url.pathname.split('/');
                const itemId = parts[parts.length - 1];
                if (itemId && sbUrlHost && sbAnonKey) {
                    const sbUrl = `${sbUrlHost}/rest/v1/marketplace_listings?id=eq.${itemId}&select=title,description,price,image_urls&limit=1`;
                    const res = await fetch(sbUrl, { headers: { 'apikey': sbAnonKey, 'Authorization': `Bearer ${sbAnonKey}` } });
                    if (res.ok) {
                        const data = await res.json();
                        if (data?.[0]) {
                            const item = data[0];
                            metadata.title = `${item.title} - ₦${new Intl.NumberFormat('en-NG').format(item.price)} on UniLink`;
                            metadata.description = item.description || `Buy ${item.title} on UniLink Nigeria. Trusted campus marketplace.`;
                            if (item.image_urls?.[0]) metadata.image = item.image_urls[0];
                        }
                    }
                }
            }
            else if (isCommunityPage) {
                const slug = url.pathname.split('/').pop();
                const sbUrl = `${sbUrlHost}/rest/v1/communities?slug=eq.${slug}&select=name,description,icon_url&limit=1`;
                const res = await fetch(sbUrl, { headers: { 'apikey': sbAnonKey, 'Authorization': `Bearer ${sbAnonKey}` } });
                if (res.ok) {
                    const data = await res.json();
                    if (data?.[0]) {
                        metadata.title = `${data[0].name} Community | UniLink`;
                        metadata.description = data[0].description || `Join the ${data[0].name} community on UniLink.`;
                        if (data[0].icon_url) metadata.image = data[0].icon_url;
                    }
                }
            }
            else if (isJobPage) {
                const jobId = url.pathname.split('/').pop();
                const sbUrl = `${sbUrlHost}/rest/v1/jobs?id=eq.${jobId}&select=title,company_name,description&limit=1`;
                const res = await fetch(sbUrl, { headers: { 'apikey': sbAnonKey, 'Authorization': `Bearer ${sbAnonKey}` } });
                if (res.ok) {
                    const data = await res.json();
                    if (data?.[0]) {
                        metadata.title = `${data[0].title} at ${data[0].company_name} | UniLink Jobs`;
                        metadata.description = data[0].description?.substring(0, 160) || `Apply for ${data[0].title} on UniLink.`;
                    }
                }
            }
        } catch (err) {
            console.error('Meta fetch error:', err);
        }

        // Fetch index.html
        const response = await env.ASSETS.fetch(request);
        const contentType = response.headers.get("content-type");
        
        if (contentType && contentType.includes("text/html")) {
            let html = await response.text();
            
            // Reusable injection helper - uses more flexible regex to handle line breaks/formatting in index.html
            const injectMeta = (html, property, content, attrName = "property") => {
                const regex = new RegExp(`<meta\\s+${attrName}=["']${property}["'][^>]*content=["'][^"']*["'][^>]*>`, "is");
                const newTag = `<meta ${attrName}="${property}" content="${content.replace(/"/g, '&quot;')}" />`;
                if (regex.test(html)) {
                    return html.replace(regex, newTag);
                } else {
                    // Fallback: inject before </head> if not found
                    return html.replace("</head>", `${newTag}\n</head>`);
                }
            };

            // Inject Title
            html = html.replace(/<title>.*?<\/title>/, `<title>${metadata.title}</title>`);

            html = injectMeta(html, "og:title", metadata.title);
            html = injectMeta(html, "og:description", metadata.description);
            html = injectMeta(html, "og:image", metadata.image);
            html = injectMeta(html, "twitter:title", metadata.title, "name");
            html = injectMeta(html, "twitter:description", metadata.description, "name");
            html = injectMeta(html, "twitter:image", metadata.image, "name");
            html = injectMeta(html, "twitter:card", metadata.twitterCard, "name");
            html = injectMeta(html, "description", metadata.description, "name");

            if (metadata.video) {
                html = injectMeta(html, "og:video", metadata.video);
                html = injectMeta(html, "og:video:secure_url", metadata.video);
                html = injectMeta(html, "og:video:type", "video/mp4");
                html = injectMeta(html, "og:video:width", "1280");
                html = injectMeta(html, "og:video:height", "720");
                html = injectMeta(html, "twitter:player", metadata.video, "name");
                html = injectMeta(html, "twitter:player:width", "1280", "name");
                html = injectMeta(html, "twitter:player:height", "720", "name");
            }

            // Inject JSON-LD
            const jsonLd = {
                "@context": "https://schema.org",
                "@type": isJobPage ? "JobPosting" : (isMarketplaceItem ? "Product" : "WebPage"),
                "name": metadata.title,
                "description": metadata.description,
                "url": url.toString(),
                "image": metadata.image
            };
            html = html.replace("</head>", `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>\n</head>`);

            return new Response(html, {
                headers: { "content-type": "text/html;charset=UTF-8" },
                status: response.status,
                statusText: response.statusText
            });
        }
        
        return response;
    }
}
