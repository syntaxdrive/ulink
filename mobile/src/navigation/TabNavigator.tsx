import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Home, Users, PlusSquare, Bell, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/colors';
import { supabase } from '../lib/supabase';

import FeedScreen from '../screens/main/FeedScreen';
import NetworkScreen from '../screens/main/NetworkScreen';
import CreatePostScreen from '../screens/main/CreatePostScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

const Tab = createMaterialTopTabNavigator();

function CustomSwipeableBottomBar({ state, descriptors, navigation, unreadCount }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  return (
    <View
      style={[
        styles.tabBarContainer,
        {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          paddingBottom: Math.max(insets.bottom, 12),
        },
      ]}
    >
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const iconColor = isFocused ? colors.primary : colors.tabInactive;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabButton}
            activeOpacity={0.7}
          >
            {route.name === 'Home' && (
              <View style={[styles.iconBox, isFocused && { backgroundColor: isDark ? '#064E3B' : '#ECFDF5' }]}>
                <Home color={iconColor} size={23} />
              </View>
            )}

            {route.name === 'Network' && (
              <View style={[styles.iconBox, isFocused && { backgroundColor: isDark ? '#064E3B' : '#ECFDF5' }]}>
                <Users color={iconColor} size={23} />
              </View>
            )}

            {route.name === 'Create' && (
              <View style={[styles.createButtonGlow, { backgroundColor: colors.primary }]}>
                <PlusSquare color="#FFFFFF" size={23} />
              </View>
            )}

            {route.name === 'Notifications' && (
              <View style={[styles.iconBox, isFocused && { backgroundColor: isDark ? '#064E3B' : '#ECFDF5' }]}>
                <Bell color={iconColor} size={23} />
                {unreadCount > 0 && (
                  <View style={[styles.badgeContainer, { backgroundColor: '#EF4444' }]}>
                    <Text style={styles.badgeText}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {route.name === 'Profile' && (
              <View style={[styles.iconBox, isFocused && { backgroundColor: isDark ? '#064E3B' : '#ECFDF5' }]}>
                <User color={iconColor} size={23} />
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabNavigator() {
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notifications count for the bottom badge
  useEffect(() => {
    let channel: any;

    const fetchBadge = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { count, error } = await supabase
          .from('notifications')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', session.user.id)
          .eq('read', false);

        if (!error && count !== null) {
          setUnreadCount(count);
        }
      } catch (err) {
        console.warn('Error fetching notification badge count:', err);
      }
    };

    fetchBadge();

    // Subscribe to realtime notification changes
    channel = supabase
      .channel('mobile-tab-notif-badge')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        () => fetchBadge()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Tab.Navigator
      tabBarPosition="bottom"
      tabBar={(props) => <CustomSwipeableBottomBar {...props} unreadCount={unreadCount} />}
      screenOptions={{
        swipeEnabled: true,
        animationEnabled: true,
        lazy: true,
      }}
    >
      <Tab.Screen name="Home"          component={FeedScreen} />
      <Tab.Screen name="Network"       component={NetworkScreen} />
      <Tab.Screen name="Create"        component={CreatePostScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile"       component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 8,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconBox: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  createButtonGlow: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeContainer: {
    position: 'absolute',
    top: 2,
    right: 6,
    borderRadius: 9,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '900',
  },
});
