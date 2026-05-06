import { create } from 'zustand';

interface AuthModalState {
    isOpen: boolean;
    message: string;
    openAuthModal: (message?: string) => void;
    closeAuthModal: () => void;
}

export const useAuthModalStore = create<AuthModalState>((set) => ({
    isOpen: false,
    message: 'Sign in to continue',
    openAuthModal: (message = 'Sign in to continue') => set({ isOpen: true, message }),
    closeAuthModal: () => set({ isOpen: false }),
}));
