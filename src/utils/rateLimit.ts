/**
 * Client-side rate limiter for bandwidth-sensitive actions.
 * Acts as a first line of defence before the DB-level trigger.
 * Uses localStorage to persist across page reloads.
 */

interface RateLimitRecord {
    windowStart: number; // ms timestamp
    count: number;
}

const LIMITS: Record<string, { maxCount: number; windowMs: number; label: string }> = {
    post: { maxCount: 30, windowMs: 60 * 60 * 1000, label: 'post' },
    comment: { maxCount: 30, windowMs: 60 * 60 * 1000, label: 'comment' },
    like: { maxCount: 60, windowMs: 60 * 60 * 1000, label: 'like' },
    upload: { maxCount: 20, windowMs: 60 * 60 * 1000, label: 'upload' },
    message: { maxCount: 200, windowMs: 60 * 60 * 1000, label: 'message' },
};

function getStorageKey(action: string): string {
    return `ulink_rl_${action}`;
}

/**
 * Check if the current user is within the rate limit for the given action.
 * @returns An object indicating if allowed, and a message if not.
 */
export function checkClientRateLimit(action: keyof typeof LIMITS): { allowed: boolean; message?: string } {
    const limit = LIMITS[action];
    if (!limit) return { allowed: true };

    const key = getStorageKey(action);
    const now = Date.now();

    let record: RateLimitRecord;
    try {
        const stored = localStorage.getItem(key);
        record = stored ? JSON.parse(stored) : { windowStart: now, count: 0 };
    } catch {
        record = { windowStart: now, count: 0 };
    }

    // Reset window if expired
    if (now - record.windowStart > limit.windowMs) {
        record = { windowStart: now, count: 0 };
    }

    // Check limit
    if (record.count >= limit.maxCount) {
        const resetIn = Math.ceil((record.windowStart + limit.windowMs - now) / 60000);
        return {
            allowed: false,
            message: `You've ${limit.label}ed too many times. Please wait ${resetIn} minute${resetIn === 1 ? '' : 's'} before trying again.`
        };
    }

    // Increment counter
    record.count += 1;
    try {
        localStorage.setItem(key, JSON.stringify(record));
    } catch {
        // localStorage might be full, fail silently
    }

    return { allowed: true };
}

/**
 * Get remaining actions for a given window.
 * Useful for showing "X posts remaining this hour" UI.
 */
export function getRemainingActions(action: keyof typeof LIMITS): number {
    const limit = LIMITS[action];
    if (!limit) return Infinity;

    const key = getStorageKey(action);
    const now = Date.now();

    try {
        const stored = localStorage.getItem(key);
        if (!stored) return limit.maxCount;

        const record: RateLimitRecord = JSON.parse(stored);

        if (now - record.windowStart > limit.windowMs) {
            return limit.maxCount;
        }

        return Math.max(0, limit.maxCount - record.count);
    } catch {
        return limit.maxCount;
    }
}
