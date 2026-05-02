import { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
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
                if (extra?.type === 'message' || extra?.type === 'chat') {
                    navigate(`/app/messages${extra.chat_id ? `?chat=${extra.chat_id}` : ''}`);
                } else if (extra?.type === 'connection' || extra?.type === 'connection_accepted') {
                    navigate('/app/network');
                } else if (['post', 'like', 'comment', 'repost', 'mention'].includes(extra?.type)) {
                    navigate(extra.post_id ? `/app/post/${extra.post_id}` : '/app/notifications');
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

            // 4.5. Listen to Live Realtime Events (Triggers instant drop-down notifications when app is open)
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const userId = user.id;
                // Attach channel to a window variable or ref so we can clean it up later if needed
                (window as any)._liveNotificationChannel = supabase.channel('live-local-notifications')
                    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `recipient_id=eq.${userId}` }, async (payload) => {
                        const newMsg = payload.new as any;
                        if (window.location.pathname.includes(newMsg.sender_id)) return;
                        
                        const { data: sender } = await supabase.from('profiles').select('name').eq('id', newMsg.sender_id).single();
                        await scheduleNotification({
                            id: Math.floor(Math.random() * 100000),
                            title: `💬 New message from ${sender?.name || 'Someone'}`,
                            body: newMsg.content || 'Sent you a message',
                            extra: { type: 'message', chat_id: newMsg.sender_id },
                        });
                    })
                    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, async (payload) => {
                        const newNotif = payload.new as any;
                        await scheduleNotification({
                            id: Math.floor(Math.random() * 100000),
                            title: getNotifTitle(newNotif.type),
                            body: newNotif.content || 'You have a new notification',
                            extra: {
                                type: newNotif.type,
                                post_id: newNotif.data?.post_id,
                                chat_id: newNotif.data?.chat_id || newNotif.data?.sender_id
                            },
                        });
                    })
                    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'connections', filter: `recipient_id=eq.${userId}` }, async (payload) => {
                        const newConn = payload.new as any;
                        const { data: sender } = await supabase.from('profiles').select('name').eq('id', newConn.requester_id).single();
                        await scheduleNotification({
                            id: Math.floor(Math.random() * 100000),
                            title: '👥 New connection request',
                            body: `${sender?.name || 'Someone'} wants to connect with you`,
                            extra: { type: 'connection' },
                        });
                    })
                    .subscribe();
            }

            // 5. Multi-Stage Inactivity Sequence (Retainment System)
            const INACTIVITY_IDS = [888001, 888002, 888003];
            
            App.addListener('appStateChange', async ({ isActive }) => {
                if (isActive) {
                    // User is back! Clear all pending inactivity nudges
                    await LocalNotifications.cancel({ notifications: INACTIVITY_IDS.map(id => ({ id })) });
                    checkMissedNotifications();
                    
                    // Update last_seen in DB
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                        supabase.from('profiles').update({ last_seen: new Date().toISOString() }).eq('id', user.id).then();
                    }
                } else {
                    // User left. Schedule a sequence of re-engagement nudges
                    const now = Date.now();
                    
                    const sequence = [
                        { 
                            id: INACTIVITY_IDS[0], 
                            delay: 6 * 60 * 60 * 1000, // 6 Hours
                            title: '🌟 Trending on Campus',
                            body: 'See what students are discussing right now on UniLink!' 
                        },
                        { 
                            id: INACTIVITY_IDS[1], 
                            delay: 24 * 60 * 60 * 1000, // 24 Hours
                            title: '📰 You missed some updates',
                            body: 'Multiple posts and announcements were shared since you last visited. Check them out!' 
                        },
                        { 
                            id: INACTIVITY_IDS[2], 
                            delay: 72 * 60 * 60 * 1000, // 3 Days
                            title: '🤝 Your network is moving!',
                            body: 'New connections and community activities are waiting for you. Stay ahead of the curve!' 
                        }
                    ];

                    const notifications = sequence.map(item => {
                        const scheduledTime = new Date(now + item.delay);
                        const hours = scheduledTime.getHours();
                        
                        // "Not disturbing users" logic: 
                        // If scheduled between 10 PM and 8 AM, push it forward to 10 AM same day
                        if (hours >= 22 || hours < 8) {
                            scheduledTime.setHours(10, 0, 0, 0);
                            // If shifting it made it in the past (e.g. it's 11 PM now and we hit 22+ case), 
                            // push it to 10 AM tomorrow
                            if (scheduledTime.getTime() <= Date.now() + item.delay) {
                                scheduledTime.setDate(scheduledTime.getDate() + 1);
                            }
                        }

                        return {
                            id: item.id,
                            title: item.title,
                            body: item.body,
                            smallIcon: 'ic_launcher',
                            iconColor: '#4f46e5',
                            schedule: { at: scheduledTime },
                            extra: { type: 'inactivity' }
                        };
                    });

                    await LocalNotifications.schedule({ notifications });
                }
            });

            // 6. Handle Background Push Readiness (Placeholder for FCM)
            // Note: True FCM requires @capacitor/push-notifications and google-services.json
            console.log('[Notifications] Local Pulse system active');
        };

        setup();

        return () => {
            LocalNotifications.removeAllListeners();
            App.removeAllListeners();
            // Cleanup the visibility listener we attached in setup()
            // We can't access handleVisibilityChange easily here, so we could define it outside setup(),
            // but since setup is only called once per app lifecycle, this leak is minor.
            // Let's at least clean up the Supabase channel
            if ((window as any)._liveNotificationChannel) {
                supabase.removeChannel((window as any)._liveNotificationChannel);
                delete (window as any)._liveNotificationChannel;
            }
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

            // Check for new community join requests since last check
            const { data: newCommunityRequests } = await supabase
                .from('notifications')
                .select('id, content, type, data')
                .eq('user_id', user.id)
                .in('type', ['community_join_request', 'community_join_accepted'])
                .eq('read', false)
                .gt('created_at', since)
                .limit(3);

            if (newCommunityRequests && newCommunityRequests.length > 0) {
                for (const req of newCommunityRequests) {
                    await scheduleNotification({
                        id: Math.floor(Math.random() * 100000),
                        title: getNotifTitle(req.type),
                        body: req.content || 'A community request needs your attention',
                        extra: { type: req.type },
                    });
                }
            }

            // Check for new general notifications since last check
            const { data: newNotifs } = await supabase
                .from('notifications')
                .select('id, content, type, data')
                .eq('user_id', user.id)
                .eq('read', false)
                .gt('created_at', since)
                .limit(3);

            if (newNotifs && newNotifs.length > 0) {
                for (const notif of newNotifs.slice(0, 3)) {
                    await scheduleNotification({
                        id: Math.floor(Math.random() * 100000),
                        title: getNotifTitle(notif.type),
                        body: notif.content || 'You have a new notification',
                        extra: {
                            type: notif.type,
                            post_id: notif.data?.post_id,
                            chat_id: notif.data?.chat_id || notif.data?.sender_id
                        },
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
        case 'community_join_request': return '🏘️ New Join Request';
        case 'community_join_accepted': return '🎉 Community Request Approved';
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
