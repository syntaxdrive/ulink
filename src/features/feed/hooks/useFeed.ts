import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import type { Post, Comment } from '../../../types';
import { useFeedStore } from '../../../stores/useFeedStore';
import { notifyMentionedUsers } from '../../../utils/mentions';

export function useFeed(communityId?: string) {
    // 1. Use Global Store
    const { posts, setPosts, addPost, updatePost, removePost, needsRefresh } = useFeedStore();

    const [loading, setLoading] = useState(true);
    const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // Comment State (Still local as it's ephemeral UI state)
    const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
    const [comments, setComments] = useState<Record<string, Comment[]>>({});
    const [loadingComments, setLoadingComments] = useState(false);

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setCurrentUserId(user.id);
                // Background fetch profile
                supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
                    if (data) setCurrentUserProfile(data);
                });
            }

            // Always fetch if communityId is present (context switch)
            // or if traditional refresh is needed
            if (communityId || needsRefresh() || posts.length === 0) {
                await fetchPosts(user?.id);
            } else {
                setLoading(false); // Use cached data
            }
        };
        init();

        // Realtime Subscription with proper filtering
        const channel = supabase
            .channel('public:posts')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload) => {
                // Filter posts based on context to prevent cross-contamination
                const newPost = payload.new as any;

                if (communityId) {
                    // In community: only show posts from THIS community
                    if (newPost.community_id !== communityId) return;
                } else {
                    // In main feed: only show posts NOT in any community
                    if (newPost.community_id !== null) return;
                }

                fetchSinglePost(newPost.id);
            })
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'posts' }, (payload) => {
                removePost(payload.old.id);
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'likes' }, (payload: any) => {
                const postId = payload.new?.post_id || payload.old?.post_id;
                if (postId) fetchSinglePost(postId);
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, (payload: any) => {
                const postId = payload.new?.post_id || payload.old?.post_id;
                if (postId) fetchSinglePost(postId);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [communityId]);

    const fetchPosts = async (userId?: string) => {
        setLoading(true);

        // Optimized query with pagination and selective fields
        let query = supabase
            .from('posts')
            .select(`
                *,
                profiles:author_id (
                    id,
                    name,
                    avatar_url,
                    is_verified,
                    gold_verified,
                    headline,
                    role,
                    email
                ),
                original_post:original_post_id (
                    id,
                    content,
                    image_url,
                    image_urls,
                    video_url,
                    created_at,
                    author_id,
                    profiles:author_id (
                        id,
                        name,
                        avatar_url,
                        is_verified
                    )
                )
            `)
            .order('created_at', { ascending: false })
            .limit(20); // Pagination: Load 20 posts at a time

        if (communityId) {
            // Community Feed: Only show posts from this specific community
            query = query.eq('community_id', communityId);
        } else {
            // Main Feed: Only show posts NOT in any community (global posts)
            query = query.is('community_id', null);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching posts:', error);
        }

        if (!error && data) {
            // VIP Users List
            const VIP_EMAILS = ['oyasordaniel@gmail.com', 'akeledivine1@gmail.com'];

            // Fetch counts separately for better performance
            const postIds = data.map((p: any) => p.id);

            // Fetch likes count and user's like status
            const likesPromise = supabase
                .from('likes')
                .select('post_id, user_id')
                .in('post_id', postIds);

            // Fetch comments count
            const commentsPromise = supabase
                .from('comments')
                .select('post_id')
                .in('post_id', postIds);

            // Fetch reposts count
            const repostsPromise = supabase
                .from('posts')
                .select('original_post_id')
                .in('original_post_id', postIds)
                .eq('is_repost', true);

            // Fetch poll votes
            let pollVotesPromise: PromiseLike<{ data: any[] | null; error?: any }> = Promise.resolve({ data: null });
            if (userId) {
                pollVotesPromise = supabase
                    .from('poll_votes')
                    .select('post_id, option_index')
                    .eq('user_id', userId)
                    .in('post_id', postIds);
            }

            // Execute all queries in parallel
            const [likesResult, commentsResult, repostsResult, pollVotesResult] = await Promise.all([
                likesPromise,
                commentsPromise,
                repostsPromise,
                pollVotesPromise
            ]);

            // Build count maps
            const likesMap: Record<string, { count: number; userLiked: boolean }> = {};
            const commentsMap: Record<string, number> = {};
            const repostsMap: Record<string, { count: number; userReposted: boolean }> = {};
            const pollVotesMap: Record<string, number> = {};

            // Process likes
            if (likesResult.data) {
                likesResult.data.forEach((like: any) => {
                    if (!likesMap[like.post_id]) {
                        likesMap[like.post_id] = { count: 0, userLiked: false };
                    }
                    likesMap[like.post_id].count++;
                    if (userId && like.user_id === userId) {
                        likesMap[like.post_id].userLiked = true;
                    }
                });
            }

            // Process comments
            if (commentsResult.data) {
                commentsResult.data.forEach((comment: any) => {
                    commentsMap[comment.post_id] = (commentsMap[comment.post_id] || 0) + 1;
                });
            }

            // Process reposts
            if (repostsResult.data) {
                repostsResult.data.forEach((repost: any) => {
                    if (!repostsMap[repost.original_post_id]) {
                        repostsMap[repost.original_post_id] = { count: 0, userReposted: false };
                    }
                    repostsMap[repost.original_post_id].count++;
                    if (userId && repost.author_id === userId) {
                        repostsMap[repost.original_post_id].userReposted = true;
                    }
                });
            }

            // Process poll votes
            if (pollVotesResult.data) {
                pollVotesResult.data.forEach((v: any) => {
                    pollVotesMap[v.post_id] = v.option_index;
                });
            }

            let formatted = data.map((post: any) => ({
                ...post,
                likes_count: likesMap[post.id]?.count || 0,
                comments_count: commentsMap[post.id] || 0,
                reposts_count: repostsMap[post.id]?.count || 0,
                user_has_liked: likesMap[post.id]?.userLiked || false,
                user_has_reposted: repostsMap[post.id]?.userReposted || false,
                user_vote: pollVotesMap[post.id] ?? null,
                is_vip: VIP_EMAILS.includes(post.profiles?.email)
            }));

            // SMART ALGORITHM
            const ONE_DAY = 24 * 60 * 60 * 1000;
            formatted.sort((a: any, b: any) => {
                const now = Date.now();
                const aTime = new Date(a.created_at).getTime();
                const bTime = new Date(b.created_at).getTime();
                const aIsRecent = (now - aTime) < ONE_DAY;
                const bIsRecent = (now - bTime) < ONE_DAY;

                if (a.is_vip && aIsRecent && (!b.is_vip || !bIsRecent)) return -1;
                if (b.is_vip && bIsRecent && (!a.is_vip || !aIsRecent)) return 1;

                return bTime - aTime;
            });

            setPosts(formatted);
        }
        setLoading(false);
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
                profiles:author_id (
                    id,
                    name,
                    avatar_url,
                    is_verified,
                    gold_verified,
                    headline,
                    role,
                    email
                ),
                original_post:original_post_id (
                    id,
                    content,
                    image_url,
                    image_urls,
                    video_url,
                    created_at,
                    author_id,
                    profiles:author_id (
                        id,
                        name,
                        avatar_url,
                        is_verified
                    )
                )
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
            const likesPromise = supabase.from('likes').select('post_id, user_id').in('post_id', postIds);
            const commentsPromise = supabase.from('comments').select('post_id').in('post_id', postIds);
            const repostsPromise = supabase.from('posts').select('original_post_id, author_id').in('original_post_id', postIds).eq('is_repost', true);

            const [likesResult, commentsResult, repostsResult] = await Promise.all([likesPromise, commentsPromise, repostsPromise]);

            const likesMap: Record<string, any> = {};
            const commentsMap: Record<string, number> = {};
            const repostsMap: Record<string, { count: number; userReposted: boolean }> = {};

            likesResult.data?.forEach((l: any) => {
                if (!likesMap[l.post_id]) likesMap[l.post_id] = { count: 0, userLiked: false };
                likesMap[l.post_id].count++;
                if (user && l.user_id === user.id) likesMap[l.post_id].userLiked = true;
            });

            commentsResult.data?.forEach((c: any) => commentsMap[c.post_id] = (commentsMap[c.post_id] || 0) + 1);

            repostsResult.data?.forEach((r: any) => {
                if (!repostsMap[r.original_post_id]) repostsMap[r.original_post_id] = { count: 0, userReposted: false };
                repostsMap[r.original_post_id].count++;
                if (user && r.author_id === user.id) repostsMap[r.original_post_id].userReposted = true;
            });

            const VIP_EMAILS = ['oyasordaniel@gmail.com', 'akeledivine1@gmail.com'];

            const formatted = data.map((post: any) => ({
                ...post,
                likes_count: likesMap[post.id]?.count || 0,
                comments_count: commentsMap[post.id] || 0,
                reposts_count: repostsMap[post.id]?.count || 0,
                user_has_liked: likesMap[post.id]?.userLiked || false,
                user_has_reposted: repostsMap[post.id]?.userReposted || false,
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
            .select(`*, profiles:author_id (*), likes (user_id), comments (id)`)
            .eq('id', postId)
            .single();

        if (data) {
            // If viewing a specific community, verify this post belongs to it
            if (communityId && data.community_id !== communityId) return;

            const newPost = {
                ...data,
                likes_count: data.likes ? data.likes.length : 0,
                comments_count: data.comments ? data.comments.length : 0,
                user_has_liked: user ? data.likes.some((like: any) => like.user_id === user.id) : false
            };

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
            // Upload Images
            for (const file of imageFiles) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}_${Math.random()}.${fileExt}`;
                const filePath = `posts/${fileName}`;
                const { error: uploadError } = await supabase.storage.from('post-images').upload(filePath, file);

                if (uploadError) {
                    console.error('Error uploading file:', file.name, uploadError);
                    continue;
                }

                const { data: { publicUrl } } = supabase.storage.from('post-images').getPublicUrl(filePath);
                imageUrls.push(publicUrl);
            }

            // Upload Video
            if (videoFile) {
                const fileExt = videoFile.name.split('.').pop();
                const fileName = `video_${Date.now()}_${Math.random()}.${fileExt}`;
                const filePath = `posts/${fileName}`;
                const { error: uploadError } = await supabase.storage.from('post-images').upload(filePath, videoFile);

                if (uploadError) {
                    console.error('Error uploading video:', videoFile.name, uploadError);
                    alert('Failed to upload video');
                    throw uploadError;
                }

                const { data: { publicUrl } } = supabase.storage.from('post-images').getPublicUrl(filePath);
                videoUrl = publicUrl;
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
                .select(`*, profiles:author_id (*), likes (user_id), comments (id)`)
                .single();

            if (error) throw error;
            if (data) {
                const newPost = {
                    ...data,
                    likes_count: 0,
                    comments_count: 0,
                    user_has_liked: false,
                    profiles: currentUserProfile || { id: user.id, name: 'You' }
                };
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

        if (isLiked) {
            await supabase.from('likes').delete().match({ post_id: post.id, user_id: user.id });
        } else {
            await supabase.from('likes').insert({ post_id: post.id, user_id: user.id });
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
                    profiles:author_id (*)
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
                const newRepostItem: any = {
                    ...data,
                    likes_count: 0,
                    comments_count: 0,
                    user_has_liked: false,
                    original_post: targetPost,
                    profiles: currentUserProfile || data.profiles
                };
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
                    .select(`*, profiles:author_id (*)`)
                    .eq('post_id', postId)
                    .order('created_at', { ascending: true });
                if (data) setComments(prev => ({ ...prev, [postId]: data }));
                setLoadingComments(false);
            }
        }
    };

    const postComment = async (postId: string, content: string) => {
        if (!content.trim()) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const tempId = `temp-${Date.now()}`;
        const optimisticComment: any = {
            id: tempId,
            post_id: postId,
            author_id: user.id,
            content: content,
            created_at: new Date().toISOString(),
            profiles: currentUserProfile || { id: user.id, name: 'You' }
        };

        setComments(prev => ({ ...prev, [postId]: [...(prev[postId] || []), optimisticComment] }));

        const post = posts.find(p => p.id === postId);
        if (post) {
            updatePost({ ...post, comments_count: (post.comments_count || 0) + 1 });
        }

        const { data, error } = await supabase
            .from('comments')
            .insert({ post_id: postId, author_id: user.id, content: content })
            .select(`*, profiles:author_id (*)`)
            .single();

        if (error) {
            setComments(prev => ({ ...prev, [postId]: prev[postId].filter(c => c.id !== tempId) }));
            if (post) updatePost({ ...post, comments_count: (post.comments_count || 0) - 1 });
            throw error;
        }

        if (data) {
            setComments(prev => ({ ...prev, [postId]: prev[postId].map(c => c.id === tempId ? data : c) }));

            // Notify mentioned users in comment
            notifyMentionedUsers(content, postId, user.id, 'comment');
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
        currentUserProfile
    };
}
