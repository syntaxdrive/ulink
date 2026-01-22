import { create } from 'zustand';

interface UIState {
    isImmersive: boolean;
    setImmersive: (value: boolean) => void;
    toggleImmersive: () => void;
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    setDarkMode: (value: boolean) => void;
    showSplash: boolean;
    setShowSplash: (value: boolean) => void;
}

// Initialize dark mode from localStorage or system preference
const getInitialDarkMode = () => {
    const stored = localStorage.getItem('darkMode');
    if (stored !== null) {
        return stored === 'true';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

// Initialize splash screen state
const getInitialSplashState = () => {
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
    return hasSeenSplash !== 'true';
};

export const useUIStore = create<UIState>((set) => ({
    isImmersive: false,
    setImmersive: (value) => set({ isImmersive: value }),
    toggleImmersive: () => set((state) => ({ isImmersive: !state.isImmersive })),

    isDarkMode: getInitialDarkMode(),
    toggleDarkMode: () => set((state) => {
        const newValue = !state.isDarkMode;
        localStorage.setItem('darkMode', String(newValue));
        document.documentElement.classList.toggle('dark', newValue);
        return { isDarkMode: newValue };
    }),
    setDarkMode: (value) => {
        localStorage.setItem('darkMode', String(value));
        document.documentElement.classList.toggle('dark', value);
        set({ isDarkMode: value });
    },

    showSplash: getInitialSplashState(),
    setShowSplash: (value) => {
        if (!value) {
            sessionStorage.setItem('hasSeenSplash', 'true');
        }
        set({ showSplash: value });
    },
}));
