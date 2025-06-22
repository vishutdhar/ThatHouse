import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../theme/ThemeContext';

import SwipeScreen from '../screens/SwipeScreen';
import SavedPropertiesScreen from '../screens/SavedPropertiesScreen';
import MapScreen from '../screens/MapScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PropertyDetailsEnhanced from '../screens/PropertyDetailsEnhanced';
import ConversationScreen from '../screens/ConversationScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import RejectedPropertiesScreen from '../screens/RejectedPropertiesScreen';
import PropertyComparisonScreen from '../screens/PropertyComparisonScreen';
import SearchScreen from '../screens/SearchScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import PreferencesScreen from '../screens/PreferencesScreen';
import PrivacyScreen from '../screens/PrivacyScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';
import AboutScreen from '../screens/AboutScreen';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export type RootStackParamList = {
  Login: undefined;
  Onboarding: undefined;
  Main: undefined;
  PropertyDetails: { propertyId: string };
  Conversation: { conversationId: string };
  RejectedProperties: undefined;
  PropertyComparison: { propertyIds: string[] };
  EditProfile: undefined;
  Preferences: undefined;
  Privacy: undefined;
  NotificationSettings: undefined;
  HelpSupport: undefined;
  About: undefined;
};

export type BottomTabParamList = {
  Swipe: undefined;
  Search: undefined;
  Map: undefined;
  Saved: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

const getTabBarIcon = (route: { name: string }, focused: boolean) => {
  let iconName: string;

  if (route.name === 'Swipe') {
    iconName = focused ? 'home' : 'home-outline';
  } else if (route.name === 'Search') {
    iconName = focused ? 'search' : 'search-outline';
  } else if (route.name === 'Map') {
    iconName = focused ? 'map' : 'map-outline';
  } else if (route.name === 'Saved') {
    iconName = focused ? 'heart' : 'heart-outline';
  } else if (route.name === 'Profile') {
    iconName = focused ? 'person' : 'person-outline';
  } else {
    iconName = 'help-outline';
  }

  return iconName;
};

const BottomTabNavigator = () => {
  const { colors } = useTheme();
  
  console.log('BottomTabNavigator rendering with colors:', colors);
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // eslint-disable-next-line react/no-unstable-nested-components
        tabBarIcon: ({ focused, color, size }) => {
          const iconName = getTabBarIcon(route, focused);
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: colors.tabBarBackground,
          borderTopColor: colors.border,
          height: 90,
          paddingBottom: 25,
          paddingTop: 10,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Swipe" component={SwipeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Saved" component={SavedPropertiesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const { isOnboarding } = useSelector((state: RootState) => state.ui);
  const { colors, isDark } = useTheme();

  const lightNavigationTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: colors.background,
      card: colors.cardBackground,
      text: colors.text,
      border: colors.border,
    },
  };

  const darkNavigationTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: colors.background,
      card: colors.cardBackground,
      text: colors.text,
      border: colors.border,
    },
  };

  return (
    <NavigationContainer theme={isDark ? darkNavigationTheme : lightNavigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : isOnboarding ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={BottomTabNavigator} />
            <Stack.Screen 
              name="PropertyDetails" 
              component={PropertyDetailsEnhanced}
              options={{ 
                presentation: 'modal',
                headerShown: true,
                headerTitle: 'Property Details',
                headerStyle: {
                  backgroundColor: colors.headerBackground,
                },
                headerTintColor: colors.text,
              }}
            />
            <Stack.Screen 
              name="Conversation" 
              component={ConversationScreen}
              options={{ 
                headerShown: true,
                headerStyle: {
                  backgroundColor: colors.headerBackground,
                },
                headerTintColor: colors.text,
              }}
            />
            <Stack.Screen 
              name="RejectedProperties" 
              component={RejectedPropertiesScreen}
              options={{ 
                headerShown: true,
                headerTitle: 'Rejected Properties',
                headerStyle: {
                  backgroundColor: colors.headerBackground,
                },
                headerTintColor: colors.text,
              }}
            />
            <Stack.Screen 
              name="PropertyComparison" 
              component={PropertyComparisonScreen}
              options={{ 
                headerShown: false,
              }}
            />
            <Stack.Screen 
              name="EditProfile" 
              component={EditProfileScreen}
              options={{ 
                headerShown: false,
              }}
            />
            <Stack.Screen 
              name="Preferences" 
              component={PreferencesScreen}
              options={{ 
                headerShown: false,
              }}
            />
            <Stack.Screen 
              name="Privacy" 
              component={PrivacyScreen}
              options={{ 
                headerShown: false,
              }}
            />
            <Stack.Screen 
              name="NotificationSettings" 
              component={NotificationSettingsScreen}
              options={{ 
                headerShown: false,
              }}
            />
            <Stack.Screen 
              name="HelpSupport" 
              component={HelpSupportScreen}
              options={{ 
                headerShown: false,
              }}
            />
            <Stack.Screen 
              name="About" 
              component={AboutScreen}
              options={{ 
                headerShown: false,
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;