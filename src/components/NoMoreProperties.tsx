import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useTheme } from '../theme/ThemeContext';
import { BottomTabParamList } from '../navigation/AppNavigator';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

const { width: screenWidth } = Dimensions.get('window');

interface NoMorePropertiesProps {
  onReset?: () => void;
  onOpenFilters?: () => void;
  propertiesViewed: number;
}

const NoMoreProperties: React.FC<NoMorePropertiesProps> = ({
  onReset,
  onOpenFilters,
  propertiesViewed,
}) => {
  const { colors } = useTheme();
  const navigation = useNavigation<BottomTabNavigationProp<BottomTabParamList>>();
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, fadeAnim]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            transform: [{ scale: scaleAnim }],
            opacity: fadeAnim,
          },
        ]}
      >
        {/* Main Icon with Animation */}
        <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.iconInner, { backgroundColor: colors.primaryLight || '#FF6B6B20' }]}>
            <Icon name="checkmark-circle" size={48} color={colors.primary} />
          </View>
        </View>
        
        <Text style={[styles.title, { color: colors.text }]}>
          All caught up!
        </Text>
        
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          You've viewed all {propertiesViewed} properties in this area
        </Text>

        {/* Action Cards */}
        <View style={styles.cardsContainer}>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: colors.cardBackground }]}
            onPress={() => {
              ReactNativeHapticFeedback.trigger('impactLight');
              navigation.navigate('Saved');
            }}
            activeOpacity={0.8}
          >
            <View style={[styles.cardIconContainer, { backgroundColor: '#4CCC9320' }]}>
              <Icon name="heart" size={24} color="#4CCC93" />
            </View>
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Review Saved
              </Text>
              <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                Check your liked properties
              </Text>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {onOpenFilters && (
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: colors.cardBackground }]}
              onPress={() => {
                ReactNativeHapticFeedback.trigger('impactLight');
                onOpenFilters();
              }}
              activeOpacity={0.8}
            >
              <View style={[styles.cardIconContainer, { backgroundColor: colors.primaryLight || '#FF6B6B20' }]}>
                <Icon name="options-outline" size={24} color={colors.primary} />
              </View>
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  Adjust Filters
                </Text>
                <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                  Expand your search criteria
                </Text>
              </View>
              <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Primary Action Button */}
        {onReset && (
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              ReactNativeHapticFeedback.trigger('impactMedium');
              onReset();
            }}
            activeOpacity={0.8}
          >
            <Icon name="refresh" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>See Properties Again</Text>
          </TouchableOpacity>
        )}

        {/* Additional Options */}
        <View style={styles.additionalOptions}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Search')}
            activeOpacity={0.7}
          >
            <Text style={[styles.linkText, { color: colors.primary }]}>
              Try a different location
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  iconInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  cardsContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 14,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    gap: 8,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  additionalOptions: {
    marginTop: 20,
  },
  linkText: {
    fontSize: 15,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});

export default NoMoreProperties;