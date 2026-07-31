import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { useAuthStore } from '../store/authStore';

const getBaseURL = () => {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  
  // Extract host IP dynamically from Expo Metro packager (e.g. 10.149.190.193)
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const hostIp = hostUri.split(':')[0];
    if (hostIp) {
      return `http://${hostIp}:3000/api/v1`;
    }
  }

  // Fallback IP for physical devices on local network
  return 'http://10.149.190.193:3000/api/v1';
};

const baseURL = getBaseURL();
const TOKEN_KEY = 'ulink_auth_token';

export const apiClient = axios.create({
  baseURL,
  timeout: 10000, // 10s timeout
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
