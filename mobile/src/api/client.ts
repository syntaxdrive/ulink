import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../store/authStore';

/**
 * API base URL resolution:
 * 1. Use EXPO_PUBLIC_API_URL if set in EAS env (production backend URL)
 * 2. Otherwise use a non-crashing placeholder — the app primarily uses Supabase directly.
 *    NestJS is only a fallback and its unavailability should not crash the app.
 *
 * NOTE: Constants.expoConfig.hostUri is ONLY available in Expo Go dev mode.
 * In standalone APK builds it is always null/undefined. The old code silently
 * fell back to a hardcoded local LAN IP (10.149.190.193) which fails in production.
 */
const getBaseURL = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  // All primary data comes from Supabase directly.
  // NestJS API calls fail gracefully (caught by try/catch in callers).
  return 'http://localhost:3000/api/v1';
};

const baseURL = getBaseURL();
const TOKEN_KEY = 'ulink_auth_token';

export const apiClient = axios.create({
  baseURL,
  timeout: 8000,
});

apiClient.interceptors.request.use(
  async (config) => {
    try {
      let token: string | null = null;
      if (Platform.OS === 'web') {
        token = typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
      } else {
        token = await SecureStore.getItemAsync(TOKEN_KEY);
      }
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // SecureStore read failure is non-fatal
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);
