import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../store/authStore';

const PRIMARY_URL = process.env.EXPO_PUBLIC_API_URL || 'https://unilink-api-s6b9.onrender.com/api/v1';
const AZURE_URL = 'http://158.158.120.244/api/v1';

const TOKEN_KEY = 'ulink_auth_token';

export const apiClient = axios.create({
  baseURL: PRIMARY_URL,
  timeout: 12000,
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
  async (error) => {
    const originalRequest = error.config;

    // Automatic Failover between Render HTTPS and Azure VM on network error / timeout
    if (originalRequest && !originalRequest._retry && !error.response) {
      originalRequest._retry = true;
      const currentBase = originalRequest.baseURL || PRIMARY_URL;
      const altBase = currentBase.includes('onrender.com') ? AZURE_URL : PRIMARY_URL;
      originalRequest.baseURL = altBase;
      try {
        return await axios(originalRequest);
      } catch (retryErr) {
        return Promise.reject(retryErr);
      }
    }

    if (error.response?.status === 401 && !originalRequest?.url?.includes('/auth/login')) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);
