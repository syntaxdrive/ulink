import { useThemeStore } from '../store/themeStore';

export const lightColors = {
  // Base
  background: '#FFFFFF',
  surface: '#F8F9FA',
  surfaceElevated: '#FFFFFF',
  border: '#E5E7EB',
  card: '#FFFFFF',
  
  // Text
  text: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',

  // Brand Core
  primary: '#059669',         // Emerald Green
  primaryLight: '#ECFDF5',    // Light Emerald
  primaryDark: '#047857',

  // Accents (Onboarding & Brand Heritage)
  sunYellow: '#FDE047',
  sunYellowLight: '#FEF08A',
  sunYellowDark: '#B45309',

  lilac: '#DDD6FE',
  lilacLight: '#EDE9FE',
  lilacDark: '#7C3AED',

  coral: '#FB923C',
  coralLight: '#FFEDD5',
  coralDark: '#EA580C',

  mint: '#A7F3D0',
  mintLight: '#ECFDF5',
  mintDark: '#059669',

  // Semantic
  danger: '#EF4444',
  dangerLight: '#FEF2F2',
  warning: '#F59E0B',
  info: '#3B82F6',
  
  // Tab bar & Controls
  tabBar: '#FFFFFF',
  tabActive: '#059669',
  tabInactive: '#9CA3AF',
  inputBg: '#FFFFFF',
  inputBorder: '#E5E7EB',
} as const;

export const darkColors = {
  // Base
  background: '#09090B',       // Zinc 950 Deep Black
  surface: '#18181B',          // Zinc 900 Card
  surfaceElevated: '#202024',  // Zinc 850 Elevated
  border: '#27272A',          // Zinc 800 Border
  card: '#18181B',
  
  // Text
  text: '#FAFAFA',             // Zinc 50 Bright White
  textSecondary: '#A1A1AA',    // Zinc 400 Muted
  textTertiary: '#71717A',     // Zinc 500 Sub-muted

  // Brand Core
  primary: '#10B981',         // Emerald Green
  primaryLight: '#064E3B',    // Dark Emerald Glow
  primaryDark: '#059669',

  // Accents (Muted on Dark)
  sunYellow: '#CA8A04',
  sunYellowLight: '#422006',
  sunYellowDark: '#FEF08A',

  lilac: '#7C3AED',
  lilacLight: '#2E1065',
  lilacDark: '#DDD6FE',

  coral: '#EA580C',
  coralLight: '#431407',
  coralDark: '#FB923C',

  mint: '#059669',
  mintLight: '#064E3B',
  mintDark: '#A7F3D0',

  // Semantic
  danger: '#F87171',
  dangerLight: '#450A0A',
  warning: '#FBBF24',
  info: '#60A5FA',
  
  // Tab bar & Controls
  tabBar: '#121214',
  tabActive: '#10B981',
  tabInactive: '#71717A',
  inputBg: '#18181B',
  inputBorder: '#27272A',
} as const;

export type ThemeColors = typeof lightColors;

// Backward-compatible default colors
export const colors = lightColors;

export const getColors = (isDark: boolean): ThemeColors => {
  return (isDark ? darkColors : lightColors) as ThemeColors;
};

export const useTheme = () => {
  const isDark = useThemeStore((s) => s.isDark);
  const themeMode = useThemeStore((s) => s.themeMode);
  const setThemeMode = useThemeStore((s) => s.setThemeMode);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  const themeColors = getColors(isDark);

  return {
    colors: themeColors,
    isDark,
    themeMode,
    setThemeMode,
    toggleTheme,
  };
};
