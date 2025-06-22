import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { RootState } from '../store';
import { logout } from '../store/slices/userSlice';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../theme/ThemeContext';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

const ProfileScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<NavigationProp>();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { colors } = useTheme();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: () => dispatch(logout())
        },
      ]
    );
  };

  const menuItems = [
    {
      icon: 'person-circle-outline',
      title: 'Profile',
      value: `${currentUser?.firstName} ${currentUser?.lastName}`,
      onPress: () => Alert.alert('Coming Soon', 'This feature will be available soon'),
    },
    {
      section: 'Activity',
    },
    {
      icon: 'heart-outline',
      title: 'Saved homes',
      value: String(currentUser?.savedProperties.length || 0),
      onPress: () => navigation.navigate('Main', { screen: 'Saved' } as any),
    },
    {
      icon: 'close-circle-outline',
      title: 'Rejected homes',
      value: String(currentUser?.rejectedProperties.length || 0),
      onPress: () => navigation.navigate('Saved', { showRejected: true } as any),
    },
    {
      section: 'Settings',
    },
    {
      icon: 'notifications-outline',
      title: 'Notifications',
      onPress: () => Alert.alert('Coming Soon', 'This feature will be available soon'),
    },
    {
      icon: 'settings-outline',
      title: 'App settings',
      onPress: () => Alert.alert('Coming Soon', 'This feature will be available soon'),
    },
    {
      section: 'Support',
    },
    {
      icon: 'chatbubble-outline',
      title: 'Help & feedback',
      onPress: () => Alert.alert('Coming Soon', 'This feature will be available soon'),
    },
    {
      icon: 'lock-closed-outline',
      title: 'Privacy portal',
      onPress: () => Alert.alert('Coming Soon', 'This feature will be available soon'),
    },
    {
      icon: 'document-text-outline',
      title: 'Terms of use',
      onPress: () => Alert.alert('Coming Soon', 'This feature will be available soon'),
    },
    {
      icon: 'log-out-outline',
      title: 'Sign out',
      onPress: handleLogout,
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Compact Header */}
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            That House account
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {currentUser?.email}
          </Text>
        </View>

        {/* Menu List */}
        <View style={[styles.menuContainer, { backgroundColor: colors.cardBackground }]}>
          {menuItems.map((item, index) => {
            if (item.section) {
              return (
                <View key={index} style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                    {item.section}
                  </Text>
                </View>
              );
            }

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  index < menuItems.length - 1 && !menuItems[index + 1]?.section && styles.menuItemBorder,
                  { borderBottomColor: colors.border }
                ]}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <Icon 
                  name={item.icon} 
                  size={24} 
                  color={item.title === 'Sign out' ? '#FF6B6B' : colors.textSecondary} 
                />
                <Text style={[
                  styles.menuTitle, 
                  { color: item.title === 'Sign out' ? '#FF6B6B' : colors.text }
                ]}>
                  {item.title}
                </Text>
                {item.value && (
                  <Text style={[styles.menuValue, { color: colors.textSecondary }]}>
                    {item.value}
                  </Text>
                )}
                <Icon 
                  name="chevron-forward" 
                  size={20} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Version Info */}
        <View style={styles.footer}>
          <Text style={[styles.version, { color: colors.textSecondary }]}>
            That House ver. 1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
  },
  menuContainer: {
    flex: 1,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 56,
  },
  menuItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  menuTitle: {
    flex: 1,
    fontSize: 17,
    marginLeft: 16,
  },
  menuValue: {
    fontSize: 17,
    marginRight: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  version: {
    fontSize: 13,
  },
});

export default ProfileScreen;