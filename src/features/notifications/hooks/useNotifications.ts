import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { type Profile } from '../../../types';
import { useNotificationStore } from '../../../stores/useNotificationStore';

export interface NotificationItem {
    id: string; // Connection ID
    created_at: string;
    requester: Profile;
}

export interface GeneralNotification {
    id: string;
    type: string;
    content: string;
    created_at: string;
    read: boolean;
    data: any;
    user_id: string; // Recipient
}

export function useNotifications() {
    // Global Store
    const {
        requests,
        generalNotifications,
        setRequests,
        setGeneralNotifications,
        addGeneralNotification,
        removeRequest,
        removeGeneralNotifications,
        clearGeneralNotifications: clearStoreNotifications,
        needsRefresh
    } = useNotificationStore();

    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);

    const fetchNotifications = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            setLoading(true);

            // Fetch General Notifications
            const { data: notifData } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(50);

            if (notifData) setGeneralNotifications(notifData);

            // Fetch pending connection requests
            const { data } = await supabase
                .from('connections')
                .select(`
                    id,
                    created_at,
                    requester:profiles!requester_id (
                        id,
                        name,
                        role,
                        university,
                        avatar_url
                    )
                `)
                .eq('recipient_id', user.id)
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (data) {
                const formatted = data.map((item: any) => ({
                    id: item.id,
                    created_at: item.created_at,
                    requester: item.requester
                }));
                // @ts-ignore
                setRequests(formatted);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [setGeneralNotifications, setRequests]);

    const fetchSingleRequest = async (connectionId: string) => {
        const { data } = await supabase
            .from('connections')
            .select(`
                id,
                created_at,
                requester:profiles!requester_id (*)
            `)
            .eq('id', connectionId)
            .single();

        if (data) {
            setRequests([
                { id: data.id, created_at: data.created_at, requester: data.requester } as any,
                ...requests // safe to spread current store state here? effectively yes for one-time
            ]);
            // Better: update store to handle "prepend" if not redundant. The store `setRequests` replaces all.
            // Let's improve the store usage locally or relies on full re-fetch?
            // Actually, for a single item, we should probably add a `addRequest` to store, but for now re-fetching or prepending locally then setting whole list is okay.
            // To be safe and clean, I will just re-fetch all notifications when a new one comes in, OR implement `addRequest` in store.
            // Since I didn't add `addRequest` to store interface yet, let's just re-fetch for simplicity or append to current list.
            // Current list is available via `requests` from hook.
            const newReq = { id: data.id, created_at: data.created_at, requester: data.requester } as any;
            // Check duplicate
            if (!requests.some(r => r.id === newReq.id)) {
                setRequests([newReq, ...requests]);
            }
        }
    };

    useEffect(() => {
        const init = async () => {
            // 80/20 Rule
            if (needsRefresh() || (requests.length === 0 && generalNotifications.length === 0)) {
                await fetchNotifications();
            } else {
                setLoading(false);
            }
        };
        init();

        const connectionChannel = supabase
            .channel('connection-requests')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'connections' },
                (payload) => {
                    supabase.auth.getUser().then(({ data: { user } }) => {
                        if (user && payload.new.recipient_id === user.id) {
                            fetchSingleRequest(payload.new.id);
                        }
                    });
                }
            )
            .subscribe();

        const notifChannel = supabase
            .channel('general-notifications')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' },
                (payload) => {
                    supabase.auth.getUser().then(({ data: { user } }) => {
                        if (user && payload.new.user_id === user.id) {
                            addGeneralNotification(payload.new as GeneralNotification);
                        }
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(connectionChannel);
            supabase.removeChannel(notifChannel);
        };
    }, []); // Empty dependency array -> mount once

    const handleAction = async (connectionId: string, action: 'accept' | 'reject') => {
        setProcessing(connectionId);
        try {
            if (action === 'accept') {
                const { error } = await supabase
                    .from('connections')
                    .update({ status: 'accepted' })
                    .eq('id', connectionId);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('connections')
                    .update({ status: 'rejected' })
                    .eq('id', connectionId);
                if (error) throw error;
            }

            removeRequest(connectionId);
        } catch (error: any) {
            console.error(`Error ${action}ing request:`, error);
            alert(`Failed to ${action} request: ` + (error?.message || 'Unknown error'));
        } finally {
            setProcessing(null);
        }
    };

    const clearAll = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from('notifications')
                .delete()
                .eq('user_id', user.id);

            if (error) throw error;

            clearStoreNotifications();
        } catch (error) {
            console.error('Error clearing notifications:', error);
            alert('Failed to clear notifications');
        }
    };

    const deleteNotifications = async (ids: string[]) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .delete()
                .in('id', ids);

            if (error) throw error;

            removeGeneralNotifications(ids);
        } catch (error) {
            console.error('Error deleting notifications:', error);
            alert('Failed to delete notifications');
        }
    };

    return {
        requests,
        generalNotifications,
        loading,
        processing,
        handleAction,
        clearAll,
        deleteNotifications
    };
}
