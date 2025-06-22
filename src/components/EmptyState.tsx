import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LottieView from 'lottie-react-native';
import { useTheme } from '../theme/ThemeContext';

interface EmptyStateProps {
  icon?: string;
  lottieSource?: any;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  animate?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  lottieSource,
  title,
  description,
  actionText,
  onAction,
  animate = true,
}) => {
  const { colors } = useTheme();
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (animate) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 20,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(1);
      fadeAnim.setValue(1);
    }
  }, [animate, scaleAnim, fadeAnim]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {lottieSource ? (
        <LottieView
          source={lottieSource}
          autoPlay
          loop
          style={styles.lottieAnimation}
        />
      ) : (
        <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
          <Icon name={icon || 'help-outline'} size={64} color={colors.primary} />
        </View>
      )}
      
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {description}
      </Text>
      
      {actionText && onAction && (
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={onAction}
          activeOpacity={0.8}
        >
          <Text style={styles.actionText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  lottieAnimation: {
    width: 200,
    height: 200,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  actionButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
  },
  actionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EmptyState;