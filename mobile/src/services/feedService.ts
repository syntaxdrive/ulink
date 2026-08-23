import { supabase } from '../lib/supabase';
import { apiClient } from '../api/client';

export interface FeedAuthor {
  id: string;
  name: string | null;
  username: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  university: string | null;
}

export interface FeedPost {
  id: string;
  author_id?: string;
  content: string | null;
  image_url: string | null;
  image_urls?: string[];
  video_url?: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_has_liked?: boolean;
  is_repost?: boolean;
  repost_comment?: string | null;
  original_post_id?: string | null;
  original_post?: {
    id: string;
    content: string | null;
    image_url: string | null;
    image_urls?: string[];
    video_url?: string | null;
    created_at: string;
    author?: FeedAuthor;
    poll_options?: string[] | null;
    poll_counts?: number[] | null;
    user_vote?: number | null;
  } | null;
  poll_options?: string[] | null;
  poll_counts?: number[] | null;
  user_vote?: number | null;
  author: FeedAuthor;
}

export interface CommentItem {
  id: string;
  content: string;
  sticker_url?: string | null;
  created_at: string;
  author: {
    id: string;
    name: string | null;
    username: string | null;
    avatar_url: string | null;
    is_verified?: boolean;
  };
}

/**
 * FeedService — Modular data layer for feed, posts, likes, comments, and reshares.
 * Uses Supabase (PostgreSQL) directly with live relational count aggregation,
 * with graceful fallback to NestJS API client.
 */
