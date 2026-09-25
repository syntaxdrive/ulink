import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { supabase } from '../lib/supabase';

// Check if running inside Expo Go client
const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
  (Constants as any).appOwnership === 'expo';

// Lazily load expo-notifications ONLY in standalone / development builds
function getNotificationsModule() {
  if (isExpoGo || Platform.OS === 'web') {
    return null;
  }
  try {
    return require('expo-notifications');
  } catch (e) {
    return null;
  }
}

// Configure notification presentation only when outside Expo Go
const Notifications = getNotificationsModule();
if (Notifications && typeof Notifications.setNotificationHandler === 'function') {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
        priority: Notifications.AndroidNotificationPriority?.HIGH ?? 2,
      }),
    });
  } catch (e) {
    // Handler initialization fallback
  }
}

export const notificationService = {
  async registerForPushNotificationsAsync(userId?: string): Promise<string | null> {
    if (Platform.OS === 'web' || isExpoGo) {
      return null;
    }

    const Notif = getNotificationsModule();
    if (!Notif) return null;

    try {
      if (Platform.OS === 'android' && typeof Notif.setNotificationChannelAsync === 'function') {
        await Notif.setNotificationChannelAsync('default', {
          name: 'UniLink Notifications',
          importance: Notif.AndroidImportance?.MAX ?? 5,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#059669',
          sound: 'default',
        });

        await Notif.setNotificationChannelAsync('messages', {
          name: 'Direct Messages',
          importance: Notif.AndroidImportance?.HIGH ?? 4,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#10B981',
          sound: 'default',
        });
      }

      const { status: existingStatus } = await Notif.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notif.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        return null;
      }

      const tokenData = await Notif.getExpoPushTokenAsync({
        projectId: '511f065d-4ce7-43b2-aa86-f7cd7a651c41',
      }).catch(() => null);

      const token = tokenData?.data || null;

      if (token && userId) {
        try {
          await supabase
            .from('profiles')
            .update({ expo_push_token: token, updated_at: new Date().toISOString() })
            .eq('id', userId);
        } catch {}
      }

      return token;
    } catch (error) {
      console.warn('Error setting up notifications:', error);
      return null;
    }
  },

  async sendLocalWelcomeNotification(userName?: string) {
    if (Platform.OS === 'web' || isExpoGo) return;

    const Notif = getNotificationsModule();
    if (!Notif || typeof Notif.scheduleNotificationAsync !== 'function') return;

    try {
      await Notif.scheduleNotificationAsync({
        content: {
          title: '🎉 Welcome to UniLink!',
          body: `Hey ${userName || 'there'}, your campus profile is ready! Connect with peers and tune into student podcasts.`,
          data: { type: 'welcome' },
          sound: 'default',
        },
        trigger: null,
      });
    } catch (e) {
      // Local notification fallback
    }
  },

  async dispatchWelcomeFlow(userId: string, userName: string, universityName?: string) {
    try {
      await this.sendLocalWelcomeNotification(userName);

      const uniText = universityName ? ` at ${universityName}` : '';
      try {
        await supabase.from('notifications').insert({
          user_id: userId,
          type: 'welcome',
          title: 'Welcome to UniLink! 🎓',
          message: `Welcome to your campus community${uniText}! Connect with fellow students, tune into podcasts, and share campus updates.`,
          read: false,
          created_at: new Date().toISOString(),
        });
      } catch {}

      const { data: adminProfiles } = await supabase
        .from('profiles')
        .select('id, name')
        .or('is_verified.eq.true,role.eq.admin')
        .limit(1);

      const botSenderId = adminProfiles?.[0]?.id || '00000000-0000-0000-0000-000000000000';

      const welcomeMessage = `Hey ${userName || 'there'}! Welcome to UniLink 🚀

Here are 3 quick things you can explore on campus today:
1. 🔍 Connect with fellow students in the Network tab.
2. 🎙️ Tune into campus podcasts or host your own show.
3. 📚 Explore study circles and campus resources.

If you ever need help, we are always here for you!`;

      try {
        await supabase.from('messages').insert({
          sender_id: botSenderId,
          recipient_id: userId,
          content: welcomeMessage,
          created_at: new Date().toISOString(),
        });
      } catch {}
    } catch (error) {
      console.warn('Welcome flow dispatch error:', error);
    }
  },
};
