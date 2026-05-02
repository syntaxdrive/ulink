/**
 * Lightweight in-memory query cache for Supabase calls.
 * Prevents duplicate fetches for the same data within a session.
 * 
 * Usage:
 *   const profile = await queryCache.get('profile:userId', () => supabase.from('profiles')..., 5 * 60_000);
 */

interface CacheEntry<T> {
    data: T;
    expiresAt: number;
}

class QueryCache {
    private cache = new Map<string, CacheEntry<any>>();

    async get<T>(
        key: string,
        fetcher: () => Promise<T>,
        ttlMs: number = 5 * 60_000 // 5 minutes default
    ): Promise<T> {
        const entry = this.cache.get(key);
        if (entry && Date.now() < entry.expiresAt) {
            return entry.data as T;
        }

        const data = await fetcher();
        this.cache.set(key, { data, expiresAt: Date.now() + ttlMs });
        return data;
    }

    invalidate(keyOrPrefix: string) {
        for (const key of this.cache.keys()) {
            if (key.startsWith(keyOrPrefix)) {
                this.cache.delete(key);
            }
        }
    }

    clear() {
        this.cache.clear();
    }
}

export const queryCache = new QueryCache();
