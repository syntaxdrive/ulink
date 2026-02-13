import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../features/auth/AuthContext';
import { OnboardingScreen } from '../features/onboarding/OnboardingScreen';
import { LoginScreen } from '../features/auth/LoginScreen';
import { SignupScreen } from '../features/auth/SignupScreen';
import { CommunityDetailScreen } from '../features/communities/CommunityDetailScreen';
import { PostDetailsScreen } from '../features/feed/PostDetailsScreen';
import { SearchScreen } from '../features/search/SearchScreen';
import { SettingsScreen } from '../features/settings/SettingsScreen';
import { EditProfileScreen } from '../features/profile/EditProfileScreen';
import { MenuScreen } from '../features/menu/MenuScreen';
import { NetworkScreen } from '../features/network/NetworkScreen';
import { JobsScreen } from '../features/jobs/JobsScreen';
import { MessagesScreen } from '../features/messages/MessagesScreen';
import { ChatScreen } from '../features/messages/ChatScreen';
import { AdminScreen } from '../features/admin/AdminScreen';
import { AppNavigator } from './AppNavigator';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
    const { session, loading } = useAuth();

    if (loading) {
        return null; // Splash screen handles this visually
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {session ? (
                    <>
                        <Stack.Screen name="App" component={AppNavigator} />
                        <Stack.Screen name="CommunityDetail" component={CommunityDetailScreen} />
                        <Stack.Screen name="PostDetails" component={PostDetailsScreen} />
                        <Stack.Screen name="Search" component={SearchScreen} />
                        <Stack.Screen name="Settings" component={SettingsScreen} />
                        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                        <Stack.Screen
                            name="Menu"
                            component={MenuScreen}
                            options={{
                                presentation: 'transparentModal',
                                animation: 'fade'
                            }}
                        />
                        <Stack.Screen name="Admin" component={AdminScreen} />
                        <Stack.Screen name="Network" component={NetworkScreen} />
                        <Stack.Screen name="Jobs" component={JobsScreen} />
                        <Stack.Screen name="Messages" component={MessagesScreen} />
                        <Stack.Screen name="Chat" component={ChatScreen} />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                        <Stack.Screen name="Signup" component={SignupScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};
