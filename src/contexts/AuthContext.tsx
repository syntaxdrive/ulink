import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

/**
 * AuthContext — single source of truth for the current user.
 *
 * Replaces 80+ scattered supabase.auth.getSession() / getUser() calls
 * across the codebase. Auth state is read from memory after the initial
 * mount, meaning zero network calls per component.
 *
 * Usage:
 *   const { user, userId, loading } = useAuth();
 */
interface AuthContextValue {
    user: User | null;
    userId: string | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
    user: null,
    userId: null,
    loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // One-time session read on mount — only call that hits the network
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Respond to auth events (sign-in, sign-out, token refresh) — no polling
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, userId: user?.id ?? null, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

/** Hook to access the current authenticated user from anywhere in the app. */
export function useAuth() {
    return useContext(AuthContext);
}
