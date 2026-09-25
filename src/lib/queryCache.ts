/**
 * Lightweight two-level query cache for Supabase calls.
 *
 * Level 1: In-memory (fast, lost on page refresh)
 * Level 2: localStorage (survives page refreshes, cleared on expiry)
 *
 * This prevents duplicate fetches for the same data both within a session
 * AND across page reloads — dramatically reducing Supabase API calls.
 *
 * Usage:
 *   const data = await queryCache.get(
 *     'stories:list',
 *     () => supabase.from('stories').select('*').limit(50),
 *     5 * 60_000  // 5 minute TTL
 *   );
 *
 *   // Invalidate when data changes:
 *   queryCache.invalidate('stories:');
 */

const STORAGE_PREFIX = 'ulink_qc_';

interface CacheEntry<T> {
    data: T;
    expiresAt: number;
}

class QueryCache {
    private memory = new Map<string, CacheEntry<any>>();

    async get<T>(
        key: string,
        fetcher: () => Promise<T>,
        ttlMs: number = 5 * 60_000 // 5 minutes default
    ): Promise<T> {
        // 1. Check in-memory cache first
        const memEntry = this.memory.get(key);
        if (memEntry && Date.now() < memEntry.expiresAt) {
            return memEntry.data as T;
        }

        // 2. Check localStorage cache
        try {
            const stored = localStorage.getItem(STORAGE_PREFIX + key);
            if (stored) {
                const parsed: CacheEntry<T> = JSON.parse(stored);
                if (Date.now() < parsed.expiresAt) {
                    // Warm the in-memory cache too
                    this.memory.set(key, parsed);
                    return parsed.data;
                } else {
                    // Expired — clean up
                    localStorage.removeItem(STORAGE_PREFIX + key);
                }
            }
        } catch {
            // localStorage unavailable or JSON parse error — continue to fetch
        }

        // 3. Fetch fresh data
        const data = await fetcher();
        const entry: CacheEntry<T> = { data, expiresAt: Date.now() + ttlMs };

        // Store in both levels
        this.memory.set(key, entry);
        try {
            localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(entry));
        } catch {
            // localStorage full or unavailable — in-memory only is fine
        }

        return data;
    }

    /** Set a value directly without fetching (e.g. after a mutation) */
    set<T>(key: string, data: T, ttlMs: number = 5 * 60_000): void {
        const entry: CacheEntry<T> = { data, expiresAt: Date.now() + ttlMs };
        this.memory.set(key, entry);
        try {
            localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(entry));
        } catch {}
    }

    /** Invalidate all cache entries whose key starts with the given prefix */
    invalidate(keyOrPrefix: string): void {
        // Clear from memory
        for (const key of this.memory.keys()) {
            if (key.startsWith(keyOrPrefix)) {
                this.memory.delete(key);
            }
        }
        // Clear from localStorage
        try {
            const toRemove: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
                const lsKey = localStorage.key(i);
                if (lsKey && lsKey.startsWith(STORAGE_PREFIX + keyOrPrefix)) {
                    toRemove.push(lsKey);
                }
            }
            toRemove.forEach(k => localStorage.removeItem(k));
        } catch {}
    }

    clear(): void {
        this.memory.clear();
        try {
            const toRemove: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
                const lsKey = localStorage.key(i);
                if (lsKey && lsKey.startsWith(STORAGE_PREFIX)) {
                    toRemove.push(lsKey);
                }
            }
            toRemove.forEach(k => localStorage.removeItem(k));
        } catch {}
    }
}

export const queryCache = new QueryCache();
