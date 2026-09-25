/**
 * Global Auth Cache — eliminates redundant supabase.auth.getUser() network calls.
 *
 * Instead of every component calling supabase.auth.getUser() (which hits Supabase's
 * auth server each time), this module caches the user in memory and stays in sync
 * via a single onAuthStateChange listener.
 *
 * Usage:
 *   import { getCachedUser } from '../../lib/auth';
 *   const user = getCachedUser(); // instant, no network call
 */

import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

let _cachedUser: User | null = null;
let _initialized = false;
let _initPromise: Promise<User | null> | null = null;

/**
 * Initialize the auth cache. Called once at app startup.
 * Sets up onAuthStateChange to keep _cachedUser in sync automatically.
 */
export function initAuthCache(): void {
    supabase.auth.onAuthStateChange((_event, session) => {
        _cachedUser = session?.user ?? null;
        _initialized = true;
    });
}

/**
 * Returns the currently cached user synchronously.
 * Returns null if not signed in or if cache hasn't been initialized yet.
 */
export function getCachedUser(): User | null {
    return _cachedUser;
}

/**
 * Returns a promise that resolves to the current user.
 * On first call, fetches from Supabase once and caches the result.
 * All subsequent calls return the cached value instantly.
 */
export async function getUser(): Promise<User | null> {
    if (_initialized) return _cachedUser;

    // Deduplicate concurrent calls — only one network request flies at a time
    if (_initPromise) return _initPromise;

    _initPromise = supabase.auth.getSession().then(({ data: { session } }) => {
        const user = session?.user || null;
        _cachedUser = user;
        _initialized = true;
        _initPromise = null;
        return user || null;
    });

    return _initPromise;
}

/**
 * Call this on sign-out to clear the cache immediately.
 */
export function clearAuthCache(): void {
    _cachedUser = null;
    _initialized = false;
    _initPromise = null;
}