export const FeedService = {
  /**
   * Fetch campus feed posts with real-time actual likes, comments, and author hydration
   */
  async getFeed(currentUserId?: string | null, limit = 100): Promise<FeedPost[]> {
    try {
      // 1. Fetch general feed posts (excluding unshared community posts)
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:author_id(
            id,
            name,
            username,
            avatar_url,
            is_verified,
            university
          ),
          actual_likes:likes(count),
          actual_comments:comments(count)
        `)
        .or('community_id.is.null,shared_to_feed.eq.true')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      let rawPosts: any[] = data || [];

      // 2. Identify missing authors and original reposts to hydrate in batch
      const missingAuthorIds = new Set<string>();
      const originalPostIds = new Set<string>();

      rawPosts.forEach((p) => {
        if (!p.profiles && p.author_id) {
          missingAuthorIds.add(p.author_id);
        }
        if (p.is_repost && p.original_post_id) {
          originalPostIds.add(p.original_post_id);
        }
      });

      // Hydrate missing profiles
      let profileMap = new Map<string, any>();
      if (missingAuthorIds.size > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name, username, avatar_url, is_verified, university')
          .in('id', Array.from(missingAuthorIds));

        if (profiles) {
          profiles.forEach((prof: any) => profileMap.set(prof.id, prof));
        }
      }

      // Hydrate original reposts
      let originalPostMap = new Map<string, any>();
      if (originalPostIds.size > 0) {
        const { data: originals } = await supabase
          .from('posts')
          .select(`
            *,
            profiles:author_id(
              id,
              name,
              username,
              avatar_url,
              is_verified,
              university
            )
          `)
          .in('id', Array.from(originalPostIds));

        if (originals) {
          originals.forEach((orig: any) => {
            originalPostMap.set(orig.id, {
              ...orig,
              author: orig.profiles || profileMap.get(orig.author_id),
            });
          });
        }
      }

      // 3. User like states and poll vote states
      let likedPostIds = new Set<string>();
      let userVotesMap = new Map<string, number>();

      if (currentUserId && rawPosts.length > 0) {
        const postIds = rawPosts.map((p: any) => p.id);
        const [likesRes, votesRes] = await Promise.all([
          supabase
            .from('likes')
            .select('post_id')
            .eq('user_id', currentUserId)
            .in('post_id', postIds),
          supabase
            .from('poll_votes')
            .select('post_id, option_index')
            .eq('user_id', currentUserId)
            .in('post_id', postIds),
        ]);

        if (likesRes.data) {
          likedPostIds = new Set(likesRes.data.map((l: any) => l.post_id));
        }
        if (votesRes.data) {
          votesRes.data.forEach((v: any) => userVotesMap.set(v.post_id, v.option_index));
        }
      }

      return rawPosts.map((p: any) => {
        const authorProfile = p.profiles || profileMap.get(p.author_id);
        const actualLikes = p.actual_likes?.[0]?.count ?? p.likes_count ?? 0;
        const actualComments = p.actual_comments?.[0]?.count ?? p.comments_count ?? 0;

        return {
          ...p,
          likes_count: actualLikes,
          comments_count: actualComments,
          image_urls: Array.isArray(p.image_urls) ? p.image_urls : p.image_urls ? [p.image_urls] : [],
          video_url: p.video_url || null,
          poll_options: Array.isArray(p.poll_options) && p.poll_options.length > 0 ? p.poll_options : null,
          poll_counts: Array.isArray(p.poll_counts) ? p.poll_counts : (p.poll_options ? p.poll_options.map(() => 0) : null),
          user_vote: userVotesMap.has(p.id) ? userVotesMap.get(p.id) : null,
          author: authorProfile || {
            id: p.author_id,
            name: 'Student',
            username: 'user',
            avatar_url: null,
            is_verified: false,
            university: null,
          },
          original_post: p.original_post_id ? originalPostMap.get(p.original_post_id) : null,
          user_has_liked: likedPostIds.has(p.id),
        };
      });
    } catch (supabaseError) {
      console.warn('Supabase getFeed failed, trying NestJS backend fallback...', supabaseError);
      // 2. Fallback: NestJS API
      const res = await apiClient.get('/feed');
      return res.data?.posts || [];
    }
  },

  /**
   * Toggle like on a post
   */
  async toggleLike(postId: string, userId: string, currentlyLiked: boolean): Promise<boolean> {
    try {
      if (currentlyLiked) {
        await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', userId);
        const { count } = await supabase.from('likes').select('*', { count: 'exact', head: true }).eq('post_id', postId);
        await supabase.from('posts').update({ likes_count: count || 0 }).eq('id', postId);
      } else {
        await supabase.from('likes').insert({ post_id: postId, user_id: userId });
        const { count } = await supabase.from('likes').select('*', { count: 'exact', head: true }).eq('post_id', postId);
        await supabase.from('posts').update({ likes_count: count || 1 }).eq('id', postId);
      }
      return !currentlyLiked;
    } catch (err) {
      console.warn('Supabase toggleLike failed, falling back to NestJS...', err);
      await apiClient.post(`/posts/${postId}/like`);
      return !currentlyLiked;
    }
  },

  /**
   * Vote in a post poll
   */
  async votePoll(postId: string, optionIndex: number, currentUserId: string): Promise<number[]> {
    try {
      const { data: post } = await supabase
        .from('posts')
        .select('poll_options, poll_counts')
        .eq('id', postId)
        .single();

      if (!post || !post.poll_options) return [];

      let counts = Array.isArray(post.poll_counts) ? [...post.poll_counts] : post.poll_options.map(() => 0);
      while (counts.length < post.poll_options.length) counts.push(0);

      const { data: existingVote } = await supabase
        .from('poll_votes')
        .select('id, option_index')
        .eq('post_id', postId)
        .eq('user_id', currentUserId)
        .maybeSingle();

      if (existingVote) {
        if (existingVote.option_index === optionIndex) return counts;
        counts[existingVote.option_index] = Math.max(0, (counts[existingVote.option_index] || 1) - 1);
        await supabase.from('poll_votes').delete().eq('id', existingVote.id);
      }

      counts[optionIndex] = (counts[optionIndex] || 0) + 1;

      await supabase.from('poll_votes').insert({
        post_id: postId,
        user_id: currentUserId,
        option_index: optionIndex,
      });

      await supabase
        .from('posts')
        .update({ poll_counts: counts })
        .eq('id', postId);

      return counts;
    } catch (e) {
      console.warn('Error voting on poll:', e);
      return [];
    }
  },

  /**
   * Repost / Reshare a post to campus feed
   */
  async repost(postId: string, userId: string, comment?: string): Promise<void> {
    try {
      await supabase.from('posts').insert({
        author_id: userId,
        original_post_id: postId,
        is_repost: true,
        repost_comment: comment || null,
        likes_count: 0,
        comments_count: 0,
      });
    } catch (err) {
      console.warn('Supabase repost failed, falling back to NestJS...', err);
      await apiClient.post(`/posts/${postId}/repost`, { comment });
    }
  },

  /**
   * Get comments for a post
   */
  async getComments(postId: string): Promise<CommentItem[]> {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          sticker_url,
          created_at,
          author_id,
          profiles:author_id(
            id,
            name,
            username,
            avatar_url,
            is_verified
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;

      return (data || []).map((c: any) => ({
        id: c.id,
        content: c.content || '',
        sticker_url: c.sticker_url,
        created_at: c.created_at,
        author: c.profiles || {
          id: c.author_id,
          name: 'Student',
          username: 'user',
          avatar_url: null,
          is_verified: false,
        },
      }));
    } catch (err) {
      console.warn('Supabase getComments failed, falling back to NestJS...', err);
      const res = await apiClient.get(`/posts/${postId}/comments`);
      return res.data?.comments || [];
    }
  },

  /**
   * Post a new comment
   */
  async addComment(postId: string, userId: string, content: string): Promise<CommentItem> {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          author_id: userId,
          content,
        })
        .select(`
          id,
          content,
          sticker_url,
          created_at,
          author_id,
          profiles:author_id(
            id,
            name,
            username,
            avatar_url,
            is_verified
          )
        `)
        .single();

      if (error) throw error;

      // Update comments_count on post with exact count
      const { count } = await supabase.from('comments').select('*', { count: 'exact', head: true }).eq('post_id', postId);
      await supabase.from('posts').update({
        comments_count: count || 1,
      }).eq('id', postId);

      return {
        id: data.id,
        content: data.content,
        sticker_url: data.sticker_url,
        created_at: data.created_at,
        author: (data as any).profiles || {
          id: userId,
          name: 'You',
          username: 'user',
          avatar_url: null,
          is_verified: false,
        },
      };
    } catch (err) {
      console.warn('Supabase addComment failed, falling back to NestJS...', err);
      const res = await apiClient.post(`/posts/${postId}/comments`, { content });
      return res.data;
    }
  },

  /**
   * Delete a comment (by author)
   */
  async deleteComment(commentId: string, postId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('author_id', userId);

      if (error) throw error;

      // Update comments_count on post
      const { count } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      await supabase
        .from('posts')
        .update({ comments_count: count || 0 })
        .eq('id', postId);
    } catch (err) {
      console.warn('Supabase deleteComment failed, falling back to NestJS...', err);
      await apiClient.delete(`/posts/${postId}/comments/${commentId}`);
    }
  },

  /**
   * Create a new post
   */
  async createPost(data: {
    userId: string;
    content: string;
    imageUrl?: string | null;
    imageUrls?: string[] | null;
    videoUrl?: string | null;
    communityId?: string | null;
    pollOptions?: string[] | null;
  }): Promise<void> {
    try {
      const firstImage = data.imageUrls && data.imageUrls.length > 0 ? data.imageUrls[0] : (data.imageUrl || null);
      const allImages = data.imageUrls && data.imageUrls.length > 0 ? data.imageUrls : (data.imageUrl ? [data.imageUrl] : null);

      const { error } = await supabase.from('posts').insert({
        author_id: data.userId,
        content: data.content,
        image_url: firstImage,
        image_urls: allImages,
        video_url: data.videoUrl || null,
        community_id: data.communityId || null,
        poll_options: data.pollOptions && data.pollOptions.length > 0 ? data.pollOptions : null,
        poll_counts: data.pollOptions && data.pollOptions.length > 0 ? data.pollOptions.map(() => 0) : null,
        likes_count: 0,
        comments_count: 0,
      });

      if (error) throw error;
    } catch (err) {
      console.warn('Supabase createPost failed, falling back to NestJS...', err);
      await apiClient.post('/posts', {
        content: data.content,
        imageUrl: data.imageUrl,
        communityId: data.communityId,
      });
    }
  },

  /**
   * Delete a post (by author or admin)
   */
  async deletePost(postId: string, userId: string): Promise<void> {
    try {
      // 1. Delete associated likes, comments, poll votes if any
      await Promise.allSettled([
        supabase.from('likes').delete().eq('post_id', postId),
        supabase.from('comments').delete().eq('post_id', postId),
      ]);

      // 2. Delete post row from Supabase
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('author_id', userId);

      if (error) throw error;
    } catch (err) {
      console.warn('Supabase deletePost failed, trying NestJS backend fallback...', err);
      await apiClient.delete(`/posts/${postId}`);
    }
  },

  /**
   * Update post content
   */
  async updatePost(postId: string, userId: string, content: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', postId)
        .eq('author_id', userId);

      if (error) throw error;
    } catch (err) {
      console.warn('Supabase updatePost failed, trying NestJS backend fallback...', err);
      await apiClient.patch(`/posts/${postId}`, { content });
    }
  },
};
