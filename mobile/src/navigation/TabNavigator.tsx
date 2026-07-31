import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Search, PlusSquare, BookOpen, User, MessageSquare } from 'lucide-react-native';
import { colors } from '../theme/colors';

// Real Connected Screens
import FeedScreen from '../screens/main/FeedScreen';
import SearchScreen from '../screens/main/SearchScreen';
import CreatePostScreen from '../screens/main/CreatePostScreen';
import StudyScreen from '../screens/main/StudyScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 76,
          paddingTop: 10,
        },
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Home') return <Home color={color} size={26} />;
          if (route.name === 'Search') return <Search color={color} size={26} />;
          if (route.name === 'Create') return <PlusSquare color={color} size={26} />;
          if (route.name === 'Study') return <BookOpen color={color} size={26} />;
          if (route.name === 'Profile') return <User color={color} size={26} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={FeedScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Create" component={CreatePostScreen} />
      <Tab.Screen name="Study" component={StudyScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
