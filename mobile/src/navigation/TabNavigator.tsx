import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Search, PlusSquare, BookOpen, User } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { View } from 'react-native';

// Screens
import FeedScreen from '../screens/main/FeedScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

const PlaceholderScreen = () => <View style={{ flex: 1, backgroundColor: colors.background }} />;

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 80,
          paddingTop: 12,
        },
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Home') return <Home color={color} size={28} />;
          if (route.name === 'Search') return <Search color={color} size={28} />;
          if (route.name === 'Create') return <PlusSquare color={color} size={28} />;
          if (route.name === 'Study') return <BookOpen color={color} size={28} />;
          if (route.name === 'Profile') return <User color={color} size={28} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={FeedScreen} />
      <Tab.Screen name="Search" component={PlaceholderScreen} />
      <Tab.Screen name="Create" component={PlaceholderScreen} />
      <Tab.Screen name="Study" component={PlaceholderScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
