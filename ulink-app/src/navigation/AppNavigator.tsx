import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DashboardScreen } from '../features/feed/DashboardScreen';
import { ProfileScreen } from '../features/profile/ProfileScreen';
import { CommunitiesScreen } from '../features/communities/CommunitiesScreen';
import { NotificationsScreen } from '../features/notifications/NotificationsScreen';
import { SearchScreen } from '../features/search/SearchScreen';
import { colors } from '../theme/colors';
import { Home, User, PlusSquare, Users, Bell, Search } from 'lucide-react-native';
import { View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';

const Tab = createBottomTabNavigator();

export const AppNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    elevation: 0,
                    backgroundColor: 'transparent',
                    borderTopWidth: 0,
                    height: 80,
                },
                tabBarBackground: () => (
                    <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="light" />
                ),
                tabBarActiveTintColor: colors.light.primary,
                tabBarInactiveTintColor: colors.light.muted,
            }}
        >
            <Tab.Screen
                name="Feed"
                component={DashboardScreen}
                options={{
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                        <Home color={color} size={size} strokeWidth={2.5} />
                    ),
                }}
            />
            <Tab.Screen
                name="Communities"
                component={CommunitiesScreen}
                options={{
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                        <Users color={color} size={size} strokeWidth={2.5} />
                    ),
                }}
            />
            {/* Middle Create Button */}
            <Tab.Screen
                name="Post"
                component={DashboardScreen} // Should open modal normally
                options={{
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                        <View style={styles.addButton}>
                            <PlusSquare color="#FFF" size={24} strokeWidth={2.5} />
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="Notifications"
                component={NotificationsScreen}
                options={{
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                        <Bell color={color} size={size} strokeWidth={2.5} />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                        <User color={color} size={size} strokeWidth={2.5} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    addButton: {
        backgroundColor: colors.light.primary,
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20, // Lift it up slightly
        shadowColor: colors.light.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    }
});
