export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        
        // Only intercept requests for specific shareable paths we care about
        // e.g., /app/post/:id, /app/podcasts/:id, /app/marketplace
        const isPostShare = url.pathname.startsWith('/app/post/');
        const isPodcastShare = url.pathname.startsWith('/app/podcasts/');
        const isStudyRoomShare = url.pathname.startsWith('/app/study') && url.searchParams.has('room');
        
        // If it's an API request or static asset, pass it through normal mapping
        if (
            url.pathname.startsWith('/assets/') ||
            url.pathname.endsWith('.js') ||
            url.pathname.endsWith('.css') ||
            url.pathname.endsWith('.png') ||
            url.pathname.endsWith('.jpg') ||
            url.pathname.endsWith('.svg') ||
            url.pathname.endsWith('.ico')
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
                    const sbUrl = `${sbUrlHost}/rest/v1/posts?id=eq.${postId}&select=content,image_url,image_urls,profiles(name)&limit=1`;
                    const res = await fetch(sbUrl, {
                        headers: {
                            'apikey': sbAnonKey,
                            'Authorization': `Bearer ${sbAnonKey}`,
                            'Accept': 'application/json'
                        }
                    });
                    
                    if (res.ok) {
                        const data = await res.json();
                        if (data && data.length > 0) {
                            const post = data[0];
                            const authorName = post.profiles?.name || 'UniLink User';
                            
                            title = `Post by ${authorName} on UniLink`;
                            
                            // Get first available image
                            const postImage = post.image_url || (post.image_urls && post.image_urls.length > 0 ? post.image_urls[0] : null);
                            if (postImage) {
                                image = postImage;
                            }
                            
                            if (post.content) {
                                // Strip HTML if any and truncate
                                const cleanContent = post.content.replace(/<[^>]*>?/gm, '');
                                description = cleanContent.length > 150 
                                    ? cleanContent.substring(0, 150) + '...' 
                                    : cleanContent;
                            } else if (postImage) {
                                description = `View this image posted by ${authorName} on UniLink.`;
                            }
                        }
                    }
                }
            } 
            else if (isPodcastShare) {
                const podcastId = url.pathname.split('/').pop();
                if (podcastId && sbUrlHost && sbAnonKey) {
                    const sbUrl = `${sbUrlHost}/rest/v1/podcasts?id=eq.${podcastId}&select=title,description,cover_url,profiles!podcasts_creator_id_fkey(name)&limit=1`;
                    const res = await fetch(sbUrl, {
                        headers: {
                            'apikey': sbAnonKey,
                            'Authorization': `Bearer ${sbAnonKey}`,
                            'Accept': 'application/json'
                        }
                    });
                    
                    if (res.ok) {
                        const data = await res.json();
                        if (data && data.length > 0) {
                            const podcast = data[0];
                            const authorName = podcast.profiles?.name || 'UniLink User';
                            
                            title = `${podcast.title} by ${authorName} - UniLink Podcasts`;
                            
                            if (podcast.cover_url) {
                                image = podcast.cover_url;
                            }
                            
                            if (podcast.description) {
                                description = podcast.description;
                            } else {
                                description = `Listen to ${podcast.title} on UniLink podcasts.`;
                            }
                        }
                    }
                }
            }
            else if (isStudyRoomShare) {
                const roomId = url.searchParams.get('room');
                if (roomId && sbUrlHost && sbAnonKey) {
                    const sbUrl = `${sbUrlHost}/rest/v1/study_rooms?id=eq.${roomId}&select=name,description,is_private,profiles(name)&limit=1`;
                    const res = await fetch(sbUrl, {
                        headers: {
                            'apikey': sbAnonKey,
                            'Authorization': `Bearer ${sbAnonKey}`,
                            'Accept': 'application/json'
                        }
                    });
                    
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
                        } else {
                            // If RLS blocks the query (because room is private), it returns empty array
                            title = "Private Study Room - UniLink";
                            description = "Join our private study room on UniLink to collaborate and learn.";
                        }
                    } else {
                        title = "Private Study Room - UniLink";
                        description = "Join our private study room on UniLink to collaborate and learn.";
                    }
                }
            }
        } catch (err) {
            console.error('Error fetching metadata for OG tags:', err);
            // Fallback to defaults on error
        }

        // Fetch the index.html from static assets
        const response = await env.ASSETS.fetch(request);
        
        // If it's an HTML response, inject our dynamically fetched metadata
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("text/html")) {
            const html = await response.text();
            
            // Replace the default meta tags with dynamic ones
            const ogTitleRegex = /<meta property="og:title" content="[^"]*"\s*\/?>/i;
            const ogDescRegex = /<meta property="og:description" content="[^"]*"\s*\/?>/i;
            const ogImageRegex = /<meta property="og:image" content="[^"]*"\s*\/?>/i;
            const twTitleRegex = /<meta name="twitter:title" content="[^"]*"\s*\/?>/i;
            const twDescRegex = /<meta name="twitter:description" content="[^"]*"\s*\/?>/i;
            const twImageRegex = /<meta name="twitter:image" content="[^"]*"\s*\/?>/i;
            
            let modHtml = html
                .replace(ogTitleRegex, `<meta property="og:title" content="${title.replace(/"/g, '&quot;')}" />`)
                .replace(ogDescRegex, `<meta property="og:description" content="${description.replace(/"/g, '&quot;')}" />`)
                .replace(ogImageRegex, `<meta property="og:image" content="${image.replace(/"/g, '&quot;')}" />`)
                .replace(twTitleRegex, `<meta name="twitter:title" content="${title.replace(/"/g, '&quot;')}" />`)
                .replace(twDescRegex, `<meta name="twitter:description" content="${description.replace(/"/g, '&quot;')}" />`)
                .replace(twImageRegex, `<meta name="twitter:image" content="${image.replace(/"/g, '&quot;')}" />`);
            
            // Return modified HTML
            return new Response(modHtml, {
                headers: { "content-type": "text/html;charset=UTF-8" },
                status: response.status,
                statusText: response.statusText
            });
        }
        
        // Return original if not HTML or not intercepted
        return response;
    }
}
