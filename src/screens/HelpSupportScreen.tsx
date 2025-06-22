import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../theme/ThemeContext';

const HelpSupportScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();

  const faqItems = [
    {
      question: 'How do I save a property?',
      answer: 'Swipe right on a property card or tap the heart icon to save it to your favorites.',
    },
    {
      question: 'How do I contact an agent?',
      answer: 'Tap on a saved property and use the "Contact Agent" button to send a message.',
    },
    {
      question: 'Can I change my search preferences?',
      answer: 'Yes! Go to Profile > Preferences to update your search criteria.',
    },
    {
      question: 'How do I delete a saved property?',
      answer: 'Go to the Saved tab, swipe left on a property, and tap "Delete".',
    },
    {
      question: 'What does the super like do?',
      answer: 'Super liking a property marks it as a priority and notifies agents of your strong interest.',
    },
  ];

  const contactOptions = [
    {
      icon: 'mail-outline',
      title: 'Email Support',
      subtitle: 'support@thathouse.com',
      action: () => Linking.openURL('mailto:support@thathouse.com'),
    },
    {
      icon: 'call-outline',
      title: 'Phone Support',
      subtitle: '1-800-HOUSE-01',
      action: () => Linking.openURL('tel:18004687301'),
    },
    {
      icon: 'chatbubbles-outline',
      title: 'Live Chat',
      subtitle: 'Chat with our support team',
      action: () => {},
    },
  ];

  const resourceLinks = [
    {
      icon: 'book-outline',
      title: 'User Guide',
      action: () => {},
    },
    {
      icon: 'videocam-outline',
      title: 'Video Tutorials',
      action: () => {},
    },
    {
      icon: 'document-text-outline',
      title: 'Terms of Service',
      action: () => {},
    },
    {
      icon: 'shield-checkmark-outline',
      title: 'Privacy Policy',
      action: () => {},
    },
  ];

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          
          {faqItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.faqItem}>
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{item.question}</Text>
                <Icon name="chevron-down" size={20} color={colors.textSecondary} />
              </View>
              <Text style={styles.faqAnswer}>{item.answer}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          
          {contactOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.contactItem}
              onPress={option.action}
            >
              <View style={styles.contactIcon}>
                <Icon name={option.icon} size={24} color="#FF6B6B" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>{option.title}</Text>
                <Text style={styles.contactSubtitle}>{option.subtitle}</Text>
              </View>
              <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resources</Text>
          
          {resourceLinks.map((link, index) => (
            <TouchableOpacity
              key={index}
              style={styles.resourceItem}
              onPress={link.action}
            >
              <Icon name={link.icon} size={24} color={colors.text} />
              <Text style={styles.resourceText}>{link.title}</Text>
              <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.feedbackSection}>
          <Text style={styles.feedbackTitle}>Send Feedback</Text>
          <Text style={styles.feedbackText}>
            We'd love to hear your thoughts on how we can improve ThatHouse.
          </Text>
          <TouchableOpacity style={styles.feedbackButton}>
            <Text style={styles.feedbackButtonText}>Send Feedback</Text>
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
  faqItem: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    flex: 1,
  },
  faqAnswer: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B6B15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resourceText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: 15,
  },
  feedbackSection: {
    backgroundColor: colors.card,
    marginTop: 20,
    marginBottom: 20,
    padding: 20,
    alignItems: 'center',
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
  },
  feedbackText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  feedbackButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  feedbackButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HelpSupportScreen;