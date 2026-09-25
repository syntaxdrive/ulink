import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { type NotificationItem, type GeneralNotification } from '../features/notifications/hooks/useNotifications';

interface NotificationStore {
    requests: NotificationItem[];
    generalNotifications: GeneralNotification[];
    lastFetched: number;

    setRequests: (requests: NotificationItem[]) => void;
    setGeneralNotifications: (notifs: GeneralNotification[]) => void;
    addGeneralNotification: (notif: GeneralNotification) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    removeRequest: (id: string) => void;
    removeGeneralNotifications: (ids: string[]) => void;
    clearGeneralNotifications: () => void;
    needsRefresh: () => boolean;
}

export const useNotificationStore = create<NotificationStore>()(
    persist(
        (set, get) => ({
            requests: [],
            generalNotifications: [],
            lastFetched: 0,

            setRequests: (requests) => set({ requests }),
            setGeneralNotifications: (notifs) => set({ generalNotifications: notifs, lastFetched: Date.now() }),
            addGeneralNotification: (notif) => set((state) => {
                if (state.generalNotifications.some(n => n.id === notif.id)) return state;
                return { generalNotifications: [notif, ...state.generalNotifications] };
            }),
            markAsRead: (id) => set((state) => ({
                generalNotifications: state.generalNotifications.map(n => n.id === id ? { ...n, read: true } : n)
            })),
            markAllAsRead: () => set((state) => ({
                generalNotifications: state.generalNotifications.map(n => ({ ...n, read: true }))
            })),
            removeRequest: (id) => set((state) => ({ requests: state.requests.filter(r => r.id !== id) })),
            removeGeneralNotifications: (ids) => set((state) => ({
                generalNotifications: state.generalNotifications.filter(n => !ids.includes(n.id))
            })),
            clearGeneralNotifications: () => set({ generalNotifications: [] }),

            // 10 minute cache to save bandwidth
            needsRefresh: () => Date.now() - get().lastFetched > 1000 * 60 * 10,
        }),
        {
            name: 'ulink-notification-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ 
                generalNotifications: state.generalNotifications.slice(0, 30),
                requests: state.requests.slice(0, 20) 
            }),
        }
    )
);
