import { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications, type ScheduleOptions } from '@capacitor/local-notifications';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

/**
 * useLocalNotifications — Firebase-free notification system
 *
 * How it works:
 * 1. Uses @capacitor/local-notifications to show native Android notifications
 * 2. When app opens (foreground), Supabase Realtime already handles live updates
 * 3. When app comes back from background, we check for missed notifications
 * 4. Notifications are triggered by Supabase DB changes, not FCM
 *
 * This requires NO Firebase, NO google-services.json, NO external service.
 */
export function useLocalNotifications() {
    const navigate = useNavigate();
    const lastCheckedRef = useRef<string>(new Date().toISOString());
    const setupDone = useRef(false);

    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;
        if (setupDone.current) return;
        setupDone.current = true;

        const setup = async () => {
            // 1. Request notification permission
            const { display } = await LocalNotifications.requestPermissions();
            if (display !== 'granted') {
                console.warn('[Notifications] Permission denied');
                return;
            }

            // 2. Handle notification tap — deep link to the right screen
            await LocalNotifications.addListener('localNotificationActionPerformed', (event) => {
                const extra = event.notification.extra;
                if (extra?.type === 'message') {
                    navigate(`/app/messages${extra.chat_id ? `?chat=${extra.chat_id}` : ''}`);
                } else if (extra?.type === 'connection') {
                    navigate('/app/notifications');
                } else if (extra?.type === 'post') {
                    navigate(extra.post_id ? `/app/post/${extra.post_id}` : '/app');
                } else {
                    navigate('/app/notifications');
                }
            });

            // 3. When app comes back to foreground, fetch missed notifications
            const handleVisibilityChange = () => {
                if (document.visibilityState === 'visible') {
                    checkMissedNotifications();
                }
            };
            document.addEventListener('visibilitychange', handleVisibilityChange);

            return () => {
                document.removeEventListener('visibilitychange', handleVisibilityChange);
            };

            // 4. Initial check when app first opens
            await checkMissedNotifications();
        };

        setup();

        return () => {
            LocalNotifications.removeAllListeners();
        };
    }, [navigate]);

    const checkMissedNotifications = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const since = lastCheckedRef.current;
            lastCheckedRef.current = new Date().toISOString();

            // Check for unread messages since last check
            const { data: newMessages } = await supabase
                .from('messages')
                .select('id, content, sender_id, profiles!sender_id(name)')
                .eq('recipient_id', user.id)
                .is('read_at', null)
                .gt('created_at', since)
                .order('created_at', { ascending: false })
                .limit(5);

            if (newMessages && newMessages.length > 0) {
                const uniqueSenders = [...new Map(
                    newMessages.map(m => [m.sender_id, m])
                ).values()];

                for (const msg of uniqueSenders) {
                    const senderName = (msg.profiles as any)?.name || 'Someone';
                    await scheduleNotification({
                        id: Math.floor(Math.random() * 100000),
                        title: `💬 New message from ${senderName}`,
                        body: msg.content || 'Sent you a message',
                        extra: { type: 'message', chat_id: msg.sender_id },
                    });
                }
            }

            // Check for new connection requests since last check
            const { data: newConnections } = await supabase
                .from('connections')
                .select('id, profiles!requester_id(name)')
                .eq('recipient_id', user.id)
                .eq('status', 'pending')
                .gt('created_at', since)
                .limit(3);

            if (newConnections && newConnections.length > 0) {
                const firstName = (newConnections[0].profiles as any)?.name || 'Someone';
                const extra = newConnections.length > 1
                    ? `and ${newConnections.length - 1} others`
                    : '';
                await scheduleNotification({
                    id: Math.floor(Math.random() * 100000),
                    title: '👥 New connection request',
                    body: `${firstName} ${extra} wants to connect with you`,
                    extra: { type: 'connection' },
                });
            }

            // Check for new general notifications since last check
            const { data: newNotifs } = await supabase
                .from('notifications')
                .select('id, content, type')
                .eq('user_id', user.id)
                .eq('read', false)
                .gt('created_at', since)
                .limit(3);

            if (newNotifs && newNotifs.length > 0) {
                for (const notif of newNotifs.slice(0, 2)) {
                    await scheduleNotification({
                        id: Math.floor(Math.random() * 100000),
                        title: getNotifTitle(notif.type),
                        body: notif.content || 'You have a new notification',
                        extra: { type: notif.type },
                    });
                }
            }
        } catch (err) {
            console.error('[Notifications] Check failed:', err);
        }
    };
}

function getNotifTitle(type: string): string {
    switch (type) {
        case 'like': return '❤️ Someone liked your post';
        case 'comment': return '💬 New comment on your post';
        case 'share': return '🔄 Someone shared your post';
        default: return '🔔 New notification';
    }
}

async function scheduleNotification(opts: {
    id: number;
    title: string;
    body: string;
    extra?: Record<string, string>;
}) {
    const schedule: ScheduleOptions = {
        notifications: [{
            id: opts.id,
            title: opts.title,
            body: opts.body,
            smallIcon: 'ic_launcher',
            iconColor: '#059669',
            extra: opts.extra,
            schedule: { at: new Date(Date.now() + 500) }, // near-instant
        }],
    };
    await LocalNotifications.schedule(schedule);
}
