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
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { RootState } from '../store';
import { updateNotificationSettings } from '../store/slices/uiSlice';
import { useTheme } from '../theme/ThemeContext';

const NotificationSettingsScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { notifications } = useSelector((state: RootState) => state.ui);
  const { colors } = useTheme();

  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);

  const [notificationTypes, setNotificationTypes] = useState({
    newProperties: true,
    priceDrops: true,
    savedSearches: true,
    viewingReminders: true,
    agentMessages: true,
    appUpdates: false,
    marketInsights: true,
    neighborhoodNews: false,
  });

  const updateNotificationType = (key: keyof typeof notificationTypes) => {
    setNotificationTypes(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = () => {
    Alert.alert('Success', 'Notification settings updated');
    navigation.goBack();
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveButton}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Methods</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="notifications-outline" size={24} color={colors.text} />
              <Text style={styles.settingText}>Push Notifications</Text>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: colors.border, true: '#FF6B6B' }}
              thumbColor={colors.card}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="mail-outline" size={24} color={colors.text} />
              <Text style={styles.settingText}>Email Notifications</Text>
            </View>
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{ false: colors.border, true: '#FF6B6B' }}
              thumbColor={colors.card}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="chatbox-outline" size={24} color={colors.text} />
              <Text style={styles.settingText}>SMS Notifications</Text>
            </View>
            <Switch
              value={smsNotifications}
              onValueChange={setSmsNotifications}
              trackColor={{ false: colors.border, true: '#FF6B6B' }}
              thumbColor={colors.card}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Property Alerts</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingText}>New Properties</Text>
              <Text style={styles.settingDescription}>
                Get notified when new properties match your criteria
              </Text>
            </View>
            <Switch
              value={notificationTypes.newProperties}
              onValueChange={() => updateNotificationType('newProperties')}
              trackColor={{ false: colors.border, true: '#FF6B6B' }}
              thumbColor={colors.card}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingText}>Price Drops</Text>
              <Text style={styles.settingDescription}>
                Alert when saved properties reduce their price
              </Text>
            </View>
            <Switch
              value={notificationTypes.priceDrops}
              onValueChange={() => updateNotificationType('priceDrops')}
              trackColor={{ false: colors.border, true: '#FF6B6B' }}
              thumbColor={colors.card}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingText}>Saved Searches</Text>
              <Text style={styles.settingDescription}>
                Updates on your saved search criteria
              </Text>
            </View>
            <Switch
              value={notificationTypes.savedSearches}
              onValueChange={() => updateNotificationType('savedSearches')}
              trackColor={{ false: colors.border, true: '#FF6B6B' }}
              thumbColor={colors.card}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity & Updates</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingText}>Viewing Reminders</Text>
              <Text style={styles.settingDescription}>
                Remind about scheduled property viewings
              </Text>
            </View>
            <Switch
              value={notificationTypes.viewingReminders}
              onValueChange={() => updateNotificationType('viewingReminders')}
              trackColor={{ false: colors.border, true: '#FF6B6B' }}
              thumbColor={colors.card}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingText}>Agent Messages</Text>
              <Text style={styles.settingDescription}>
                New messages from agents and sellers
              </Text>
            </View>
            <Switch
              value={notificationTypes.agentMessages}
              onValueChange={() => updateNotificationType('agentMessages')}
              trackColor={{ false: colors.border, true: '#FF6B6B' }}
              thumbColor={colors.card}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingText}>App Updates</Text>
              <Text style={styles.settingDescription}>
                New features and improvements
              </Text>
            </View>
            <Switch
              value={notificationTypes.appUpdates}
              onValueChange={() => updateNotificationType('appUpdates')}
              trackColor={{ false: colors.border, true: '#FF6B6B' }}
              thumbColor={colors.card}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Market Information</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingText}>Market Insights</Text>
              <Text style={styles.settingDescription}>
                Weekly market trends and analysis
              </Text>
            </View>
            <Switch
              value={notificationTypes.marketInsights}
              onValueChange={() => updateNotificationType('marketInsights')}
              trackColor={{ false: colors.border, true: '#FF6B6B' }}
              thumbColor={colors.card}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingText}>Neighborhood News</Text>
              <Text style={styles.settingDescription}>
                Updates about your areas of interest
              </Text>
            </View>
            <Switch
              value={notificationTypes.neighborhoodNews}
              onValueChange={() => updateNotificationType('neighborhoodNews')}
              trackColor={{ false: colors.border, true: '#FF6B6B' }}
              thumbColor={colors.card}
            />
          </View>
        </View>

        <View style={styles.quietHoursSection}>
          <TouchableOpacity style={styles.quietHoursButton}>
            <Icon name="moon-outline" size={20} color={colors.text} />
            <Text style={styles.quietHoursText}>Set Quiet Hours</Text>
            <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
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
  saveButton: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '600',
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
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 15,
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  quietHoursSection: {
    backgroundColor: colors.card,
    marginTop: 20,
    marginBottom: 20,
  },
  quietHoursButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  quietHoursText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: 15,
  },
});

export default NotificationSettingsScreen;