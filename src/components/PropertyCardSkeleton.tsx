import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import GradientView from './GradientView';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const PropertyCardSkeleton: React.FC = () => {
  const { colors, isDark } = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    );
    shimmerAnimation.start();

    return () => {
      shimmerAnimation.stop();
    };
  }, [shimmerAnim]);

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-screenWidth, screenWidth],
  });

  const baseColor = isDark ? '#2A2A2A' : '#E1E9EE';
  const highlightColor = isDark ? '#3A3A3A' : '#F2F8FC';

  return (
    <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
      <View style={styles.shimmerWrapper}>
        <Animated.View
          style={[
            styles.shimmer,
            {
              transform: [{ translateX: shimmerTranslate }],
            },
          ]}
        >
          <GradientView
            colors={[baseColor, highlightColor, baseColor]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.shimmerGradient}
          />
        </Animated.View>
      </View>

      {/* Image skeleton */}
      <View style={[styles.imageSkeleton, { backgroundColor: baseColor }]} />

      {/* Content skeleton */}
      <View style={styles.contentSkeleton}>
        {/* Price skeleton */}
        <View style={styles.topRow}>
          <View style={[styles.priceSkeleton, { backgroundColor: baseColor }]} />
          <View style={[styles.daysSkeleton, { backgroundColor: baseColor }]} />
        </View>

        {/* Bottom content skeleton */}
        <View style={styles.bottomContent}>
          <View style={[styles.typeSkeleton, { backgroundColor: baseColor }]} />
          <View style={[styles.addressSkeleton, { backgroundColor: baseColor }]} />
          <View style={[styles.cityStateSkeleton, { backgroundColor: baseColor }]} />
          <View style={styles.detailsRow}>
            <View style={[styles.detailSkeleton, { backgroundColor: baseColor }]} />
            <View style={[styles.detailSkeleton, { backgroundColor: baseColor }]} />
            <View style={[styles.detailSkeleton, { backgroundColor: baseColor }]} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: screenWidth - 20,
    height: screenHeight * 0.75,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  shimmerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  shimmerGradient: {
    flex: 1,
    width: screenWidth * 2,
  },
  imageSkeleton: {
    width: '100%',
    height: '100%',
  },
  contentSkeleton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    padding: 20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  priceSkeleton: {
    width: 120,
    height: 36,
    borderRadius: 18,
  },
  daysSkeleton: {
    width: 60,
    height: 32,
    borderRadius: 16,
  },
  bottomContent: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 15,
    padding: 15,
  },
  typeSkeleton: {
    width: 80,
    height: 24,
    borderRadius: 12,
    marginBottom: 10,
  },
  addressSkeleton: {
    width: '70%',
    height: 20,
    borderRadius: 10,
    marginBottom: 8,
  },
  cityStateSkeleton: {
    width: '50%',
    height: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailSkeleton: {
    width: '30%',
    height: 30,
    borderRadius: 8,
  },
});

export default PropertyCardSkeleton;