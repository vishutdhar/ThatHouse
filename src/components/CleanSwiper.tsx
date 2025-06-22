import React, { useEffect } from 'react';
import Swiper from 'react-native-deck-swiper';
import { StyleSheet } from 'react-native';

// This wrapper component ensures overlays are ALWAYS disabled
// No matter what happens with props or re-renders
const CleanSwiper = (props: any) => {
  // Debug: Log when props change
  useEffect(() => {
    console.log('CleanSwiper props:', {
      hasOverlayLabels: !!props.overlayLabels,
      overlayLabels: props.overlayLabels,
      cardIndex: props.cardIndex,
      cardsLength: props.cards?.length
    });
  }, [props.overlayLabels, props.cardIndex, props.cards]);

  // Force remove any overlay-related props AND add styles to hide them
  const cleanProps = {
    ...props,
    overlayLabels: null,
    // Force overlay styles to be invisible even if they somehow render
    overlayLabelStyle: styles.hideLabel,
    overlayLabelWrapperStyle: styles.hideWrapper,
    animateOverlayLabelsOpacity: false,
    overlayOpacityHorizontalThreshold: 999, // Impossibly high threshold
    overlayOpacityVerticalThreshold: 999,
    // Remove any overlay-related callbacks if they exist
    onOverlayLabelShow: undefined,
  };

  // Delete the overlayLabels key entirely to ensure it's truly null
  delete cleanProps.overlayLabels;

  return <Swiper {...cleanProps} />;
};

const styles = StyleSheet.create({
  hideLabel: {
    opacity: 0,
    display: 'none',
    width: 0,
    height: 0,
  },
  hideWrapper: {
    opacity: 0,
    display: 'none',
    position: 'absolute',
    width: 0,
    height: 0,
    overflow: 'hidden',
  },
});

export default CleanSwiper;