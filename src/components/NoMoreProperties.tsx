import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useTheme } from '../theme/ThemeContext';
import { BottomTabParamList } from '../navigation/AppNavigator';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

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
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

  React.useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 50,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: colors.cardBackground, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
        <Icon name="home-outline" size={60} color={colors.primary} />
      </View>
      
      <Text style={[styles.title, { color: colors.text }]}>
        You've seen all available properties!
      </Text>
      
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        You've viewed {propertiesViewed} properties in this search
      </Text>

      <View style={styles.statsContainer}>
        <TouchableOpacity
          style={[styles.statItem, { backgroundColor: colors.background }]}
          onPress={() => {
            ReactNativeHapticFeedback.trigger('impactLight');
            navigation.navigate('Saved');
          }}
          activeOpacity={0.8}
        >
          <Icon name="heart" size={24} color="#4CCC93" />
          <Text style={[styles.statText, { color: colors.text }]}>
            Check your saved properties
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        {onOpenFilters && (
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton, { borderColor: colors.primary }]}
            onPress={() => {
              ReactNativeHapticFeedback.trigger('impactLight');
              onOpenFilters();
            }}
          >
            <Icon name="options-outline" size={20} color={colors.primary} />
            <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
              Adjust Filters
            </Text>
          </TouchableOpacity>
        )}
        
        {onReset && (
          <TouchableOpacity
            style={[styles.button, styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              ReactNativeHapticFeedback.trigger('impactMedium');
              onReset();
            }}
          >
            <Icon name="refresh" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Start Over</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    margin: 20,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  statsContainer: {
    width: '100%',
    marginBottom: 32,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  statText: {
    fontSize: 16,
    fontWeight: '500',
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#FF6B6B',
  },
  secondaryButton: {
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NoMoreProperties;