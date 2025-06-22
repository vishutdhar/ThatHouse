import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../theme/ThemeContext';

const AboutScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();

  const teamMembers = [
    { name: 'John Doe', role: 'CEO & Founder' },
    { name: 'Jane Smith', role: 'CTO' },
    { name: 'Mike Johnson', role: 'Head of Design' },
    { name: 'Sarah Williams', role: 'Head of Product' },
  ];

  const stats = [
    { label: 'Properties Listed', value: '50K+' },
    { label: 'Happy Users', value: '100K+' },
    { label: 'Cities Covered', value: '500+' },
    { label: 'Success Stories', value: '10K+' },
  ];

  const socialLinks = [
    { icon: 'logo-facebook', url: 'https://facebook.com/thathouse' },
    { icon: 'logo-twitter', url: 'https://twitter.com/thathouse' },
    { icon: 'logo-instagram', url: 'https://instagram.com/thathouse' },
    { icon: 'logo-linkedin', url: 'https://linkedin.com/company/thathouse' },
  ];

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About ThatHouse</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.logoSection}>
          <View style={styles.logo}>
            <Icon name="home" size={50} color="#FF6B6B" />
          </View>
          <Text style={styles.appName}>ThatHouse</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.missionText}>
            ThatHouse is revolutionizing the way people find their dream homes. 
            We believe that house hunting should be as easy as swiping through 
            photos. Our mission is to connect buyers with their perfect properties 
            through an intuitive, enjoyable, and efficient platform.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>By the Numbers</Text>
          <View style={styles.statsContainer}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Team</Text>
          {teamMembers.map((member, index) => (
            <View key={index} style={styles.teamMember}>
              <View style={styles.memberAvatar}>
                <Text style={styles.memberInitials}>
                  {member.name.split(' ').map(n => n[0]).join('')}
                </Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberRole}>{member.role}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connect With Us</Text>
          <View style={styles.socialContainer}>
            {socialLinks.map((link, index) => (
              <TouchableOpacity
                key={index}
                style={styles.socialButton}
                onPress={() => Linking.openURL(link.url)}
              >
                <Icon name={link.icon} size={24} color="#FF6B6B" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.legalSection}>
          <TouchableOpacity style={styles.legalLink}>
            <Text style={styles.legalText}>Terms of Service</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.legalLink}>
            <Text style={styles.legalText}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.legalLink}>
            <Text style={styles.legalText}>Licenses</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Made with ❤️ in San Francisco
          </Text>
          <Text style={styles.copyright}>
            © 2024 ThatHouse, Inc. All rights reserved.
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
  logoSection: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: colors.card,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 20,
    backgroundColor: '#FF6B6B15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  version: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  section: {
    backgroundColor: colors.card,
    marginTop: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 15,
  },
  missionText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: colors.background,
    borderRadius: 10,
    marginBottom: 10,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  teamMember: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  memberInitials: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  memberRole: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  legalSection: {
    backgroundColor: colors.card,
    marginTop: 20,
    paddingVertical: 10,
  },
  legalLink: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  legalText: {
    fontSize: 16,
    color: colors.text,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 5,
  },
  copyright: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});

export default AboutScreen;