import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class FeedService {
  constructor(private readonly prisma: PrismaService) {}

  async getFeed(userId?: string, cursor?: string, limit = 50) {
    const validUserId = userId ? String(userId).trim() : null;

    // Fetch all campus posts ordered by engagement and recency
    const posts = await this.prisma.post.findMany({
      take: limit + 1,
      ...(cursor
        ? {
            cursor: { id: cursor },
            skip: 1,
          }
        : {}),
      orderBy: [
        { likes_count: 'desc' },
        { created_at: 'desc' },
      ],
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar_url: true,
            is_verified: true,
            university: true,
          },
        },
        ...(validUserId
          ? {
              likes: {
                where: { user_id: validUserId },
                take: 1,
              },
            }
          : {}),
      },
    });

    let nextCursor: typeof cursor | undefined = undefined;
    if (posts.length > limit) {
      const nextItem = posts.pop();
      nextCursor = nextItem!.id;
    }

    const mappedPosts = posts.map((post) => {
      const { likes, ...rest } = post as any;
      return {
        ...rest,
        user_has_liked: Array.isArray(likes) && likes.length > 0,
      };
    });

    return {
      posts: mappedPosts,
      nextCursor,
    };
  }

  async createPost(userId: string, dto: CreatePostDto) {
    return this.prisma.post.create({
      data: {
        author_id: userId,
        content: dto.content ?? null,
        image_url: dto.imageUrl ?? null,
        image_urls: dto.imageUrls || [],
        video_url: dto.videoUrl ?? null,
        community_id: dto.communityId ?? null,
        poll_options: dto.pollOptions || [],
      },
    });
  }

  async likePost(userId: string, postId: string) {
    const existingLike = await this.prisma.like.findUnique({
      where: {
        post_id_user_id: {
          post_id: postId,
          user_id: userId,
        },
      },
    });

    if (existingLike) {
      await this.prisma.$transaction([
        this.prisma.like.delete({
          where: { id: existingLike.id },
        }),
        this.prisma.post.update({
          where: { id: postId },
          data: { likes_count: { decrement: 1 } },
        }),
      ]);
      return { liked: false };
    } else {
      await this.prisma.$transaction([
        this.prisma.like.create({
          data: {
            post_id: postId,
            user_id: userId,
          },
        }),
        this.prisma.post.update({
          where: { id: postId },
          data: { likes_count: { increment: 1 } },
        }),
      ]);
      return { liked: true };
    }
  }

  async getPostComments(postId: string, cursor?: string, limit = 20) {
    const comments = await this.prisma.comment.findMany({
      where: { post_id: postId },
      take: limit + 1,
      ...(cursor
        ? {
            cursor: { id: cursor },
            skip: 1,
          }
        : {}),
      orderBy: { created_at: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar_url: true,
            is_verified: true,
            university: true,
          },
        },
      },
    });

    let nextCursor: typeof cursor | undefined = undefined;
    if (comments.length > limit) {
      const nextItem = comments.pop();
      nextCursor = nextItem!.id;
    }

    return {
      comments,
      nextCursor,
    };
  }

  async addComment(userId: string, postId: string, content: string) {
    return this.prisma.$transaction(async (tx) => {
      const comment = await tx.comment.create({
        data: {
          post_id: postId,
          author_id: userId,
          content,
        },
      });

      await tx.post.update({
        where: { id: postId },
        data: { comments_count: { increment: 1 } },
      });

      return comment;
    });
  }

  async repostPost(userId: string, postId: string, comment?: string) {
    const originalPost = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!originalPost) {
      throw new NotFoundException('Original post not found');
    }

    return this.prisma.post.create({
      data: {
        author_id: userId,
        content: originalPost.content,
        image_url: originalPost.image_url,
        image_urls: originalPost.image_urls,
        video_url: originalPost.video_url,
        is_repost: true,
        original_post_id: postId,
        repost_comment: comment || null,
      },
    });
  }

  async deletePost(userId: string, postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.author_id !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    return this.prisma.post.delete({
      where: { id: postId },
    });
  }

  async getPodcastStories() {
    try {
      const podcasts = await this.prisma.podcast.findMany({
        take: 10,
        orderBy: { created_at: 'desc' },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar_url: true,
              university: true,
            },
          },
          episodes: {
            take: 1,
            orderBy: { created_at: 'desc' },
          },
        },
      });

      return podcasts.map((pod) => ({
        id: pod.id,
        title: pod.title,
        coverUrl: pod.cover_url || pod.creator?.avatar_url,
        creatorName: pod.creator?.name || pod.creator?.username || 'Student Podcaster',
        latestEpisodeTitle: pod.episodes[0]?.title || pod.title,
        latestEpisodeAudioUrl: pod.episodes[0]?.audio_url || null,
      }));
    } catch {
      return [];
    }
  }
}
