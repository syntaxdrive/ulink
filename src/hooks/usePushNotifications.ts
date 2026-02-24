import { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, type Token, type ActionPerformed, type PushNotificationSchema } from '@capacitor/push-notifications';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

/**
 * usePushNotifications
 *
 * Registers the device for FCM push notifications, saves the token to Supabase,
 * and routes the user when they tap a notification.
 *
 * Call this hook once at the top of DashboardLayout (or App root).
 */
export function usePushNotifications() {
    const navigate = useNavigate();
    const registered = useRef(false);

    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return; // web — skip
        if (registered.current) return;
        registered.current = true;

        const setup = async () => {
            // 1. Request permission
            const permResult = await PushNotifications.requestPermissions();
            if (permResult.receive !== 'granted') {
                console.warn('[Push] Permission denied');
                return;
            }

            // 2. Register with FCM
            await PushNotifications.register();

            // 3. Save FCM token to Supabase so the server can send pushes
            PushNotifications.addListener('registration', async (token: Token) => {
                console.log('[Push] FCM token:', token.value);
                await savePushToken(token.value);
            });

            PushNotifications.addListener('registrationError', (err) => {
                console.error('[Push] Registration error:', err);
            });

            // 4. Foreground notifications — show an in-app toast
            PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
                console.log('[Push] Foreground notification:', notification);
                // The app is open — Supabase Realtime already handles the badge/toast.
                // Nothing extra needed here.
            });

            // 5. User tapped a notification — deep link to the right screen
            PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
                const data = action.notification.data;
                console.log('[Push] Tapped notification data:', data);

                if (data?.type === 'message') {
                    navigate(`/app/messages${data.chat_id ? `?chat=${data.chat_id}` : ''}`);
                } else if (data?.type === 'connection_request') {
                    navigate('/app/notifications');
                } else if (data?.type === 'post') {
                    navigate(data.post_id ? `/app/post/${data.post_id}` : '/app');
                } else {
                    navigate('/app/notifications');
                }
            });
        };

        setup();

        return () => {
            PushNotifications.removeAllListeners();
        };
    }, [navigate]);
}

/**
 * Save / update the device FCM token in the `push_tokens` table.
 * This table is read by Supabase Edge Functions to know where to send pushes.
 */
async function savePushToken(token: string) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const platform = Capacitor.getPlatform(); // 'android' | 'ios'

        await supabase
            .from('push_tokens')
            .upsert(
                {
                    user_id: user.id,
                    token,
                    platform,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: 'user_id,platform' }
            );

        console.log('[Push] Token saved to Supabase');
    } catch (err) {
        console.error('[Push] Failed to save token:', err);
    }
}
