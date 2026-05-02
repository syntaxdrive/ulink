import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import type { Post } from '../../../types';
import { useFeedStore } from '../../../stores/useFeedStore';
import { notifyMentionedUsers } from '../../../utils/mentions';
import { cloudinaryService, getOptimizedMediaUrl } from '../../../services/cloudinaryService';

function optimizePostMedia(post: any): any {
    if (!post) return post;
    return {
        ...post,
        image_url: getOptimizedMediaUrl(post.image_url),
        image_urls: post.image_urls ? post.image_urls.map((u: string) => getOptimizedMediaUrl(u)) : null,
        video_url: getOptimizedMediaUrl(post.video_url),
        profiles: post.profiles ? {
            ...post.profiles,
            avatar_url: getOptimizedMediaUrl(post.profiles.avatar_url),
            background_image_url: getOptimizedMediaUrl(post.profiles.background_image_url)
        } : null,
        community: post.community ? {
            ...post.community,
            icon_url: getOptimizedMediaUrl(post.community.icon_url),
            cover_url: getOptimizedMediaUrl(post.community.cover_url)
        } : null,
        original_post: post.original_post ? optimizePostMedia(post.original_post) : null
    };
}


export function useFeed(communityId?: string) {
    // 1. Use Global Store
    const { posts, setPosts, addPost, updatePost, removePost, commentsCache: comments, setCommentsCache: setComments } = useFeedStore();

    const [loading, setLoading] = useState(true);
    const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // Comment State
    const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
    const [loadingComments, setLoadingComments] = useState(false);

    // Pagination State
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [feedCursor, setFeedCursor] = useState<string | null>(null);
    const POSTS_PER_PAGE = 30;

    // Ticker event surfaced to FeedPage so LiveTicker doesn't need its own channel
    const [latestFeedEvent, setLatestFeedEvent] = useState<{ type: 'post' | 'like' | 'comment'; userId: string } | null>(null);

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setCurrentUserId(user.id);
                const { data } = await supabase
                    .from('profiles')
                    .select('id, name, username, avatar_url, background_image_url, role, is_admin, is_verified, university, location, headline, about, industry, skills, website, website_url, github_url, linkedin_url, instagram_url, twitter_url, facebook_url, points')
                    .eq('id', user.id)
                    .single();
                if (data) {
                    setCurrentUserProfile(data);
                    await fetchPosts(user.id);
                } else {
                    await fetchPosts(user.id);
                }
            } else {
                setCurrentUserId(null);
                setCurrentUserProfile(null);
                await fetchPosts();
            }
        };
        init();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                setCurrentUserId(session.user.id);
                supabase
                    .from('profiles')
                    .select('id, name, username, avatar_url, background_image_url, role, is_admin, is_verified, university, location, headline, about, industry, skills, website, website_url, github_url, linkedin_url, instagram_url, twitter_url, facebook_url, points')
                    .eq('id', session.user.id)
                    .single()
                    .then(({ data }) => {
                        if (data) setCurrentUserProfile(data);
                    });
            } else if (event === 'SIGNED_OUT') {
                setCurrentUserId(null);
                setCurrentUserProfile(null);
            }
        });

        // Single realtime channel for posts, likes, comments — shared with LiveTicker via latestFeedEvent
        const channel = supabase
            .channel('public:posts')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload) => {
                const newPost = payload.new as any;

                if (communityId) {
                    if (newPost.community_id !== communityId) return;
                } else {
                    if (newPost.community_id && !newPost.shared_to_feed) return;
                }

                fetchSinglePost(newPost.id);
                if (!communityId) setLatestFeedEvent({ type: 'post', userId: newPost.author_id });
            })
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'posts' }, (payload) => {
                removePost(payload.old.id);
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'likes' }, async (payload: any) => {
                const postId = payload.new?.post_id || payload.old?.post_id;
                const actorId = payload.new?.user_id || payload.old?.user_id;
                if (!postId) return;
                
                // Get fresh user ID to avoid closure staleness
                const { data: authData } = await supabase.auth.getUser();
                const sessionUserId = authData.user?.id;
                
                if (actorId && sessionUserId && actorId === sessionUserId) {
                    return; // Ignore own likes: Optimistic UI already handled this instantly
                }

                // Optimistic counter update for others' likes
                const post = useFeedStore.getState().posts.find(p => p.id === postId);
                if (post) {
                    const delta = payload.eventType === 'INSERT' ? 1 : -1;
                    updatePost({ ...post, likes_count: Math.max(0, (post.likes_count || 0) + delta) });
                }
                if (actorId && !communityId) setLatestFeedEvent({ type: 'like', userId: actorId });
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, (payload: any) => {
                const postId = payload.new?.post_id || payload.old?.post_id;
                const actorId = payload.new?.author_id;
                if (!postId) return;
                // Optimistic counter update — avoids a DB fetch per comment event
                const post = useFeedStore.getState().posts.find(p => p.id === postId);
                if (post) {
                    const delta = payload.eventType === 'INSERT' ? 1 : -1;
                    updatePost({ ...post, comments_count: Math.max(0, (post.comments_count || 0) + delta) });
                }
                if (actorId && !communityId) setLatestFeedEvent({ type: 'comment', userId: actorId });
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
            if (channel) {
                channel.unsubscribe();
                supabase.removeChannel(channel);
            }
        };
    }, [communityId]);

    // ── Realtime: live comment updates for the currently-open comment section ──
    useEffect(() => {
        if (!activeCommentPostId) return;

        const commentChannel = supabase
            .channel(`comments:${activeCommentPostId}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'comments', filter: `post_id=eq.${activeCommentPostId}` },
                async (payload) => {
                    const newComment = payload.new as any;
                    // Skip optimistic own comments — already added instantly in postComment()
                    setComments(prev => {
                        const existing = prev[activeCommentPostId] || [];
                        if (existing.some(c => c.id === newComment.id)) return prev;
                        // Fetch full comment with profile join
                        supabase
                            .from('comments')
                            .select('*, profiles:author_id(*)')
                            .eq('id', newComment.id)
                            .single()
                            .then(({ data }) => {
                                if (data) {
                                    setComments(p => {
                                        const list = p[activeCommentPostId] || [];
                                        if (list.some(c => c.id === data.id)) return p;
                                        return { ...p, [activeCommentPostId]: [...list, data] };
                                    });
                                }
                            });
                        return prev; // return unchanged; actual update happens in the async .then()
                    });
                }
            )
            .on(
                'postgres_changes',
                { event: 'DELETE', schema: 'public', table: 'comments', filter: `post_id=eq.${activeCommentPostId}` },
                (payload) => {
                    setComments(prev => {
                        const list = prev[activeCommentPostId] || [];
                        return { ...prev, [activeCommentPostId]: list.filter(c => c.id !== payload.old.id) };
                    });
                }
            )
            .subscribe();

        return () => {
            commentChannel.unsubscribe();
            supabase.removeChannel(commentChannel);
        };
    }, [activeCommentPostId]);

    const fetchPosts = async (userId?: string, isLoadMore = false) => {
        const isInitial = !isLoadMore;
        
        // Caching Logic: Context-aware cache check
        const currentContext = communityId || null;
        const cacheExists = useFeedStore.getState().posts.length > 0;
        const refreshNeeded = useFeedStore.getState().needsRefresh(currentContext);

        if (isInitial && cacheExists && !refreshNeeded) {
            setLoading(false);
            return; // Cache is fresh and matching context, skip network request entirely
        }

        if (isInitial) {
            if (!cacheExists || refreshNeeded) {
                setLoading(true);
            } else {
                setLoading(false); // We have data, don't show skeleton (silent refresh)
            }
        }

        // Cursor-based pagination: each page fetches exactly POSTS_PER_PAGE new rows
        const cursor = isLoadMore ? feedCursor : null;

        // ── Database Fetch ──────────────────────────────────────────────────
        let query = supabase
            .from('posts')
            .select(`
                *,
                profiles:author_id (id, name, username, avatar_url, is_verified, headline, role),
                community:community_id (id, name, slug, icon_url),
                original_post:original_post_id (
                    id, content, image_url, image_urls, video_url, created_at, author_id,
                    profiles:author_id (id, name, username, avatar_url, is_verified)
                ),
                actual_likes:likes(count),
                actual_comments:comments(count)
            `)
            .order('created_at', { ascending: false })
            .limit(POSTS_PER_PAGE);

        if (cursor) query = query.lt('created_at', cursor);

        if (communityId) {
            query = query.eq('community_id', communityId);
        } else {
            query = query.or('community_id.is.null,shared_to_feed.eq.true');
        }

        let { data, error } = await query;

        if (error) {
            console.error('Error fetching posts:', error);
            if (isInitial) setLoading(false);
            return;
        }

        if (data) {
            const VIP_EMAILS = ['oyasordaniel@gmail.com', 'akeledivine1@gmail.com'];

            // ── Minimal Aux Fetch (Only what's NOT cached in posts table) ──
            // We only need to know if the CURRENT USER liked or voted.
            // Global counts (likes_count, comments_count) are already in the 'data' from posts table!
            
            let userEngagementMap: Record<string, { userLiked: boolean; userVote: number | null }> = {};
            
            if (userId && data.length > 0) {
                const postIds = data.map((p: any) => p.id);
                
                const [likesResult, votesResult] = await Promise.all([
                    supabase.from('likes').select('post_id').in('post_id', postIds).eq('user_id', userId),
                    supabase.from('poll_votes').select('post_id, option_index').in('post_id', postIds).eq('user_id', userId)
                ]);

                if (likesResult.data) {
                    likesResult.data.forEach((l: any) => {
                        if (!userEngagementMap[l.post_id]) userEngagementMap[l.post_id] = { userLiked: false, userVote: null };
                        userEngagementMap[l.post_id].userLiked = true;
                    });
                }
                if (votesResult.data) {
                    votesResult.data.forEach((v: any) => {
                        if (!userEngagementMap[v.post_id]) userEngagementMap[v.post_id] = { userLiked: false, userVote: null };
                        userEngagementMap[v.post_id].userVote = v.option_index;
                    });
                }
            }

            let formatted = data.map((post: any) => optimizePostMedia({
                ...post,
                // Source of truth: actual count from table (Fallback to cached column)
                likes_count: post.actual_likes?.[0]?.count ?? post.likes_count ?? 0,
                comments_count: post.actual_comments?.[0]?.count ?? post.comments_count ?? 0,
                reposts_count: post.reposts_count || 0,
                // User-specific engagement
                user_has_liked: userEngagementMap[post.id]?.userLiked || false,
                user_vote: userEngagementMap[post.id]?.userVote ?? null,
                is_vip: VIP_EMAILS.includes(post.profiles?.email)
            }));

            // ── Engagement Algorithm ──
            const now = Date.now();
            formatted.forEach((post: any) => {
                const ageHours = (now - new Date(post.created_at).getTime()) / (1000 * 60 * 60);
                let score = 100;
                if (ageHours < 48) score += 50 * (1 - (ageHours / 48));
                if (post.is_vip && ageHours < 24) score += 200;
                if (post.profiles?.gold_verified) score *= 1.15;
                score += (post.likes_count * 1) + (post.comments_count * 3) + (post.reposts_count * 5);
                post._algorithmic_score = score;
            });

            formatted.sort((a: any, b: any) => b._algorithmic_score - a._algorithmic_score);

            if (isLoadMore) {
                setPosts([...useFeedStore.getState().posts, ...formatted], currentContext);
            } else {
                setPosts(formatted, currentContext);
            }

            setHasMore(formatted.length >= POSTS_PER_PAGE);
            if (formatted.length > 0) {
                const oldest = formatted.reduce((a: any, b: any) => a.created_at < b.created_at ? a : b);
                setFeedCursor(oldest.created_at);
            }
        }
        if (isInitial) setLoading(false);
    };

    const loadMorePosts = async () => {
        if (loadingMore || !hasMore) return;
        setLoadingMore(true);
        await fetchPosts(currentUserId || undefined, true);
        setLoadingMore(false);
    };

    const searchPosts = async (query: string) => {
        // If query is empty, reload default feed
        if (!query.trim()) {
            fetchPosts();
            return;
        }

        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        let dbQuery = supabase
            .from('posts')
            .select(`
            *,
            profiles: author_id(
                id,
                name,
                username,
                avatar_url,
                is_verified,
                headline,
                role,
                email,
                expected_graduation_year
            ),
                original_post: original_post_id(
                    id,
                    content,
                    image_url,
                    image_urls,
                    video_url,
                    created_at,
                    author_id,
                    profiles: author_id(
                        id,
                        name,
                        avatar_url,
                        is_verified
                    )
                ),
                actual_likes:likes(count),
                actual_comments:comments(count)
            `)
            .ilike('content', `%${query}%`)
            .order('created_at', { ascending: false })
            .limit(50);

        if (communityId) {
            dbQuery = dbQuery.eq('community_id', communityId);
        } else {
            // Main feed search also searches global posts? Or just posts.
            // If searching globally, we might remove the 'community_id is null' filter to find posts inside communities too.
            // But usually feed implies "public feed". Let's stick to global scope if not in community.
            // Or maybe search EVERYWHERE?
            // Let's search everywhere if global.
            // dbQuery = dbQuery.is('community_id', null); // UNCOMMENT TO RESTRICT
        }

        const { data, error } = await dbQuery;

        if (error) {
            console.error('Error searching posts:', error);
            setLoading(false);
            return;
        }

        if (data) {
            const postIds = data.map((p: any) => p.id);

            // Parallel fetch aux data
            const [likesResult, repostsResult] = await Promise.all([
                supabase.from('likes').select('post_id').in('post_id', postIds).eq('user_id', user.id),
                supabase.from('posts').select('original_post_id').in('original_post_id', postIds).eq('is_repost', true).eq('author_id', user.id)
            ]);

            const userLikedSet = new Set(likesResult.data?.map(l => l.post_id));
            const userRepostedSet = new Set(repostsResult.data?.map(r => r.original_post_id));

            const VIP_EMAILS = ['oyasordaniel@gmail.com', 'akeledivine1@gmail.com'];

            const formatted = data
                .map((post: any) => optimizePostMedia({
                    ...post,
                    likes_count: post.actual_likes?.[0]?.count ?? post.likes_count ?? 0,
                    comments_count: post.actual_comments?.[0]?.count ?? post.comments_count ?? 0,
                    reposts_count: post.reposts_count || 0,
                    user_has_liked: userLikedSet.has(post.id),
                    user_has_reposted: userRepostedSet.has(post.id),
                    is_vip: VIP_EMAILS.includes(post.profiles?.email)
                }));

            setPosts(formatted);
        }
        setLoading(false);
    };

    const fetchSinglePost = async (postId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        const { data } = await supabase
            .from('posts')
            .select(`
                *,
                profiles: author_id(id, name, username, avatar_url, is_verified, headline, role, email, expected_graduation_year),
                community: community_id(id, name, slug, icon_url),
                original_post: original_post_id (
                    id,
                    content,
                    image_url,
                    image_urls,
                    video_url,
                    created_at,
                    author_id,
                    profiles:author_id (id, name, username, avatar_url, is_verified)
                ),
                actual_likes:likes(count),
                actual_comments:comments(count)
            `)
            .eq('id', postId)
            .single();

        if (data) {
            // If viewing a specific community, verify this post belongs to it
            if (communityId && data.community_id !== communityId) return;

            const { data: likeData } = user 
                ? await supabase.from('likes').select('id').eq('post_id', data.id).eq('user_id', user.id).maybeSingle()
                : { data: null };

            const newPost = optimizePostMedia({
                ...data,
                likes_count: data.actual_likes?.[0]?.count ?? data.likes_count ?? 0,
                comments_count: data.actual_comments?.[0]?.count ?? data.comments_count ?? 0,
                user_has_liked: !!likeData
            });

            const exists = posts.some(p => p.id === newPost.id);
            if (exists) {
                updatePost(newPost);
            } else {
                addPost(newPost);
            }
        }
    };

    const createPost = async (content: string, imageFiles: File[], videoFile: File | null, targetCommunityId?: string, pollOptions?: string[]) => {
        if (!content.trim() && imageFiles.length === 0 && !videoFile) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const imageUrls: string[] = [];
        let videoUrl: string | null = null;
        const finalCommunityId = targetCommunityId || communityId;

        try {
            // ── Upload Images ──────────────────────────────────────────────────
            // Strategy: Try Cloudinary first (f_auto, q_auto, fl_lossy = ~70% smaller).
            // On ANY failure, fall back to Supabase silently so the post still goes through.
            // ── Upload Images (Parallel) ──────────────────────────────────────
            if (imageFiles.length > 0) {
                const uploadPromises = imageFiles.map(async (file) => {
                    let uploadedUrl: string | null = null;
                    
                    // Attempt 1: Cloudinary
                    if (cloudinaryService.isConfigured()) {
                        try {
                            const result = await cloudinaryService.uploadImage(file, {
                                folder: 'ulink/posts',
                            });
                            uploadedUrl = result.secureUrl;
                        } catch (cloudErr) {
                            console.warn('[Post image] Cloudinary upload failed, falling back to Supabase:', cloudErr);
                        }
                    }

                    // Attempt 2: Supabase fallback
                    if (!uploadedUrl) {
                        const fileExt = file.name.split('.').pop();
                        const fileName = `${Date.now()}_${Math.random()}.${fileExt}`;
                        const filePath = `posts/${fileName}`;
                        const { error: uploadError } = await supabase.storage
                            .from('post-images')
                            .upload(filePath, file);

                        if (!uploadError) {
                            const { data: { publicUrl } } = supabase.storage
                                .from('post-images')
                                .getPublicUrl(filePath);
                            uploadedUrl = publicUrl;
                        }
                    }
                    return uploadedUrl;
                });

                const results = await Promise.all(uploadPromises);
                imageUrls.push(...results.filter((url): url is string => !!url));
            }

            // ── Upload Video ────────────────────────────────────────────────────
            if (videoFile) {
                try {
                    const result = await cloudinaryService.uploadVideo(videoFile, {
                        folder: 'ulink/posts/videos',
                    });
                    videoUrl = result.secureUrl;
                } catch (videoErr) {
                    console.warn('[Post video] Cloudinary upload failed, falling back to Supabase:', videoErr);
                    
                    const fileExt = videoFile.name.split('.').pop();
                    const fileName = `video_${Date.now()}_${Math.random()}.${fileExt}`;
                    const filePath = `posts/${fileName}`;
                    const { error: uploadError } = await supabase.storage
                        .from('post-images')
                        .upload(filePath, videoFile);

                    if (uploadError) {
                        console.error('Error uploading video to Supabase:', videoFile.name, uploadError);
                        alert('Failed to upload video even after fallback. Please try a smaller file.');
                        throw uploadError;
                    }

                    const { data: { publicUrl } } = supabase.storage
                        .from('post-images')
                        .getPublicUrl(filePath);
                    videoUrl = publicUrl;
                }
            }


            const mainImageUrl = imageUrls.length > 0 ? imageUrls[0] : null;

            const { data, error } = await supabase
                .from('posts')
                .insert({
                    author_id: user.id,
                    content: content,
                    image_url: mainImageUrl, // Legacy
                    image_urls: imageUrls,
                    video_url: videoUrl,
                    community_id: finalCommunityId,
                    poll_options: pollOptions && pollOptions.length > 1 ? pollOptions : null,
                    poll_counts: pollOptions && pollOptions.length > 1 ? new Array(pollOptions.length).fill(0) : null
                })
                .select(`*, profiles: author_id(*), likes(user_id), comments(id)`)
                .single();

            if (error) throw error;
            if (data) {
                const newPost = optimizePostMedia({
                    ...data,
                    likes_count: 0,
                    comments_count: 0,
                    user_has_liked: false,
                    profiles: currentUserProfile || { id: user.id, name: 'You' }
                });
                addPost(newPost);

                // Notify mentioned users
                notifyMentionedUsers(content, data.id, user.id, 'post');
            }
        } catch (error) {
            console.error('Error creating post:', JSON.stringify(error, null, 2));
            alert('Failed to create post: ' + ((error as any).message || 'Unknown error'));
            throw error;
        }
    };

    const deletePost = async (postId: string) => {
        removePost(postId);
        const { error } = await supabase.from('posts').delete().eq('id', postId);
        if (error) {
            console.error('Error deleting post:', error);
        }
    };

    const toggleLike = async (post: Post) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const isLiked = post.user_has_liked;
        const newLikeCount = isLiked ? (post.likes_count || 0) - 1 : (post.likes_count || 0) + 1;

        updatePost({
            ...post,
            user_has_liked: !isLiked,
            likes_count: newLikeCount
        });

        try {
            if (isLiked) {
                const { error } = await supabase.from('likes').delete().eq('post_id', post.id).eq('user_id', user.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('likes').insert({ post_id: post.id, user_id: user.id });
                if (error) throw error;
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            // Rollback optimistic update
            updatePost(post);
        }
    };

    const toggleRepost = async (post: Post, comment?: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Determine the target post (always the original content)
        // If the post is itself a repost, we want to repost the ORIGINAL post, not the repost.
        const targetPost = post.is_repost && post.original_post ? post.original_post : post;
        const targetPostId = targetPost.id;

        // Query to check if user has reposted the target
        const { data: existingRepost } = await supabase
            .from('posts')
            .select('id')
            .eq('author_id', user.id)
            .eq('original_post_id', targetPostId)
            .eq('is_repost', true)
            .maybeSingle();

        const hasReposted = !!existingRepost;

        if (hasReposted) {
            // Undo repost - delete the repost(s)
            const newRepostCount = Math.max((targetPost.reposts_count || 0) - 1, 0);

            // Update the target post in store
            updatePost({
                ...targetPost,
                user_has_reposted: false,
                reposts_count: newRepostCount
            });

            if (post.id !== targetPost.id) {
                updatePost({
                    ...post,
                    user_has_reposted: false,
                    reposts_count: newRepostCount
                });
            }

            await supabase
                .from('posts')
                .delete()
                .eq('author_id', user.id)
                .eq('original_post_id', targetPostId)
                .eq('is_repost', true);
        } else {
            // Create repost of the TARGET
            const newRepostCount = (targetPost.reposts_count || 0) + 1;

            updatePost({
                ...targetPost,
                user_has_reposted: true,
                reposts_count: newRepostCount
            });

            if (post.id !== targetPost.id) {
                updatePost({
                    ...post,
                    user_has_reposted: true,
                    reposts_count: newRepostCount
                });
            }

            const { data, error } = await supabase
                .from('posts')
                .insert({
                    author_id: user.id,
                    content: comment || null,
                    image_url: null,
                    image_urls: null,
                    video_url: null,
                    is_repost: true,
                    original_post_id: targetPostId,
                    repost_comment: comment || null,
                    community_id: communityId || null
                })
                .select(`
            *,
            profiles: author_id(*)
                `)
                .single();

            if (error) {
                console.error('Error creating repost:', error);
                // Revert optimistic update
                updatePost({
                    ...targetPost,
                    user_has_reposted: false,
                    reposts_count: (targetPost.reposts_count || 0)
                });
                if (post.id !== targetPost.id) {
                    updatePost({
                        ...post,
                        user_has_reposted: false,
                        reposts_count: (targetPost.reposts_count || 0)
                    });
                }
                alert('Failed to repost: ' + (error.message || 'Unknown error'));
            } else if (data) {
                // Instant UI Update: Add the nested repost to the feed
                const newRepostItem: any = optimizePostMedia({
                    ...data,
                    likes_count: 0,
                    comments_count: 0,
                    user_has_liked: false,
                    original_post: targetPost,
                    profiles: currentUserProfile || data.profiles
                });
                addPost(newRepostItem);
            }
        }
    };

    const toggleComments = async (postId: string) => {
        if (activeCommentPostId === postId) {
            setActiveCommentPostId(null);
        } else {
            setActiveCommentPostId(postId);
            if (!comments[postId]) {
                setLoadingComments(true);
                const { data } = await supabase
                    .from('comments')
                    .select(`*, profiles: author_id(*)`)
                    .eq('post_id', postId)
                    .order('created_at', { ascending: true });
                if (data) setComments(prev => ({ 
                    ...prev, 
                    [postId]: data.map((c: any) => ({
                        ...c,
                        sticker_url: getOptimizedMediaUrl(c.sticker_url),
                        profiles: c.profiles ? {
                            ...c.profiles,
                            avatar_url: getOptimizedMediaUrl(c.profiles.avatar_url)
                        } : null
                    }))
                }));
                setLoadingComments(false);
            }
        }
    };

    const postComment = async (postId: string, content: string | null, stickerUrl?: string, type: 'text' | 'sticker' | 'image' = 'text', parentId?: string) => {
        if (!content?.trim() && !stickerUrl) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const tempId = `temp - ${Date.now()} `;
        const optimisticComment: any = {
            id: tempId,
            post_id: postId,
            author_id: user.id,
            content: content,
            sticker_url: getOptimizedMediaUrl(stickerUrl),
            type: type,
            parent_id: parentId,
            created_at: new Date().toISOString(),
            profiles: currentUserProfile ? {
                ...currentUserProfile,
                avatar_url: getOptimizedMediaUrl(currentUserProfile.avatar_url)
            } : { id: user.id, name: 'You' }
        };

        setComments(prev => ({ ...prev, [postId]: [...(prev[postId] || []), optimisticComment] }));

        const post = posts.find(p => p.id === postId);
        if (post) {
            updatePost({ ...post, comments_count: (post.comments_count || 0) + 1 });
        }

        const { data, error } = await supabase
            .from('comments')
            .insert({
                post_id: postId,
                author_id: user.id,
                content: content,
                sticker_url: stickerUrl,
                type: type,
                parent_id: parentId
            })
            .select(`*, profiles: author_id(*)`)
            .single();

        if (error) {
            setComments(prev => ({ ...prev, [postId]: prev[postId].filter(c => c.id !== tempId) }));
            if (post) updatePost({ ...post, comments_count: (post.comments_count || 0) - 1 });
            throw error;
        }

        if (data) {
            const formattedComment = {
                ...data,
                sticker_url: getOptimizedMediaUrl(data.sticker_url),
                profiles: data.profiles ? {
                    ...data.profiles,
                    avatar_url: getOptimizedMediaUrl(data.profiles.avatar_url)
                } : null
            };
            setComments(prev => ({ ...prev, [postId]: prev[postId].map(c => c.id === tempId ? formattedComment : c) }));

            // Notify mentioned users in comment if content exists
            if (content) {
                notifyMentionedUsers(content, postId, user.id, 'comment');
            }
        }
    };

    const reportPost = async (postId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        try {
            const { error } = await supabase.from('reports').insert({
                reporter_id: user.id,
                target_id: postId,
                type: 'post',
                reason: 'Inappropriate Content',
                status: 'pending'
            });

            if (error) throw error;
            alert('Post reported. Thank you for helping keep UniLink safe.');
        } catch (error) {
            console.error('Error reporting post:', error);
            alert('Failed to report post. Please try again.');
        }
    };

    const votePoll = async (postId: string, optionIndex: number) => {
        const post = posts.find(p => p.id === postId);
        if (!post || !post.poll_options || !post.poll_counts || !currentUserId) return;

        // Optimistic Update
        const newCounts = [...post.poll_counts];
        const oldVote = post.user_vote;

        if (oldVote !== null && oldVote !== undefined) {
            newCounts[oldVote] = Math.max(0, newCounts[oldVote] - 1);
        }
        newCounts[optionIndex] = (newCounts[optionIndex] || 0) + 1;

        updatePost({
            ...post,
            poll_counts: newCounts,
            user_vote: optionIndex
        });

        // Database Update
        const { error } = await supabase.from('poll_votes').upsert({
            post_id: postId,
            user_id: currentUserId,
            option_index: optionIndex
        }, { onConflict: 'post_id, user_id' });

        if (error) {
            console.error('Vote failed:', error);
            // Revert on error (could actally fetchSinglePost to be safer)
            fetchSinglePost(postId);
            alert('Failed to register vote');
        }
    };

    const deleteComment = async (postId: string, commentId: string) => {
        setComments(prev => ({
            ...prev,
            [postId]: prev[postId].filter(c => c.id !== commentId)
        }));

        const post = posts.find(p => p.id === postId);
        if (post) {
            updatePost({ ...post, comments_count: Math.max((post.comments_count || 0) - 1, 0) });
        }

        const { error } = await supabase.from('comments').delete().eq('id', commentId);
        if (error) {
            console.error('Error deleting comment:', error);
            alert('Failed to delete comment');
        }
    };

    return {
        posts,
        loading,
        currentUserId,
        createPost,
        deletePost,
        toggleLike,
        toggleRepost,
        toggleComments,
        activeCommentPostId,
        comments,
        loadingComments,
        postComment,
        deleteComment,
        reportPost,
        votePoll,
        searchPosts,
        fetchSinglePost,
        currentUserProfile,
        hasMore,
        loadingMore,
        loadMorePosts,
        latestFeedEvent,
    };
}
