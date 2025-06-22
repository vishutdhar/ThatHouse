import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface ProgressIndicatorProps {
  currentIndex: number;
  totalProperties: number;
  visible: boolean;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentIndex,
  totalProperties,
  visible,
}) => {
  const { colors } = useTheme();
  const progress = totalProperties > 0 ? (currentIndex / totalProperties) * 100 : 0;

  if (!visible || totalProperties === 0) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBackground }]}>
      <Text style={[styles.text, { color: colors.text }]}>
        {currentIndex} of {totalProperties} properties viewed
      </Text>
      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
        <Animated.View
          style={[
            styles.progressFill,
            { 
              backgroundColor: colors.primary,
              width: `${progress}%`,
            },
          ]}
        />
      </View>
      <Text style={[styles.percentage, { color: colors.textSecondary }]}>
        {Math.round(progress)}%
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    padding: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 100,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  percentage: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default ProgressIndicator;