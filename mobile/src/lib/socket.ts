import { io, Socket } from 'socket.io-client';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'ulink_auth_token';

const getBaseServerUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/api\/v1\/?$/, '');
  }
  return 'http://localhost:3000';
};

const getToken = async (): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      return typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    }
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
};

let chatSocket: Socket | null = null;
let notifSocket: Socket | null = null;

export const getChatSocket = async (): Promise<Socket> => {
  if (chatSocket && chatSocket.connected) {
    return chatSocket;
  }
  const token = await getToken();
  const serverUrl = getBaseServerUrl();

  chatSocket = io(`${serverUrl}/chat`, {
    transports: ['websocket'],
    autoConnect: true,
    query: token ? { token } : {},
  });

  return chatSocket;
};

export const getNotifSocket = async (): Promise<Socket> => {
  if (notifSocket && notifSocket.connected) {
    return notifSocket;
  }
  const token = await getToken();
  const serverUrl = getBaseServerUrl();

  notifSocket = io(`${serverUrl}/notif`, {
    transports: ['websocket'],
    autoConnect: true,
    query: token ? { token } : {},
  });

  return notifSocket;
};

export const disconnectSockets = () => {
  if (chatSocket) {
    chatSocket.disconnect();
    chatSocket = null;
  }
  if (notifSocket) {
    notifSocket.disconnect();
    notifSocket = null;
  }
};
