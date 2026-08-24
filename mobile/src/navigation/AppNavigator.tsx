import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../theme/colors';
import * as Linking from 'expo-linking';

import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';
import MessagesScreen from '../screens/main/MessagesScreen';
import PodcastScreen from '../screens/main/PodcastScreen';
import PodcastsScreen from '../screens/main/PodcastsScreen';
import StudyRoomScreen from '../screens/main/StudyRoomScreen';
import LeaderboardScreen from '../screens/main/LeaderboardScreen';
import CommunitiesScreen from '../screens/main/CommunitiesScreen';
import CommunityDetailScreen from '../screens/main/CommunityDetailScreen';
import StudyScreen from '../screens/main/StudyScreen';
import SearchScreen from '../screens/main/SearchScreen';
import AdminScreen from '../screens/main/AdminScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import { GlobalAudioEngine } from '../components/GlobalAudioEngine';
import { GlobalMiniPlayer } from '../components/GlobalMiniPlayer';
import { GlobalPublishBanner } from '../components/GlobalPublishBanner';

const Stack = createNativeStackNavigator();

function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs"        component={TabNavigator} />
      <Stack.Screen name="Profile"         component={ProfileScreen} />
      <Stack.Screen name="Messages"        component={MessagesScreen} />
      <Stack.Screen name="Podcasts"        component={PodcastsScreen} />
      <Stack.Screen name="Podcast"         component={PodcastScreen} />
      <Stack.Screen name="Communities"     component={CommunitiesScreen} />
      <Stack.Screen name="CommunityDetail" component={CommunityDetailScreen} />
      <Stack.Screen name="StudyRoom"       component={StudyRoomScreen} />
      <Stack.Screen name="Leaderboard"     component={LeaderboardScreen} />
      <Stack.Screen name="Study"           component={StudyScreen} />
      <Stack.Screen name="Search"          component={SearchScreen} />
      <Stack.Screen name="Admin"           component={AdminScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { token, isLoading, checkToken, createSessionFromUrl } = useAuthStore();
  const { colors, isDark } = useTheme();

  useEffect(() => {
    checkToken();
    useThemeStore.getState().initTheme();

    // 1. Listen for deep link events when app is opened via custom scheme
    const subscription = Linking.addEventListener('url', async (event) => {
      if (event.url) {
        await createSessionFromUrl(event.url);
      }
    });

    // 2. Check if the app was launched directly from a deep link URL
    Linking.getInitialURL().then(async (url) => {
      if (url) {
        await createSessionFromUrl(url);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const baseTheme = isDark ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...baseTheme,
    dark: isDark,
    colors: {
      ...baseTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      notification: colors.danger,
    },
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <NavigationContainer theme={navTheme}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        {token ? <MainNavigator /> : <AuthNavigator />}
      </NavigationContainer>
      <GlobalAudioEngine />
      {token ? <GlobalMiniPlayer /> : null}
      <GlobalPublishBanner />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
