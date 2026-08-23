import { create } from 'zustand';
import { Appearance, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
  initTheme: () => Promise<void>;
}

const THEME_KEY = 'ulink_theme_mode';

const getSystemIsDark = () => Appearance.getColorScheme() === 'dark';

export const useThemeStore = create<ThemeState>((set, get) => ({
  themeMode: 'system',
  isDark: getSystemIsDark(),

  initTheme: async () => {
    try {
      let savedMode: string | null = null;
      if (Platform.OS === 'web') {
        savedMode = typeof localStorage !== 'undefined' ? localStorage.getItem(THEME_KEY) : null;
      } else {
        savedMode = await SecureStore.getItemAsync(THEME_KEY);
      }

      const mode: ThemeMode = (savedMode as ThemeMode) || 'system';
      const isDark = mode === 'system' ? getSystemIsDark() : mode === 'dark';

      set({ themeMode: mode, isDark });

      // Listen for system appearance changes
      Appearance.addChangeListener(({ colorScheme }) => {
        if (get().themeMode === 'system') {
          set({ isDark: colorScheme === 'dark' });
        }
      });
    } catch (e) {
      console.warn('Error loading theme:', e);
    }
  },

  setThemeMode: async (mode: ThemeMode) => {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') localStorage.setItem(THEME_KEY, mode);
    } else {
      await SecureStore.setItemAsync(THEME_KEY, mode);
    }

    const isDark = mode === 'system' ? getSystemIsDark() : mode === 'dark';
    set({ themeMode: mode, isDark });
  },

  toggleTheme: async () => {
    const currentIsDark = get().isDark;
    const newMode: ThemeMode = currentIsDark ? 'light' : 'dark';
    await get().setThemeMode(newMode);
  },
}));
