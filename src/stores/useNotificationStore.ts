import { create } from 'zustand';
import { type NotificationItem, type GeneralNotification } from '../features/notifications/hooks/useNotifications';

interface NotificationStore {
    requests: NotificationItem[];
    generalNotifications: GeneralNotification[];
    lastFetched: number;

    setRequests: (requests: NotificationItem[]) => void;
    setGeneralNotifications: (notifs: GeneralNotification[]) => void;
    addGeneralNotification: (notif: GeneralNotification) => void;
    removeRequest: (id: string) => void;
    removeGeneralNotifications: (ids: string[]) => void;
    clearGeneralNotifications: () => void;
    needsRefresh: () => boolean;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
    requests: [],
    generalNotifications: [],
    lastFetched: 0,

    setRequests: (requests) => set({ requests }),
    setGeneralNotifications: (notifs) => set({ generalNotifications: notifs, lastFetched: Date.now() }),
    addGeneralNotification: (notif) => set((state) => {
        if (state.generalNotifications.some(n => n.id === notif.id)) return state;
        return { generalNotifications: [notif, ...state.generalNotifications] };
    }),
    removeRequest: (id) => set((state) => ({ requests: state.requests.filter(r => r.id !== id) })),
    removeGeneralNotifications: (ids) => set((state) => ({
        generalNotifications: state.generalNotifications.filter(n => !ids.includes(n.id))
    })),
    clearGeneralNotifications: () => set({ generalNotifications: [] }),

    // 5 minute cache
    needsRefresh: () => Date.now() - get().lastFetched > 1000 * 60 * 5,
}));
