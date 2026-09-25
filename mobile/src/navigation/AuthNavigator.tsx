import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/auth/SplashScreen';
import OnboardingIntroScreen from '../screens/auth/OnboardingIntroScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import ProfileOnboardingScreen from '../screens/auth/ProfileOnboardingScreen';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash"            component={SplashScreen} />
      <Stack.Screen name="Onboarding"        component={OnboardingIntroScreen} />
      <Stack.Screen name="Login"             component={LoginScreen} />
      <Stack.Screen name="ProfileOnboarding" component={ProfileOnboardingScreen} />
    </Stack.Navigator>
  );
}
