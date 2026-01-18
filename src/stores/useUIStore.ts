import { create } from 'zustand';

interface UIState {
    isImmersive: boolean;
    setImmersive: (value: boolean) => void;
    toggleImmersive: () => void;
}

export const useUIStore = create<UIState>((set) => ({
    isImmersive: false,
    setImmersive: (value) => set({ isImmersive: value }),
    toggleImmersive: () => set((state) => ({ isImmersive: !state.isImmersive })),
}));
