export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        
        // Only intercept requests for specific shareable paths we care about
        const isPostShare = url.pathname.startsWith('/app/post/');
        const isPodcastShare = url.pathname.startsWith('/app/podcasts/');
        const isStudyRoomShare = url.pathname.startsWith('/app/study') && url.searchParams.has('room');
        const isProfileShare = url.pathname.startsWith('/app/profile/');
        const isMarketplaceItem = url.pathname.startsWith('/app/marketplace/') && url.pathname.split('/').length > 3;
        
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
        let title = "UniLink — Where Nigerian Students Connect & Grow";
        let description = "Join thousands of Nigerian university students on UniLink. Network with peers, discover jobs & internships, share ideas, and build your career.";
        let image = "https://unilink.ng/icon-512.png";
        
        const sbUrlHost = env.VITE_SUPABASE_URL || 'https://rwtdjpwsxtwfeecseugg.supabase.co';
        const sbAnonKey = env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3dGRqcHdzeHR3ZmVlY3NldWdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxMzg2MjUsImV4cCI6MjA4MzcxNDYyNX0.s9fNTqVzjydNQIvSQvM6zHldnL5TU-zKg4KARE0F_b8';
        
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
                            title = `Post by ${authorName} on UniLink`;
                            
                            // Image logic
                            image = post.image_url || (post.image_urls && post.image_urls.length > 0 ? post.image_urls[0] : image);
                            
                            // Video thumbnail logic
                            if (!post.image_url && post.video_url && post.video_url.includes('res.cloudinary.com')) {
                                // Extract public_id and build thumbnail URL
                                const match = post.video_url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
                                if (match) {
                                    image = `https://res.cloudinary.com/rwtdjpw/video/upload/so_0,f_auto,q_auto,c_fill,w_640,h_360/${match[1]}.jpg`;
                                }
                            }
                            
                            if (post.content) {
                                const cleanContent = post.content.replace(/<[^>]*>?/gm, '');
                                description = cleanContent.length > 150 ? cleanContent.substring(0, 150) + '...' : cleanContent;
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
                            title = `${p.name} (@${username}) on UniLink`;
                            description = p.bio || `Connect with ${p.name} from ${p.university || 'university'} on UniLink.`;
                            if (p.avatar_url) image = p.avatar_url;
                        }
                    }
                }
            }
            else if (isPodcastShare) {
                const podcastId = url.pathname.split('/').pop();
                if (podcastId && sbUrlHost && sbAnonKey) {
                    const sbUrl = `${sbUrlHost}/rest/v1/podcasts?id=eq.${podcastId}&select=title,description,cover_url,profiles!podcasts_creator_id_fkey(name)&limit=1`;
                    const res = await fetch(sbUrl, {
                        headers: { 'apikey': sbAnonKey, 'Authorization': `Bearer ${sbAnonKey}`, 'Accept': 'application/json' }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        if (data && data.length > 0) {
                            const podcast = data[0];
                            title = `${podcast.title} by ${podcast.profiles?.name || 'UniLink'} - UniLink Podcasts`;
                            if (podcast.cover_url) image = podcast.cover_url;
                            description = podcast.description || `Listen to ${podcast.title} on UniLink.`;
                        }
                    }
                }
            }
            else if (isStudyRoomShare) {
                const roomId = url.searchParams.get('room');
                if (roomId && sbUrlHost && sbAnonKey) {
                    const sbUrl = `${sbUrlHost}/rest/v1/study_rooms?id=eq.${roomId}&select=name,description,is_private,profiles(name)&limit=1`;
                    const res = await fetch(sbUrl, { headers: { 'apikey': sbAnonKey, 'Authorization': `Bearer ${sbAnonKey}`, 'Accept': 'application/json' } });
                    if (res.ok) {
                        const data = await res.json();
                        if (data && data.length > 0) {
                            const room = data[0];
                            if (room.is_private) {
                                title = "Private Study Room - UniLink";
                                description = `Join ${room.profiles?.name || 'our'} private study room on UniLink to collaborate and learn.`;
                            } else {
                                title = `${room.name} - UniLink Study Room`;
                                description = room.description || `Join ${room.profiles?.name || 'our'} study room on UniLink to collaborate and learn.`;
                            }
                        }
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

            html = injectMeta(html, "og:title", title);
            html = injectMeta(html, "og:description", description);
            html = injectMeta(html, "og:image", image);
            html = injectMeta(html, "twitter:title", title, "name");
            html = injectMeta(html, "twitter:description", description, "name");
            html = injectMeta(html, "twitter:image", image, "name");
            html = injectMeta(html, "description", description, "name");

            return new Response(html, {
                headers: { "content-type": "text/html;charset=UTF-8" },
                status: response.status,
                statusText: response.statusText
            });
        }
        
        return response;
    }
}
