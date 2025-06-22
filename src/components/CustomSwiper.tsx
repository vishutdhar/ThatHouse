import React, { useRef, useState } from 'react';
import {
  View,
  PanResponder,
  Animated,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { haptics } from '../utils/haptics';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.25;
const SWIPE_OUT_DURATION = 300;
const ROTATION_MULTIPLIER = 0.05;
const VELOCITY_THRESHOLD = 0.3;
const SPRING_CONFIG = {
  friction: 8,
  tension: 40,
  useNativeDriver: true,
};

interface CustomSwiperProps {
  cards: any[];
  renderCard: (item: any, index: number) => React.ReactNode;
  onSwipedLeft?: (index: number) => void;
  onSwipedRight?: (index: number) => void;
  cardIndex?: number;
  stackSize?: number;
  stackScale?: number;
  stackSeparation?: number;
  backgroundColor?: string;
}

const CustomSwiper: React.FC<CustomSwiperProps> = ({
  cards,
  renderCard,
  onSwipedLeft,
  onSwipedRight,
  cardIndex = 0,
  stackSize = 3,
  stackScale = 5,
  stackSeparation = 10,
  backgroundColor = 'transparent',
}) => {
  const [currentIndex, setCurrentIndex] = useState(cardIndex);
  const position = useRef(new Animated.ValueXY()).current;
  const [swiping, setSwiping] = useState(false);

  const rotate = position.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

  const opacity = position.x.interpolate({
    inputRange: [-width / 2, -width / 3, 0, width / 3, width / 2],
    outputRange: [0.8, 1, 1, 1, 0.8],
    extrapolate: 'clamp',
  });

  // Add scale animation for better depth perception
  const scale = position.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: [0.9, 1, 0.9],
    extrapolate: 'clamp',
  });

  // Add elevation animation for shadow
  const elevation = position.x.interpolate({
    inputRange: [-width / 4, 0, width / 4],
    outputRange: [5, 8, 5],
    extrapolate: 'clamp',
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only capture pan when there's movement
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      
      onPanResponderGrant: () => {
        setSwiping(true);
        // Stop any ongoing animations
        position.stopAnimation();
        position.extractOffset();
      },
      
      onPanResponderMove: Animated.event(
        [null, { dx: position.x, dy: position.y }],
        { useNativeDriver: false }
      ),
      
      onPanResponderRelease: (evt, gestureState) => {
        setSwiping(false);
        position.flattenOffset();
        
        // Check velocity for smoother swipes
        const hasVelocity = Math.abs(gestureState.vx) > VELOCITY_THRESHOLD;
        const hasMovedEnough = Math.abs(gestureState.dx) > SWIPE_THRESHOLD;
        
        if ((hasVelocity || hasMovedEnough) && gestureState.dx > 0) {
          // Swipe right
          haptics.impact('light');
          forceSwipe('right', gestureState.vx);
        } else if ((hasVelocity || hasMovedEnough) && gestureState.dx < 0) {
          // Swipe left
          haptics.impact('light');
          forceSwipe('left', gestureState.vx);
        } else {
          // Reset position with spring
          resetPosition();
        }
      },
    })
  ).current;

  const forceSwipe = (direction: 'right' | 'left', velocity: number = 0) => {
    const x = direction === 'right' ? width * 1.5 : -width * 1.5;
    
    // Use spring for more natural movement
    Animated.spring(position, {
      toValue: { x, y: 0 },
      velocity: Math.abs(velocity) * 2,
      tension: Math.abs(velocity) > 0.5 ? 30 : 50,
      friction: 3,
      restSpeedThreshold: 100,
      restDisplacementThreshold: 100,
      useNativeDriver: false,
    }).start(() => {
      onSwipeComplete(direction);
    });
  };

  const onSwipeComplete = (direction: 'right' | 'left') => {
    const callback = direction === 'right' ? onSwipedRight : onSwipedLeft;
    callback?.(currentIndex);
    
    position.setValue({ x: 0, y: 0 });
    setCurrentIndex((prevIndex) => prevIndex + 1);
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      ...SPRING_CONFIG,
      useNativeDriver: false,
    }).start();
  };

  const renderCards = () => {
    if (currentIndex >= cards.length) {
      return null;
    }

    const deck = [];
    
    for (let i = 0; i < stackSize && currentIndex + i < cards.length; i++) {
      const card = cards[currentIndex + i];
      
      if (i === 0) {
        // Top card - interactive
        deck.push(
          <Animated.View
            key={currentIndex + i}
            style={[
              styles.card,
              {
                opacity,
                transform: [
                  ...position.getTranslateTransform(),
                  { rotate },
                  { scale },
                ],
                elevation,
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: elevation,
                },
                shadowOpacity: 0.3,
                shadowRadius: elevation,
              },
            ]}
            {...panResponder.panHandlers}
          >
            {renderCard(card, currentIndex + i)}
          </Animated.View>
        );
      } else {
        // Stack cards - static
        const scale = 1 - (stackScale * i) / 100;
        const translateY = stackSeparation * i;
        
        deck.push(
          <Animated.View
            key={currentIndex + i}
            style={[
              styles.card,
              {
                transform: [
                  { scale },
                  { translateY },
                ],
                zIndex: -i,
              },
            ]}
          >
            {renderCard(card, currentIndex + i)}
          </Animated.View>
        );
      }
    }
    
    return deck.reverse();
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {renderCards()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    position: 'absolute',
    width: width - 40,
    height: height - 200,
    left: 20,
    top: 60,
  },
});

export default CustomSwiper;