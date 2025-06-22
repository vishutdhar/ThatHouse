import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface AnimatedFeedbackProps {
  type: 'like' | 'dislike' | 'superlike';
  visible: boolean;
  onAnimationComplete?: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

const AnimatedFeedback: React.FC<AnimatedFeedbackProps> = ({ 
  type, 
  visible, 
  onAnimationComplete 
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const rotationAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.5,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 300,
            delay: 500,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(rotationAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        scaleAnim.setValue(0);
        rotationAnim.setValue(0);
        onAnimationComplete?.();
      });
    }
  }, [visible, scaleAnim, opacityAnim, rotationAnim, onAnimationComplete]);

  const getConfig = () => {
    switch (type) {
      case 'like':
        return {
          icon: 'heart',
          color: '#4CCC93',
          backgroundColor: 'rgba(76, 204, 147, 0.2)',
        };
      case 'dislike':
        return {
          icon: 'close-circle',
          color: '#FF6B6B',
          backgroundColor: 'rgba(255, 107, 107, 0.2)',
        };
      case 'superlike':
        return {
          icon: 'star',
          color: '#4B7BFF',
          backgroundColor: 'rgba(75, 123, 255, 0.2)',
        };
    }
  };

  const config = getConfig();
  const spin = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: opacityAnim,
          transform: [
            { scale: scaleAnim },
            { rotate: type === 'superlike' ? spin : '0deg' },
          ],
        },
      ]}
      pointerEvents="none"
    >
      <View style={[styles.iconContainer, { backgroundColor: config.backgroundColor }]}>
        <Icon name={config.icon} size={80} color={config.color} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '40%',
    left: screenWidth / 2 - 60,
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AnimatedFeedback;