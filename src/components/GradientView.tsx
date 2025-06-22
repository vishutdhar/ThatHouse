import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface GradientViewProps {
  colors: string[];
  style?: ViewStyle;
  children?: React.ReactNode;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

// Fallback gradient using opacity layers
const FallbackGradient: React.FC<GradientViewProps> = ({ colors, style, children }) => {
  return (
    <View style={[style, styles.fallbackContainer]}>
      {colors.map((color, index) => (
        <View
          key={index}
          style={[
            StyleSheet.absoluteFillObject,
            {
              backgroundColor: color,
              opacity: 1 - (index / colors.length),
            },
          ]}
        />
      ))}
      {children}
    </View>
  );
};

const GradientView: React.FC<GradientViewProps> = (props) => {
  try {
    return <LinearGradient {...props} />;
  } catch (error) {
    // Fallback to opacity-based gradient if LinearGradient is not available
    console.warn('LinearGradient not available, using fallback');
    return <FallbackGradient {...props} />;
  }
};

const styles = StyleSheet.create({
  fallbackContainer: {
    overflow: 'hidden',
  },
});

export default GradientView;