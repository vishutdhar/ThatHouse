import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Swiper from 'react-native-deck-swiper';
import { View, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// This component completely blocks overlay labels from appearing
const NoOverlaySwiper = forwardRef((props: any, ref) => {
  const swiperRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Forward the ref so parent can access swiper methods
  useImperativeHandle(ref, () => swiperRef.current);

  useEffect(() => {
    // Aggressively prevent label state from being set
    intervalRef.current = setInterval(() => {
      if (swiperRef.current && swiperRef.current.state) {
        if (swiperRef.current.state.labelType !== 'none') {
          swiperRef.current.setState({ labelType: 'none' });
        }
      }
    }, 50); // Check every 50ms

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, []);

  // Override all overlay-related props
  const cleanProps = {
    ...props,
    overlayLabels: null, // Explicitly set to null
    animateOverlayLabelsOpacity: false,
    overlayOpacityHorizontalThreshold: 9999,
    overlayOpacityVerticalThreshold: 9999,
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      <Swiper 
        ref={swiperRef}
        {...cleanProps} 
      />
      {/* Multiple overlay blockers to ensure labels can't show */}
      <View style={styles.leftBlocker} pointerEvents="none" />
      <View style={styles.rightBlocker} pointerEvents="none" />
      <View style={styles.topBlocker} pointerEvents="none" />
      <View style={styles.bottomBlocker} pointerEvents="none" />
    </View>
  );
});

const styles = StyleSheet.create({
  overlayBlocker: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  leftBlocker: {
    position: 'absolute',
    top: height * 0.3,
    left: 0,
    width: width * 0.4,
    height: 100,
    zIndex: 1001,
    backgroundColor: 'transparent',
  },
  rightBlocker: {
    position: 'absolute',
    top: height * 0.3,
    right: 0,
    width: width * 0.4,
    height: 100,
    zIndex: 1001,
    backgroundColor: 'transparent',
  },
  topBlocker: {
    position: 'absolute',
    top: 0,
    left: width * 0.3,
    right: width * 0.3,
    height: height * 0.3,
    zIndex: 1001,
    backgroundColor: 'transparent',
  },
  bottomBlocker: {
    position: 'absolute',
    bottom: height * 0.3,
    left: width * 0.3,
    right: width * 0.3,
    height: 100,
    zIndex: 1001,
    backgroundColor: 'transparent',
  },
});

NoOverlaySwiper.displayName = 'NoOverlaySwiper';

export default NoOverlaySwiper;