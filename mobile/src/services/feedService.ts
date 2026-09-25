import { supabase } from '../lib/supabase';
import { apiClient } from '../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const isValidUUID = (str: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

export interface FeedAuthor {
  id: string;
  name: string | null;
  username: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  university: string | null;
  headline?: string | null;
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
  post_id?: string;
  parent_id?: string | null;
  reply_to_username?: string | null;
  content: string;
  sticker_url?: string | null;
  created_at: string;
  likes_count?: number;
  user_has_liked?: boolean;
  replies?: CommentItem[];
  author: {
    id: string;
    name: string | null;
    username: string | null;
    avatar_url: string | null;
    is_verified?: boolean;
  };
}

/**
 * UniLink Base Ranking & Discovery Algorithm
 * Blends organic student engagement, freshness decay, campus proximity,
 * and discovery exploration jitter so each reload surfaces new interesting posts.
 */
export function calculatePostScore(
  post: FeedPost,
  viewerUniversity?: string | null,
  isRefresh = false
): number {
  const now = Date.now();
  const postTime = new Date(post.created_at).getTime();
  const ageInHours = Math.max(0.05, (now - postTime) / (1000 * 60 * 60));

  // 1. Organic Student Engagement Signals
  const likesScore = (post.likes_count || 0) * 3;
  const commentsScore = (post.comments_count || 0) * 5;
  const mediaBonus = post.video_url || (post.image_urls && post.image_urls.length > 0) ? 10 : 0;
  const pollBonus = post.poll_options && post.poll_options.length > 0 ? 8 : 0;
  const repostBonus = post.is_repost ? 6 : 0;

  const rawEngagement = likesScore + commentsScore + mediaBonus + pollBonus + repostBonus;

  // 2. Campus Proximity Boost (Same university peers get +25 points for local relevance)
  const isSameUni = Boolean(
    viewerUniversity &&
      post.author?.university &&
      post.author.university.trim().toLowerCase() === viewerUniversity.trim().toLowerCase()
  );
  const campusBoost = isSameUni ? 25 : 0;

  // 3. Time Decay (Ensures fresh student voices and viral moments circulate dynamically)
  const timeScore = (rawEngagement + 14 + campusBoost) / Math.pow(ageInHours + 1.8, 1.15);

  // 4. Base Score (scaled)
  let finalScore = timeScore * 100;

  // 5. Multiplier Effect for Verified Creators (1.35x Visibility Multiplier)
  if (post.author?.is_verified) {
    finalScore *= 1.35;
  }

  // 6. Dynamic Discovery on Refresh (Shuffle fresh items, new discussions, and trending shorts)
  if (isRefresh) {
    const hash = (post.id || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const jitter = ((hash * 31 + Date.now() % 500) % 80) - 40;
    finalScore += jitter;
  }

  return finalScore;
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
  async getFeed(currentUserId?: string | null, limit = 100, isRefresh = false): Promise<FeedPost[]> {
    // 1. Try NestJS Backend First (Cost reduction & centralized business logic)
    try {
      const res = await apiClient.get('/feed', {
        params: { limit },
        timeout: 4500, // Quick timeout to fallback seamlessly if backend is unreachable
      });
      const nestPosts = res.data?.posts || [];
      if (Array.isArray(nestPosts) && nestPosts.length > 0) {
        return nestPosts;
      }
    } catch (nestError) {
      // Graceful fallback to Supabase query if NestJS is down or offline
      console.warn('NestJS getFeed unavailable, falling back to Supabase directly:', nestError);
    }

    try {
      // 2. Fallback: Direct Supabase Query (excluding unshared community posts)
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
            university,
            headline
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
          .select('id, name, username, avatar_url, is_verified, university, headline')
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
      let viewerUniversity: string | null = null;

      if (currentUserId) {
        const [likesRes, votesRes, viewerRes] = await Promise.all([
          rawPosts.length > 0
            ? supabase
                .from('likes')
                .select('post_id')
                .eq('user_id', currentUserId)
                .in('post_id', rawPosts.map((p: any) => p.id))
            : Promise.resolve({ data: [] }),
          rawPosts.length > 0
            ? supabase
                .from('poll_votes')
                .select('post_id, option_index')
                .eq('user_id', currentUserId)
                .in('post_id', rawPosts.map((p: any) => p.id))
            : Promise.resolve({ data: [] }),
          supabase
            .from('profiles')
            .select('university')
            .eq('id', currentUserId)
            .single(),
        ]);

        if (likesRes.data) {
          likedPostIds = new Set(likesRes.data.map((l: any) => l.post_id));
        }
        if (votesRes.data) {
          votesRes.data.forEach((v: any) => userVotesMap.set(v.post_id, v.option_index));
        }
        if (viewerRes.data?.university) {
          viewerUniversity = viewerRes.data.university;
        }
      }

      const formattedPosts: FeedPost[] = rawPosts.map((p: any) => {
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

      // Apply Base-Level Balanced Ranking Algorithm (Organic Engagement + Campus Boost + Verified 1.35x Multiplier + Freshness Shuffle)
      formattedPosts.sort((a, b) => {
        const scoreB = calculatePostScore(b, viewerUniversity, isRefresh);
        const scoreA = calculatePostScore(a, viewerUniversity, isRefresh);
        return scoreB - scoreA;
      });

      // Strict Deduplication by ID and normalized content to prevent seeded/merged duplicate items
      const seenIds = new Set<string>();
      const seenContent = new Set<string>();
      const uniquePosts: FeedPost[] = [];

      for (const p of formattedPosts) {
        if (!p || !p.id) continue;
        const norm = (p.content || '').trim().toLowerCase().slice(0, 80);
        if (seenIds.has(p.id)) continue;
        if (norm && seenContent.has(norm)) continue;
        seenIds.add(p.id);
        if (norm) seenContent.add(norm);
        uniquePosts.push(p);
      }

      return uniquePosts;
    } catch (supabaseError) {
      console.warn('Supabase getFeed failed, trying NestJS backend fallback...', supabaseError);
      // 2. Fallback: NestJS API
      const res = await apiClient.get('/feed');
      const fallbackList = res.data?.posts || [];
      const seen = new Set<string>();
      return fallbackList.filter((p: any) => {
        if (!p?.id || seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      });
    }
  },

  /**
   * Calculate post ranking score using the UniLink Balanced Algorithm
   */
  calculatePostScore(post: FeedPost, viewerUniversity?: string | null): number {
    return calculatePostScore(post, viewerUniversity);
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
   * Repost / Reshare a post to campus feed (Instant or Quote Repost)
   */
  async repost(postId: string, userId: string, comment?: string): Promise<boolean> {
    try {
      const cleanComment = comment ? comment.trim() : null;
      const { error } = await supabase.from('posts').insert({
        author_id: userId,
        original_post_id: postId,
        is_repost: true,
        content: cleanComment,
        repost_comment: cleanComment,
        likes_count: 0,
        comments_count: 0,
      });

      if (error) throw error;
      return true;
    } catch (err) {
      console.warn('Supabase repost failed, falling back to NestJS...', err);
      try {
        await apiClient.post(`/posts/${postId}/repost`, { comment });
        return true;
      } catch (fallbackErr) {
        console.warn('NestJS repost fallback failed:', fallbackErr);
        return false;
      }
    }
  },

  /**
   * Toggle Bookmark / Save Post (with multi-table fallback, UUID validation & local AsyncStorage cache)
   */
  async toggleBookmark(postOrId: string | any, userId: string, isSaved: boolean): Promise<boolean> {
    const postId = typeof postOrId === 'string' ? postOrId : postOrId?.id;
    if (!postId) return false;

    // 1. Manage Local AsyncStorage Cache (Immediate Offline & Mock Post Guarantee)
    try {
      const storageKey = `unilink_saved_posts_${userId}`;
      const raw = await AsyncStorage.getItem(storageKey);
      let localSaved: any[] = raw ? JSON.parse(raw) : [];

      if (isSaved) {
        localSaved = localSaved.filter((p) => (typeof p === 'string' ? p !== postId : p.id !== postId));
      } else {
        const postObj = typeof postOrId === 'object' && postOrId !== null
          ? postOrId
          : { id: postId, created_at: new Date().toISOString() };
        if (!localSaved.some((p) => (typeof p === 'string' ? p === postId : p.id === postId))) {
          localSaved.unshift(postObj);
        }
      }
      await AsyncStorage.setItem(storageKey, JSON.stringify(localSaved));
    } catch (e) {
      console.warn('AsyncStorage bookmark cache error:', e);
    }

    // 2. Sync to Supabase if postId is a valid UUID
    if (isValidUUID(postId)) {
      try {
        if (isSaved) {
          await Promise.allSettled([
            supabase.from('bookmarks').delete().eq('post_id', postId).eq('user_id', userId),
            supabase.from('saved_posts').delete().eq('post_id', postId).eq('user_id', userId),
          ]);
          return false;
        } else {
          // Use insert; if already exists, it will catch and be fine
          const { error } = await supabase.from('bookmarks').insert({
            post_id: postId,
            user_id: userId,
            created_at: new Date().toISOString(),
          });
          if (error) {
            await supabase.from('saved_posts').insert({
              post_id: postId,
              user_id: userId,
              created_at: new Date().toISOString(),
            });
          }
          return true;
        }
      } catch (err) {
        console.warn('Supabase toggleBookmark error:', err);
      }
    }

    return !isSaved;
  },

  /**
   * Get set of saved post IDs for a user (combines Local Cache + Supabase)
   */
  async getSavedPostIds(userId: string): Promise<Set<string>> {
    const ids = new Set<string>();

    // 1. Read from AsyncStorage
    try {
      const storageKey = `unilink_saved_posts_${userId}`;
      const raw = await AsyncStorage.getItem(storageKey);
      if (raw) {
        const localSaved: any[] = JSON.parse(raw);
        localSaved.forEach((p) => ids.add(typeof p === 'string' ? p : p.id));
      }
    } catch {}

    // 2. Read from Supabase
    try {
      const { data } = await supabase
        .from('bookmarks')
        .select('post_id')
        .eq('user_id', userId);
      if (data) {
        data.forEach((b: any) => ids.add(b.post_id));
      }

      const { data: savedData } = await supabase
        .from('saved_posts')
        .select('post_id')
        .eq('user_id', userId);
      if (savedData) {
        savedData.forEach((b: any) => ids.add(b.post_id));
      }
    } catch (e) {
      console.warn('Error fetching saved post IDs:', e);
    }

    return ids;
  },

  /**
   * Get full list of saved post objects for a user (combining Supabase + Local Cache)
   */
  async getSavedPosts(userId: string): Promise<any[]> {
    const postMap = new Map<string, any>();

    // 1. Read from Local AsyncStorage Cache first
    try {
      const storageKey = `unilink_saved_posts_${userId}`;
      const raw = await AsyncStorage.getItem(storageKey);
      if (raw) {
        const localSaved: any[] = JSON.parse(raw);
        localSaved.forEach((p) => {
          if (p && typeof p === 'object' && p.id) {
            postMap.set(p.id, p);
          }
        });
      }
    } catch {}

    // 2. Query Supabase bookmarks
    try {
      const [bookmarksRes, savedPostsRes] = await Promise.allSettled([
        supabase
          .from('bookmarks')
          .select(`
            post_id,
            created_at,
            posts:post_id(
              id, content, image_url, image_urls, video_url, likes_count, comments_count, created_at, is_repost, original_post_id,
              author:profiles!author_id(id, name, username, avatar_url, is_verified, university)
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
        supabase
          .from('saved_posts')
          .select(`
            post_id,
            created_at,
            posts:post_id(
              id, content, image_url, image_urls, video_url, likes_count, comments_count, created_at, is_repost, original_post_id,
              author:profiles!author_id(id, name, username, avatar_url, is_verified, university)
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
      ]);

      const foundIds: string[] = [];

      if (bookmarksRes.status === 'fulfilled' && bookmarksRes.value.data) {
        bookmarksRes.value.data.forEach((b: any) => {
          if (b.posts) postMap.set(b.posts.id, b.posts);
          else if (b.post_id) foundIds.push(b.post_id);
        });
      }

      if (savedPostsRes.status === 'fulfilled' && savedPostsRes.value.data) {
        savedPostsRes.value.data.forEach((b: any) => {
          if (b.posts) postMap.set(b.posts.id, b.posts);
          else if (b.post_id) foundIds.push(b.post_id);
        });
      }

      // If relational join didn't return post body, fetch directly by ID
      if (foundIds.length > 0) {
        const missingIds = foundIds.filter((id) => !postMap.has(id));
        if (missingIds.length > 0) {
          const { data: directPosts } = await supabase
            .from('posts')
            .select(`
              id, content, image_url, image_urls, video_url, likes_count, comments_count, created_at, is_repost, original_post_id,
              author:profiles!author_id(id, name, username, avatar_url, is_verified, university)
            `)
            .in('id', missingIds);
          if (directPosts) {
            directPosts.forEach((p: any) => postMap.set(p.id, p));
          }
        }
      }
    } catch (e) {
      console.warn('Error fetching Supabase bookmarks:', e);
    }

    return Array.from(postMap.values());
  },

  /**
   * Get comments for a post (with replies & like state)
   */
  async getComments(postId: string, currentUserId?: string | null): Promise<CommentItem[]> {
    try {
      // 1. Fetch liked comment IDs for current user from local cache
      const likedCommentIds = new Set<string>();
      if (currentUserId) {
        try {
          const raw = await AsyncStorage.getItem(`unilink_liked_comments_${currentUserId}`);
          if (raw) {
            const list: string[] = JSON.parse(raw);
            list.forEach((id) => likedCommentIds.add(id));
          }
        } catch {}
      }

      // 2. Query standard base columns guaranteed to exist across all Postgres schemas
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          post_id,
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
        .limit(200);

      if (error) throw error;

      return (data || []).map((c: any) => {
        const mentionMatch = (c.content || '').match(/^@([a-zA-Z0-9._]+)\s+/);
        const replyTo = mentionMatch ? mentionMatch[1] : (c.reply_to_username || null);

        return {
          id: c.id,
          post_id: c.post_id || postId,
          parent_id: c.parent_id || null,
          reply_to_username: replyTo,
          content: c.content || '',
          sticker_url: c.sticker_url,
          created_at: c.created_at,
          likes_count: c.likes_count || 0,
          user_has_liked: currentUserId ? likedCommentIds.has(c.id) : false,
          author: c.profiles || {
            id: c.author_id,
            name: 'Student',
            username: 'user',
            avatar_url: null,
            is_verified: false,
          },
        };
      });
    } catch (err) {
      console.warn('Supabase getComments fallback:', err);
      try {
        const res = await apiClient.get(`/posts/${postId}/comments`);
        return res.data?.comments || [];
      } catch {
        return [];
      }
    }
  },

  /**
   * Post a new comment (supports replying to a specific comment)
   */
  async addComment(
    postId: string,
    userId: string,
    content: string,
    parentId?: string | null,
    replyToUsername?: string | null
  ): Promise<CommentItem> {
    try {
      const formattedContent =
        replyToUsername && !content.startsWith(`@${replyToUsername}`)
          ? `@${replyToUsername} ${content}`
          : content;

      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          author_id: userId,
          content: formattedContent,
        })
        .select(`
          id,
          post_id,
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

      // Update comments_count on post
      try {
        const { count } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', postId);
        await supabase
          .from('posts')
          .update({ comments_count: count || 1 })
          .eq('id', postId);
      } catch {}

      return {
        id: data.id,
        post_id: postId,
        parent_id: parentId || null,
        reply_to_username: replyToUsername || null,
        content: data.content,
        sticker_url: data.sticker_url,
        created_at: data.created_at,
        likes_count: 0,
        user_has_liked: false,
        author: (data as any).profiles || {
          id: userId,
          name: 'You',
          username: 'user',
          avatar_url: null,
          is_verified: false,
        },
      };
    } catch (err) {
      console.warn('Supabase addComment fallback to NestJS...', err);
      const res = await apiClient.post(`/posts/${postId}/comments`, { content, parentId });
      return res.data;
    }
  },

  /**
   * Toggle Like on a Comment
   */
  async toggleLikeComment(
    commentId: string,
    userId: string,
    isLiked: boolean
  ): Promise<boolean> {
    const newLiked = !isLiked;

    // 1. Update AsyncStorage cache for instant client consistency
    try {
      const storageKey = `unilink_liked_comments_${userId}`;
      const raw = await AsyncStorage.getItem(storageKey);
      let list: string[] = raw ? JSON.parse(raw) : [];
      if (newLiked) {
        if (!list.includes(commentId)) list.push(commentId);
      } else {
        list = list.filter((id) => id !== commentId);
      }
      await AsyncStorage.setItem(storageKey, JSON.stringify(list));
    } catch (e) {
      console.warn('AsyncStorage comment like error:', e);
    }

    // 2. Sync to Supabase if table exists
    try {
      if (newLiked) {
        await supabase.from('comment_likes').insert({ comment_id: commentId, user_id: userId });
        await supabase.rpc('increment_comment_likes', { c_id: commentId });
      } else {
        await supabase.from('comment_likes').delete().eq('comment_id', commentId).eq('user_id', userId);
        await supabase.rpc('decrement_comment_likes', { c_id: commentId });
      }
    } catch {
      // Gracefully handled by client state
    }

    return newLiked;
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

  /**
   * Trigger automated daily curated post from Supabase content bank
   */
  async triggerDailyCuratedPost(): Promise<any> {
    try {
      const { data, error } = await supabase.rpc('publish_daily_curated_post', { p_count: 1 });
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('publish_daily_curated_post RPC notice:', err);
      return null;
    }
  },
};

/**
 * 🌿 Pollinations AI Generator (100% Free, No API Key Required)
 * Generates dynamic text advice, study hacks, and coding tips for campus hub accounts.
 */
export const PollinationsAiService = {
  /**
   * Generate dynamic text from Pollinations AI
   */
  async generateText(prompt: string): Promise<string> {
    try {
      const response = await fetch(
        `https://text.pollinations.ai/${encodeURIComponent(prompt)}?model=openai&json=false`
      );
      if (!response.ok) throw new Error(`Pollinations HTTP ${response.status}`);
      return await response.text();
    } catch (err) {
      console.warn('Pollinations text generation fallback:', err);
      return '';
    }
  },

  /**
   * Auto-generate and publish a fresh text advice post for a Curated Hub
   */
  async createAndPublishAiHubPost(hubType: 'academy' | 'tech' | 'pulse' | 'career'): Promise<any> {
    const hubConfigs = {
      academy: {
        authorId: 'a1000000-0000-0000-0000-000000000001',
        prompt: 'Give one quick, high-impact study hack or memory formula for Nigerian university students preparing for exams. Add 2 emojis and hashtags like #UniLinkAcademy #StudyHacks #ExamPrep. Keep under 200 characters.',
      },
      tech: {
        authorId: 'a1000000-0000-0000-0000-000000000002',
        prompt: 'Give one bite-sized coding or Git tip for student software developers. Keep it concise with 2 emojis and hashtags like #TechScholars #CodingTips. Keep under 200 characters.',
      },
      pulse: {
        authorId: 'a1000000-0000-0000-0000-000000000003',
        prompt: 'Write a relatable, funny 2-sentence campus life observation about Nigerian hostel life or exam hall tension. Add 2 emojis and #CampusPulse #HostelLife.',
      },
      career: {
        authorId: 'a1000000-0000-0000-0000-000000000004',
        prompt: 'Give one sharp resume or interview tip for university students seeking 2026 internships. Include #CareerLaunch #Internships. Keep under 200 characters.',
      },
    };

    const config = hubConfigs[hubType];
    const generatedText = await this.generateText(config.prompt);

    if (!generatedText) return null;

    const newPostId = (typeof crypto !== 'undefined' && (crypto as any).randomUUID)
      ? (crypto as any).randomUUID()
      : `tip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      const { data, error } = await supabase.from('posts').insert({
        id: newPostId,
        author_id: config.authorId,
        content: generatedText.trim(),
        likes_count: Math.floor(100 + Math.random() * 300),
        comments_count: Math.floor(10 + Math.random() * 30),
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.warn('Error inserting AI text post:', error);
        return null;
      }

      return { id: newPostId, content: generatedText };
    } catch (e) {
      console.warn('createAndPublishAiHubPost error:', e);
      return null;
    }
  },
};

