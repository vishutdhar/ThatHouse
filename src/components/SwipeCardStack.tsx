import React, { useCallback, useImperativeHandle, forwardRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolate,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Property } from '../types';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const SWIPE_THRESHOLD = screenWidth * 0.3;
const SWIPE_VELOCITY_THRESHOLD = 500;
const ROTATION_ANGLE = 15;
const SCALE_FACTOR = 0.95;
const STACK_SIZE = 3;

interface SwipeCardStackProps {
  cards: Property[];
  renderCard: (card: Property, index: number) => React.ReactNode;
  onSwipedLeft?: (cardIndex: number) => void;
  onSwipedRight?: (cardIndex: number) => void;
  onSwipedTop?: (cardIndex: number) => void;
  stackSize?: number;
  stackScale?: number;
  stackSeparation?: number;
}

export interface SwipeCardStackRef {
  swipeLeft: () => void;
  swipeRight: () => void;
  swipeTop: () => void;
}

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

    const resetPosition = useCallback(() => {
      'worklet';
      translateX.value = withSpring(0, {
        damping: 15,
        stiffness: 100,
        mass: 1,
      });
      translateY.value = withSpring(0, {
        damping: 15,
        stiffness: 100,
        mass: 1,
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
      .onStart(() => {
        'worklet';
      })
      .onUpdate((event) => {
        'worklet';
        translateX.value = event.translationX;
        translateY.value = event.translationY;
      })
      .onEnd((event) => {
        'worklet';
        const shouldSwipeRight =
          translateX.value > SWIPE_THRESHOLD ||
          event.velocityX > SWIPE_VELOCITY_THRESHOLD;
        const shouldSwipeLeft =
          translateX.value < -SWIPE_THRESHOLD ||
          event.velocityX < -SWIPE_VELOCITY_THRESHOLD;
        const shouldSwipeTop =
          translateY.value < -SWIPE_THRESHOLD &&
          Math.abs(translateX.value) < SWIPE_THRESHOLD &&
          event.velocityY < -SWIPE_VELOCITY_THRESHOLD;

        if (shouldSwipeRight) {
          translateX.value = withTiming(
            screenWidth * 1.5,
            {
              duration: 250,
              easing: Easing.out(Easing.cubic),
            },
            () => {
              'worklet';
              runOnJS(handleSwipe)('right');
              translateX.value = 0;
              translateY.value = 0;
            }
          );
          translateY.value = withTiming(translateY.value * 0.5, {
            duration: 300,
          });
        } else if (shouldSwipeLeft) {
          translateX.value = withTiming(
            -screenWidth * 1.5,
            {
              duration: 250,
              easing: Easing.out(Easing.cubic),
            },
            () => {
              'worklet';
              runOnJS(handleSwipe)('left');
              translateX.value = 0;
              translateY.value = 0;
            }
          );
          translateY.value = withTiming(translateY.value * 0.5, {
            duration: 300,
          });
        } else if (shouldSwipeTop) {
          translateY.value = withTiming(
            -screenHeight,
            {
              duration: 250,
              easing: Easing.out(Easing.cubic),
            },
            () => {
              'worklet';
              runOnJS(handleSwipe)('top');
              translateX.value = 0;
              translateY.value = 0;
            }
          );
          translateX.value = withTiming(0, { duration: 300 });
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
        () => {
          'worklet';
          runOnJS(handleSwipe)('left');
          translateX.value = 0;
          translateY.value = 0;
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
        () => {
          'worklet';
          runOnJS(handleSwipe)('right');
          translateX.value = 0;
          translateY.value = 0;
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
        () => {
          'worklet';
          runOnJS(handleSwipe)('top');
          translateX.value = 0;
          translateY.value = 0;
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

    const renderCards = () => {
      return cards.slice(0, stackSize).map((card, index) => {
        const isFirst = index === 0;

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
              zIndex: cards.length - index,
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
            zIndex: cards.length - index,
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
                  {renderCard(card, index)}
                </Animated.View>
              </GestureDetector>
            ) : (
              renderCard(card, index)
            )}
          </Animated.View>
        );
      });
    };

    return (
      <View style={styles.container}>
        <View style={styles.cardContainer}>{renderCards()}</View>
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
  },
});

export default SwipeCardStack;