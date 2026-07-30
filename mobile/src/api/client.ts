import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../store/authStore';

const baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
const TOKEN_KEY = 'ulink_auth_token';

export const apiClient = axios.create({
  baseURL,
});

apiClient.interceptors.request.use(
  async (config) => {
    let token: string | null = null;
    if (Platform.OS === 'web') {
      token = localStorage.getItem(TOKEN_KEY);
    } else {
      token = await SecureStore.getItemAsync(TOKEN_KEY);
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
