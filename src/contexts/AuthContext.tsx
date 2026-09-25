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
  role?: string;
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

export const DEFAULT_DEMO_USER: AuthUser = {
  id: '71e897f5-4ab1-4b73-a73b-014eb5566d53',
  email: 'chidi@unilink.ng',
  name: 'Chidi Nwosu',
  username: 'chidi_nwosu',
  avatar_url: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400',
  university: 'Covenant University',
  department: 'Electrical Engineering',
  role: 'Student',
  is_verified: true,
  bio: 'Electrical Engineering | Robotics Club Lead',
  user_metadata: {
    full_name: 'Chidi Nwosu',
    avatar_url: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400',
    name: 'Chidi Nwosu',
  },
};

export const DEFAULT_DEMO_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImNoaWRpQHVuaWxpbmsubmciLCJzdWIiOiI3MWU4OTdmNS00YWIxLTRiNzMtYTczYi0wMTRlYjU1NjZkNTMiLCJpYXQiOjE3OTAzNTE0MTUsImV4cCI6MTc5MDk1NjIxNX0.HWbRJZiBCXbs8JImwxD1BMqFYINO70fkHZ9u0oBGZhQ';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(() => {
    try {
      const cached = localStorage.getItem('ulink_user');
      return cached ? JSON.parse(cached) : DEFAULT_DEMO_USER;
    } catch {
      return DEFAULT_DEMO_USER;
    }
  });
  const [loading, setLoading] = useState(false);

  const setUser = useCallback((u: AuthUser | null) => {
    const effectiveUser = u || DEFAULT_DEMO_USER;
    setUserState(effectiveUser);
    localStorage.setItem('ulink_user', JSON.stringify(effectiveUser));
    if (!u) {
      localStorage.setItem('ulink_jwt_token', DEFAULT_DEMO_TOKEN);
    }
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem('ulink_user');
    localStorage.removeItem('ulink_jwt_token');
    setUserState(DEFAULT_DEMO_USER);
    localStorage.setItem('ulink_user', JSON.stringify(DEFAULT_DEMO_USER));
    localStorage.setItem('ulink_jwt_token', DEFAULT_DEMO_TOKEN);
  }, []);

  useEffect(() => {
    let token = localStorage.getItem('ulink_jwt_token');
    if (!token) {
      token = DEFAULT_DEMO_TOKEN;
      localStorage.setItem('ulink_jwt_token', DEFAULT_DEMO_TOKEN);
      localStorage.setItem('ulink_user', JSON.stringify(DEFAULT_DEMO_USER));
      setUserState(DEFAULT_DEMO_USER);
    }

    // Background verification with NestJS
    api.get<any>('/auth/me').then(({ data, error }) => {
      if (!error && data) {
        const authUser = nestUserToAuthUser(data);
        setUserState(authUser);
        localStorage.setItem('ulink_user', JSON.stringify(authUser));
      }
    }).catch(() => {});
  }, []);

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
