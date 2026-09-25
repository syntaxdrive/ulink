import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

const TABLE_MAP: Record<string, string> = {
  profiles: 'user',
  users: 'user',
  communities: 'community',
  community_members: 'communityMember',
  posts: 'post',
  likes: 'like',
  comments: 'comment',
  jobs: 'job',
  courses: 'course',
  course_documents: 'courseDocument',
  course_likes: 'courseLike',
  podcasts: 'podcast',
  podcast_episodes: 'podcastEpisode',
  study_rooms: 'studyRoom',
  study_room_participants: 'studyRoomParticipant',
  connections: 'connection',
  follows: 'follow',
  messages: 'message',
  marketplace_listings: 'marketplaceListing',
  notifications: 'notification',
};

@Injectable()
export class RestService {
  constructor(private readonly prisma: PrismaService) {}

  private getModel(tableName: string) {
    const modelName = TABLE_MAP[tableName.toLowerCase()];
    if (!modelName || !(this.prisma as any)[modelName]) {
      return null;
    }
    return (this.prisma as any)[modelName];
  }

  private parseFilterValue(val: string): any {
    if (val === 'true') return true;
    if (val === 'false') return false;
    if (val === 'null') return null;
    if (!isNaN(Number(val)) && !val.includes('-')) return Number(val);
    return val;
  }

  private buildWhere(query: Record<string, any>): Record<string, any> {
    const where: Record<string, any> = {};

    for (const [key, rawVal] of Object.entries(query)) {
      if (['select', 'order', 'limit', 'offset', 'cursor'].includes(key)) continue;

      const valStr = String(rawVal);

      if (valStr.startsWith('eq.')) {
        where[key] = this.parseFilterValue(valStr.slice(3));
      } else if (valStr.startsWith('neq.')) {
        where[key] = { not: this.parseFilterValue(valStr.slice(4)) };
      } else if (valStr.startsWith('gt.')) {
        where[key] = { gt: this.parseFilterValue(valStr.slice(3)) };
      } else if (valStr.startsWith('gte.')) {
        where[key] = { gte: this.parseFilterValue(valStr.slice(4)) };
      } else if (valStr.startsWith('lt.')) {
        where[key] = { lt: this.parseFilterValue(valStr.slice(3)) };
      } else if (valStr.startsWith('lte.')) {
        where[key] = { lte: this.parseFilterValue(valStr.slice(4)) };
      } else if (valStr.startsWith('ilike.')) {
        const pattern = valStr.slice(6).replace(/%/g, '');
        where[key] = { contains: pattern, mode: 'insensitive' };
      } else if (valStr.startsWith('in.(') && valStr.endsWith(')')) {
        const inner = valStr.slice(4, -1);
        where[key] = { in: inner.split(',').map((s) => this.parseFilterValue(s.trim())) };
      } else if (valStr === 'is.null') {
        where[key] = null;
      } else if (valStr === 'not.is.null') {
        where[key] = { not: null };
      } else {
        where[key] = this.parseFilterValue(valStr);
      }
    }

    return where;
  }

  private buildOrderBy(orderParam?: string): any {
    if (!orderParam) return { created_at: 'desc' };

    const parts = orderParam.split('.');
    const field = parts[0] || 'created_at';
    const direction = parts[1]?.toLowerCase() === 'asc' ? 'asc' : 'desc';

    return { [field]: direction };
  }

  private getDefaultIncludes(tableName: string): any {
    switch (tableName.toLowerCase()) {
      case 'posts':
        return {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar_url: true,
              university: true,
              is_verified: true,
            },
          },
        };
      case 'marketplace_listings':
        return {
          seller: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar_url: true,
              university: true,
              store_name: true,
            },
          },
        };
      case 'communities':
        return {
          creator: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar_url: true,
            },
          },
        };
      case 'courses':
        return {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar_url: true,
            },
          },
          documents: true,
        };
      case 'podcasts':
        return {
          creator: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar_url: true,
            },
          },
          episodes: true,
        };
      case 'study_rooms':
        return {
          creator: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar_url: true,
            },
          },
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  avatar_url: true,
                },
              },
            },
          },
        };
      case 'jobs':
        return {
          creator: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar_url: true,
            },
          },
        };
      default:
        return undefined;
    }
  }

  private transformResponse(tableName: string, data: any[]): any[] {
    const tbl = tableName.toLowerCase();
    return data.map((item) => {
      // Marketplace compatibility shim: map seller to profiles & profiles:seller_id
      if (tbl === 'marketplace_listings' && item.seller) {
        return {
          ...item,
          profiles: item.seller,
          'profiles:seller_id': item.seller,
        };
      }
      // Posts compatibility shim: map author to profiles
      if (tbl === 'posts' && item.author) {
        return {
          ...item,
          profiles: item.author,
        };
      }
      return item;
    });
  }

  async findMany(tableName: string, query: Record<string, any>) {
    const model = this.getModel(tableName);
    if (!model) {
      console.warn(`[RestService] Unknown table: ${tableName}`);
      return [];
    }

    const where = this.buildWhere(query);
    const limit = Math.min(Number(query.limit) || 100, 250);
    const offset = Number(query.offset) || 0;

    let orderBy: any;
    try {
      orderBy = this.buildOrderBy(query.order);
    } catch {
      orderBy = undefined;
    }

    const include = this.getDefaultIncludes(tableName);

    try {
      const results = await model.findMany({
        where,
        take: limit,
        skip: offset,
        ...(orderBy ? { orderBy } : {}),
        ...(include ? { include } : {}),
      });

      return this.transformResponse(tableName, results);
    } catch (e: any) {
      // Fallback without ordering or includes if schema fields differ
      try {
        const fallback = await model.findMany({
          take: limit,
          skip: offset,
        });
        return this.transformResponse(tableName, fallback);
      } catch (err) {
        console.error(`[RestService] Error finding records for ${tableName}:`, err);
        return [];
      }
    }
  }

  async findById(tableName: string, id: string) {
    const model = this.getModel(tableName);
    if (!model) throw new NotFoundException(`Table ${tableName} not found`);

    const include = this.getDefaultIncludes(tableName);

    try {
      const result = await model.findUnique({
        where: { id },
        ...(include ? { include } : {}),
      });
      if (!result) return null;
      return this.transformResponse(tableName, [result])[0];
    } catch (e) {
      return null;
    }
  }

  async create(tableName: string, data: any) {
    const model = this.getModel(tableName);
    if (!model) throw new NotFoundException(`Table ${tableName} not found`);

    return model.create({ data });
  }

  async update(tableName: string, id: string, data: any) {
    const model = this.getModel(tableName);
    if (!model) throw new NotFoundException(`Table ${tableName} not found`);

    return model.update({
      where: { id },
      data,
    });
  }

  async delete(tableName: string, id: string) {
    const model = this.getModel(tableName);
    if (!model) throw new NotFoundException(`Table ${tableName} not found`);

    return model.delete({
      where: { id },
    });
  }
}
