import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';
import MessagesScreen from '../screens/main/MessagesScreen';
import PodcastScreen from '../screens/main/PodcastScreen';
import StudyRoomScreen from '../screens/main/StudyRoomScreen';

const Stack = createNativeStackNavigator();

function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="Messages" component={MessagesScreen} />
      <Stack.Screen name="Podcast" component={PodcastScreen} />
      <Stack.Screen name="StudyRoom" component={StudyRoomScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { token, isLoading, checkToken } = useAuthStore();

  useEffect(() => {
    checkToken();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {token ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
