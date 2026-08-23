import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';

// Complete auth session if redirected back to in-app browser
WebBrowser.maybeCompleteAuthSession();

// Pure JS query/hash parameter parser compatible with Hermes engine
function parseUrlParams(url: string): Record<string, string> {
  const params: Record<string, string> = {};
  if (!url) return params;

  // Extract hash fragment (#access_token=...&refresh_token=...)
  if (url.includes('#')) {
    const hash = url.split('#')[1];
    hash.split('&').forEach((pair) => {
      const [k, v] = pair.split('=');
      if (k) params[decodeURIComponent(k)] = decodeURIComponent(v || '');
    });
  }

  // Extract query string (?code=... or ?access_token=...)
  if (url.includes('?')) {
    const query = url.split('?')[1]?.split('#')[0];
    if (query) {
      query.split('&').forEach((pair) => {
        const [k, v] = pair.split('=');
        if (k && !params[k]) params[decodeURIComponent(k)] = decodeURIComponent(v || '');
      });
    }
  }

  return params;
}

interface AuthState {
  token: string | null;
  userId: string | null;
  isLoading: boolean;
  setToken: (token: string | null, userId?: string | null) => Promise<void>;
  checkToken: () => Promise<void>;
  createSessionFromUrl: (url: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string; userId?: string }>;
  logout: () => Promise<void>;
}

const TOKEN_KEY = 'ulink_auth_token';

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  userId: null,
  isLoading: true,

  setToken: async (token, userId = null) => {
    if (Platform.OS === 'web') {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    } else {
      if (token) {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
      } else {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      }
    }
    set({ token, userId });
  },

  createSessionFromUrl: async (url: string) => {
    try {
      if (!url) return false;
      const params = parseUrlParams(url);

      const accessToken = params.access_token;
      const refreshToken = params.refresh_token;
      const code = params.code;

      if (accessToken && refreshToken) {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) throw error;
        if (data?.session?.user) {
          await get().setToken(data.session.access_token, data.session.user.id);
          return true;
        }
      } else if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) throw error;
        if (data?.session?.user) {
          await get().setToken(data.session.access_token, data.session.user.id);
          return true;
        }
      }

      // Fallback: check session from client
      const { data: currentSession } = await supabase.auth.getSession();
      if (currentSession?.session?.user) {
        await get().setToken(
          currentSession.session.access_token,
          currentSession.session.user.id
        );
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Error creating session from URL:', err);
      return false;
    }
  },

  signInWithGoogle: async () => {
    try {
      // 1. Create redirect URI for native Expo app
      const redirectUrl = AuthSession.makeRedirectUri({
        scheme: 'unilink',
      });

      // 2. Request Google OAuth authorization URL from Supabase
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
          queryParams: {
            prompt: 'select_account',
            access_type: 'offline',
          },
        },
      });

      if (error || !data?.url) {
        throw new Error(error?.message || 'Could not initiate Google authentication.');
      }

      // 3. Open in-app browser session
      const res = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

      if (res.type === 'success' && res.url) {
        const success = await get().createSessionFromUrl(res.url);
        if (success) {
          const currentUserId = get().userId;
          return { success: true, userId: currentUserId || undefined };
        }
      }

      // If user came back or dismissed, check if session was established
      const { data: currentSession } = await supabase.auth.getSession();
      if (currentSession?.session?.user) {
        await get().setToken(
          currentSession.session.access_token,
          currentSession.session.user.id
        );
        return {
          success: true,
          userId: currentSession.session.user.id,
        };
      }

      if (res.type === 'cancel' || res.type === 'dismiss') {
        return { success: false, error: 'Sign in cancelled' };
      }

      return { success: false, error: 'Authentication could not be completed.' };
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      return { success: false, error: err.message || 'Google Sign-In failed.' };
    }
  },

  checkToken: async () => {
    try {
      // 1. Check Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        set({
          token: session.access_token,
          userId: session.user.id,
          isLoading: false,
        });
        return;
      }

      // 2. Check stored local token
      let token: string | null = null;
      if (Platform.OS === 'web') {
        token = typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
      } else {
        token = await SecureStore.getItemAsync(TOKEN_KEY);
      }
      set({ token, isLoading: false });
    } catch (error) {
      console.error('Failed to load token', error);
      set({ token: null, userId: null, isLoading: false });
    }
  },

  logout: async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase signOut error:', e);
    }

    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') localStorage.removeItem(TOKEN_KEY);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
    set({ token: null, userId: null });
  },
}));
