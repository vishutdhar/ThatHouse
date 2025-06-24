import React, { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
  Easing,
} from 'react-native-reanimated';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const SWIPE_THRESHOLD = screenWidth * 0.25;
const SWIPE_VELOCITY_THRESHOLD = 500;
const ROTATION_ANGLE = 15;
const STACK_SIZE = 3;
const SCALE_FACTOR = 0.9;

interface SwipeCardStackProps {
  cards: any[];
  renderCard: (card: any, index: number, isSwipeActive?: boolean) => React.ReactNode;
  onSwipedLeft?: (index: number) => void;
  onSwipedRight?: (index: number) => void;
  onSwipedTop?: (index: number) => void;
  stackSize?: number;
  stackScale?: number;
  stackSeparation?: number;
}

export interface SwipeCardStackRef {
  swipeLeft: () => void;
  swipeRight: () => void;
  swipeTop: () => void;
}

// Separate component for individual cards to avoid hooks rules violation
const SwipeCard = ({
  card,
  index,
  isFirst,
  renderCard,
  translateX,
  translateY,
  panGesture,
  cardsLength,
  stackScale,
  stackSeparation,
  isSwipeActive,
}: {
  card: any;
  index: number;
  isFirst: boolean;
  renderCard: (card: any, index: number, isSwipeActive?: boolean) => React.ReactNode;
  translateX: any;
  translateY: any;
  panGesture: any;
  cardsLength: number;
  stackScale: number;
  stackSeparation: number;
  isSwipeActive: boolean;
}) => {
  const cardAnimatedStyle = useAnimatedStyle(() => {
    if (!isFirst) {
      const scale = interpolate(
        Math.abs(translateX.value),
        [0, screenWidth],
        [SCALE_FACTOR - (index * stackScale) / 100, 1],
        Extrapolate.CLAMP
      );

      const translateYOffset = interpolate(
        Math.abs(translateX.value),
        [0, screenWidth],
        [index * stackSeparation, 0],
        Extrapolate.CLAMP
      );

      return {
        transform: [
          { scale },
          { translateY: translateYOffset },
        ],
        zIndex: cardsLength - index,
      };
    }

    const rotate = interpolate(
      translateX.value,
      [-screenWidth / 2, 0, screenWidth / 2],
      [-ROTATION_ANGLE, 0, ROTATION_ANGLE],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      Math.abs(translateX.value),
      [0, screenWidth * 0.8],
      [1, 0.3],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
      opacity,
      zIndex: cardsLength - index,
    };
  });

  return (
    <Animated.View
      key={card.id}
      style={[styles.card, cardAnimatedStyle]}
    >
      {isFirst ? (
        <GestureDetector gesture={panGesture}>
          <Animated.View style={StyleSheet.absoluteFillObject}>
            {renderCard(card, index, isSwipeActive)}
          </Animated.View>
        </GestureDetector>
      ) : (
        renderCard(card, index, false)
      )}
    </Animated.View>
  );
};

