import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../theme/ThemeContext';

const PrivacyScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();

  const [privacySettings, setPrivacySettings] = useState({
    shareData: false,
    analytics: true,
    personalizedAds: true,
    locationTracking: true,
    profileVisibility: true,
    showOnlineStatus: true,
    allowMessages: true,
  });

  const updateSetting = (key: keyof typeof privacySettings) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deleted', 'Your account has been deleted.');
          }
        },
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear Data',
      'This will clear all your saved properties and preferences. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'Your data has been cleared.');
          }
        },
      ]
    );
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Analytics</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingText}>Share Usage Data</Text>
              <Text style={styles.settingDescription}>
                Help us improve by sharing anonymous usage data
              </Text>
            </View>
            <Switch
              value={privacySettings.shareData}
              onValueChange={() => updateSetting('shareData')}
              trackColor={{ false: colors.border, true: '#FF6B6B' }}
              thumbColor={colors.card}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingText}>Analytics</Text>
              <Text style={styles.settingDescription}>
                Allow us to collect analytics to improve the app
              </Text>
            </View>
            <Switch
              value={privacySettings.analytics}
              onValueChange={() => updateSetting('analytics')}
              trackColor={{ false: colors.border, true: '#FF6B6B' }}
              thumbColor={colors.card}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingText}>Personalized Ads</Text>
              <Text style={styles.settingDescription}>
                Show ads based on your preferences
              </Text>
            </View>
            <Switch
              value={privacySettings.personalizedAds}
              onValueChange={() => updateSetting('personalizedAds')}
              trackColor={{ false: colors.border, true: '#FF6B6B' }}
              thumbColor={colors.card}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location & Visibility</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingText}>Location Tracking</Text>
              <Text style={styles.settingDescription}>
                Use your location to show nearby properties
              </Text>
            </View>
            <Switch
              value={privacySettings.locationTracking}
              onValueChange={() => updateSetting('locationTracking')}
              trackColor={{ false: colors.border, true: '#FF6B6B' }}
              thumbColor={colors.card}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingText}>Profile Visibility</Text>
              <Text style={styles.settingDescription}>
                Allow agents to see your profile
              </Text>
            </View>
            <Switch
              value={privacySettings.profileVisibility}
              onValueChange={() => updateSetting('profileVisibility')}
              trackColor={{ false: colors.border, true: '#FF6B6B' }}
              thumbColor={colors.card}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingText}>Show Online Status</Text>
              <Text style={styles.settingDescription}>
                Let others see when you're online
              </Text>
            </View>
            <Switch
              value={privacySettings.showOnlineStatus}
              onValueChange={() => updateSetting('showOnlineStatus')}
              trackColor={{ false: colors.border, true: '#FF6B6B' }}
              thumbColor={colors.card}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Communication</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingText}>Allow Messages</Text>
              <Text style={styles.settingDescription}>
                Receive messages from agents and sellers
              </Text>
            </View>
            <Switch
              value={privacySettings.allowMessages}
              onValueChange={() => updateSetting('allowMessages')}
              trackColor={{ false: colors.border, true: '#FF6B6B' }}
              thumbColor={colors.card}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleClearData}>
            <Icon name="trash-outline" size={20} color="#FF6B6B" />
            <Text style={styles.actionButtonText}>Clear All Data</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Icon name="download-outline" size={20} color={colors.text} />
            <Text style={styles.actionButtonTextNormal}>Download My Data</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]} 
            onPress={handleDeleteAccount}
          >
            <Icon name="alert-circle-outline" size={20} color="#FF3B3B" />
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoText}>
            Your privacy is important to us. Read our{' '}
            <Text style={styles.link}>Privacy Policy</Text> and{' '}
            <Text style={styles.link}>Terms of Service</Text>.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: colors.card,
    marginTop: 20,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  actionButtonText: {
    fontSize: 16,
    color: '#FF6B6B',
    marginLeft: 15,
  },
  actionButtonTextNormal: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 15,
  },
  deleteButton: {
    borderBottomWidth: 0,
  },
  deleteButtonText: {
    fontSize: 16,
    color: '#FF3B3B',
    marginLeft: 15,
    fontWeight: '600',
  },
  infoSection: {
    padding: 20,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  link: {
    color: '#FF6B6B',
    textDecorationLine: 'underline',
  },
});

export default PrivacyScreen;