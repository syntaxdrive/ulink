/**
 * AuthContext — NestJS JWT edition.
 *
 * Reads the JWT token from localStorage (stored on login via NestJS /auth/login).
 * Validates with NestJS /auth/me on mount to get the full user object.
 * No Supabase calls. Zero network hang on startup.
 */

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../lib/api';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  username?: string;
  avatar_url?: string;
  university?: string;
  department?: string;
  level?: string;
  bio?: string;
  is_verified?: boolean;
  /** Compatibility shim — mirrors Supabase User.user_metadata */
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
    name?: string;
    [key: string]: any;
  };
}

interface AuthContextValue {
  user: AuthUser | null;
  userId: string | null;
  loading: boolean;
  signOut: () => void;
  setUser: (user: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  userId: null,
  loading: true,
  signOut: () => {},
  setUser: () => {},
});

function nestUserToAuthUser(u: any): AuthUser {
  return {
    id: u.id,
    email: u.email,
    name: u.name || u.full_name || u.email,
    username: u.username,
    avatar_url: u.avatar_url,
    university: u.university,
    department: u.department,
    level: u.level,
    bio: u.bio,
    is_verified: u.is_verified,
    user_metadata: {
      full_name: u.name || u.full_name,
      avatar_url: u.avatar_url,
      name: u.name,
    },
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const setUser = useCallback((u: AuthUser | null) => {
    setUserState(u);
    if (u) {
      localStorage.setItem('ulink_user', JSON.stringify(u));
    } else {
      localStorage.removeItem('ulink_user');
      localStorage.removeItem('ulink_jwt_token');
    }
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    window.location.href = '/';
  }, [setUser]);

  useEffect(() => {
    const token = localStorage.getItem('ulink_jwt_token');

    if (!token) {
      setLoading(false);
      return;
    }

    // Try to load cached user immediately (instant, no network)
    const cached = localStorage.getItem('ulink_user');
    if (cached) {
      try {
        setUserState(JSON.parse(cached));
      } catch {
        // ignore bad cache
      }
    }

    // Validate token with NestJS in background
    api.get<any>('/auth/me').then(({ data, error }) => {
      if (error || !data) {
        // Token expired or invalid — sign out
        setUser(null);
      } else {
        const authUser = nestUserToAuthUser(data);
        setUserState(authUser);
        localStorage.setItem('ulink_user', JSON.stringify(authUser));
      }
      setLoading(false);
    });
  }, [setUser]);

  return (
    <AuthContext.Provider value={{ user, userId: user?.id ?? null, loading, signOut, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Hook to access the current authenticated user from anywhere in the app. */
export function useAuth() {
  return useContext(AuthContext);
}
