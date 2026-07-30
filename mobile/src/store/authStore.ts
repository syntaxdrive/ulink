import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

interface AuthState {
  token: string | null;
  isLoading: boolean;
  setToken: (token: string | null) => Promise<void>;
  checkToken: () => Promise<void>;
  logout: () => Promise<void>;
}

const TOKEN_KEY = 'ulink_auth_token';

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  isLoading: true,
  
  setToken: async (token) => {
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
    set({ token });
  },

  checkToken: async () => {
    try {
      let token: string | null = null;
      if (Platform.OS === 'web') {
        token = localStorage.getItem(TOKEN_KEY);
      } else {
        token = await SecureStore.getItemAsync(TOKEN_KEY);
      }
      set({ token, isLoading: false });
    } catch (error) {
      console.error('Failed to load token', error);
      set({ token: null, isLoading: false });
    }
  },

  logout: async () => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(TOKEN_KEY);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
    set({ token: null });
  }
}));
