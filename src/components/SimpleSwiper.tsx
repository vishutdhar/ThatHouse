import React, { useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { Property } from '../types';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface SimpleSwiperProps {
  cards: Property[];
  renderCard: (card: Property) => React.ReactNode;
  onSwipedLeft: (cardIndex: number) => void;
  onSwipedRight: (cardIndex: number) => void;
  onSwipedTop: (cardIndex: number) => void;
}

export interface SimpleSwiperRef {
  swipeLeft: () => void;
  swipeRight: () => void;
  swipeTop: () => void;
}

const SimpleSwiper = React.forwardRef<SimpleSwiperRef, SimpleSwiperProps>(
  ({ cards, renderCard, onSwipedLeft, onSwipedRight, onSwipedTop }, ref) => {
    const swiperRef = useRef<Swiper<Property>>(null);

    React.useImperativeHandle(ref, () => ({
      swipeLeft: () => swiperRef.current?.swipeLeft(),
      swipeRight: () => swiperRef.current?.swipeRight(),
      swipeTop: () => swiperRef.current?.swipeTop(),
    }));

    if (cards.length === 0) {
      return null;
    }

    return (
      <View style={styles.container}>
        <Swiper
          ref={swiperRef}
          cards={cards}
          renderCard={renderCard}
          onSwipedLeft={onSwipedLeft}
          onSwipedRight={onSwipedRight}
          onSwipedTop={onSwipedTop}
          onSwipedAll={() => {}}
          cardIndex={0}
          backgroundColor="transparent"
          stackSize={3}
          stackScale={5}
          stackSeparation={15}
          animateCardOpacity
          infinite={false}
          verticalSwipe={true}
          horizontalSwipe={true}
          showSecondCard={true}
          cardVerticalMargin={0}
          cardHorizontalMargin={10}
          containerStyle={styles.swiperContainer}
          cardStyle={styles.card}
          overlayLabels={{
            left: {
              title: 'NOPE',
              style: {
                label: {
                  backgroundColor: '#FF6B6B',
                  color: 'white',
                  fontSize: 24,
                  borderRadius: 10,
                  padding: 10,
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-start',
                  marginTop: 30,
                  marginLeft: -30,
                },
              },
            },
            right: {
              title: 'LIKE',
              style: {
                label: {
                  backgroundColor: '#4CCC93',
                  color: 'white',
                  fontSize: 24,
                  borderRadius: 10,
                  padding: 10,
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  marginTop: 30,
                  marginLeft: 30,
                },
              },
            },
            top: {
              title: 'SUPER LIKE',
              style: {
                label: {
                  backgroundColor: '#4B7BFF',
                  color: 'white',
                  fontSize: 24,
                  borderRadius: 10,
                  padding: 10,
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              },
            },
          }}
        />
      </View>
    );
  }
);

SimpleSwiper.displayName = 'SimpleSwiper';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  swiperContainer: {
    flex: 1,
  },
  card: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 0,
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});

export default SimpleSwiper;