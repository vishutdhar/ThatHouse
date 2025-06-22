import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DebugOverlay: React.FC = () => {
  useEffect(() => {
    console.log('DebugOverlay mounted - if you see overlay text, it\'s not from here!');
  }, []);

  return (
    <View style={styles.container} pointerEvents="none">
      <Text style={styles.text}>DEBUG: CustomSwiper Active</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255,0,0,0.3)',
    padding: 10,
    zIndex: 9999,
  },
  text: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default DebugOverlay;