const SwipeCardStack = forwardRef<SwipeCardStackRef, SwipeCardStackProps>(
  (
    {
      cards,
      renderCard,
      onSwipedLeft,
      onSwipedRight,
      onSwipedTop,
      stackSize = STACK_SIZE,
      stackScale = 5,
      stackSeparation = 15,
    },
    ref
  ) => {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const currentIndex = useSharedValue(0);
    const [isSwipeActive, setIsSwipeActive] = useState(false);

    const resetPosition = useCallback(() => {
      'worklet';
      translateX.value = withSpring(0, {
        damping: 20,
        stiffness: 90,
        mass: 0.8,
        overshootClamping: false,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 2,
      });
      translateY.value = withSpring(0, {
        damping: 20,
        stiffness: 90,
        mass: 0.8,
        overshootClamping: false,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 2,
      });
    }, [translateX, translateY]);

    const handleSwipe = useCallback(
      (direction: 'left' | 'right' | 'top') => {
        const index = currentIndex.value;
        currentIndex.value += 1;

        if (direction === 'left' && onSwipedLeft) {
          onSwipedLeft(index);
        } else if (direction === 'right' && onSwipedRight) {
          onSwipedRight(index);
        } else if (direction === 'top' && onSwipedTop) {
          onSwipedTop(index);
        }
      },
      [currentIndex, onSwipedLeft, onSwipedRight, onSwipedTop]
    );

    const panGesture = Gesture.Pan()
      .onUpdate((event) => {
        'worklet';
        translateX.value = event.translationX;
        translateY.value = event.translationY;
      })
      .onEnd((event) => {
        'worklet';
        const shouldSwipeLeft = translateX.value < -SWIPE_THRESHOLD || event.velocityX < -SWIPE_VELOCITY_THRESHOLD;
        const shouldSwipeRight = translateX.value > SWIPE_THRESHOLD || event.velocityX > SWIPE_VELOCITY_THRESHOLD;
        const shouldSwipeTop = translateY.value < -SWIPE_THRESHOLD && Math.abs(translateX.value) < SWIPE_THRESHOLD;

        if (shouldSwipeLeft) {
          translateX.value = withTiming(
            -screenWidth * 1.5,
            {
              duration: 250,
              easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            },
            (finished) => {
              'worklet';
              if (finished) {
                runOnJS(handleSwipe)('left');
                translateX.value = 0;
                translateY.value = 0;
              }
            }
          );
        } else if (shouldSwipeRight) {
          translateX.value = withTiming(
            screenWidth * 1.5,
            {
              duration: 250,
              easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            },
            (finished) => {
              'worklet';
              if (finished) {
                runOnJS(handleSwipe)('right');
                translateX.value = 0;
                translateY.value = 0;
              }
            }
          );
        } else if (shouldSwipeTop) {
          translateY.value = withTiming(
            -screenHeight,
            {
              duration: 300,
              easing: Easing.out(Easing.ease),
            },
            (finished) => {
              'worklet';
              if (finished) {
                runOnJS(handleSwipe)('top');
                translateX.value = 0;
                translateY.value = 0;
              }
            }
          );
        } else {
          resetPosition();
        }
      });

    const swipeLeft = useCallback(() => {
      translateX.value = withTiming(
        -screenWidth * 1.5,
        {
          duration: 300,
          easing: Easing.out(Easing.ease),
        },
        (finished) => {
          'worklet';
          if (finished) {
            runOnJS(handleSwipe)('left');
            translateX.value = 0;
            translateY.value = 0;
          }
        }
      );
    }, [translateX, translateY, handleSwipe]);

    const swipeRight = useCallback(() => {
      translateX.value = withTiming(
        screenWidth * 1.5,
        {
          duration: 300,
          easing: Easing.out(Easing.ease),
        },
        (finished) => {
          'worklet';
          if (finished) {
            runOnJS(handleSwipe)('right');
            translateX.value = 0;
            translateY.value = 0;
          }
        }
      );
    }, [translateX, translateY, handleSwipe]);

    const swipeTop = useCallback(() => {
      translateY.value = withTiming(
        -screenHeight,
        {
          duration: 300,
          easing: Easing.out(Easing.ease),
        },
        (finished) => {
          'worklet';
          if (finished) {
            runOnJS(handleSwipe)('top');
            translateX.value = 0;
            translateY.value = 0;
          }
        }
      );
    }, [translateX, translateY, handleSwipe]);

    useImperativeHandle(
      ref,
      () => ({
        swipeLeft,
        swipeRight,
        swipeTop,
      }),
      [swipeLeft, swipeRight, swipeTop]
    );

    return (
      <View style={styles.container}>
        <View style={styles.cardContainer}>
          {cards.slice(0, stackSize).map((card, index) => (
            <SwipeCard
              key={card.id}
              card={card}
              index={index}
              isFirst={index === 0}
              renderCard={renderCard}
              translateX={translateX}
              translateY={translateY}
              panGesture={panGesture}
              cardsLength={cards.length}
              stackScale={stackScale}
              stackSeparation={stackSeparation}
              isSwipeActive={isSwipeActive}
            />
          ))}
        </View>
      </View>
    );
  }
);

SwipeCardStack.displayName = 'SwipeCardStack';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    position: 'absolute',
    width: screenWidth - 40,
    height: screenHeight * 0.65,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden', // Changed back to hidden to clip the cards properly
  },
});

export default SwipeCardStack;