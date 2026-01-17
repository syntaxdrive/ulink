import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import type { Post, Comment } from '../../../types';
import { useFeedStore } from '../../../stores/useFeedStore';

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

        // Realtime Subscription (Simplified for now - strictly main feed or all)
        const channel = supabase
            .channel('public:posts')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload) => {
                // Ideally filter here if (communityId && payload.new.community_id !== communityId) return;
                fetchSinglePost(payload.new.id);
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

        let query = supabase
            .from('posts')
            .select(`
                *,
                profiles:author_id (*),
                likes (user_id),
                comments (id)
            `)
            .order('created_at', { ascending: false });

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

            // Safe Poll Vote Fetching
            let pollVotesMap: Record<string, number> = {};
            if (userId && data.length > 0) {
                const postIds = data.map((p: any) => p.id);
                // Attempt to fetch votes, ignoring errors (e.g. if table missing)
                const { data: votes } = await supabase
                    .from('poll_votes')
                    .select('post_id, option_index')
                    .eq('user_id', userId)
                    .in('post_id', postIds);

                if (votes) {
                    votes.forEach((v: any) => { pollVotesMap[v.post_id] = v.option_index; });
                }
            }

            let formatted = data.map((post: any) => ({
                ...post,
                likes_count: post.likes ? post.likes.length : 0,
                comments_count: post.comments ? post.comments.length : 0,
                user_has_liked: userId ? post.likes.some((like: any) => like.user_id === userId) : false,
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

    const createPost = async (content: string, imageFiles: File[], targetCommunityId?: string, pollOptions?: string[]) => {
        if (!content.trim() && imageFiles.length === 0) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const imageUrls: string[] = [];
        const finalCommunityId = targetCommunityId || communityId;

        try {
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

            const mainImageUrl = imageUrls.length > 0 ? imageUrls[0] : null;

            const { data, error } = await supabase
                .from('posts')
                .insert({
                    author_id: user.id,
                    content: content,
                    image_url: mainImageUrl,
                    image_urls: imageUrls,
                    community_id: finalCommunityId, // Use finalCommunityId which we calculated above
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
        toggleComments,
        activeCommentPostId,
        comments,
        loadingComments,
        postComment,
        deleteComment,
        reportPost,
        votePoll
    };
}
