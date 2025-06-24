import { Platform } from 'react-native';

// Detect if running in simulator
const isSimulator = __DEV__ && Platform.OS === 'ios' && !Platform.isPad && !Platform.isTVOS;

export const performanceConfig = {
  // Reduce image quality in simulator
  imageQuality: isSimulator ? 0.5 : 1,
  
  // Simplify animations in simulator
  animationConfig: isSimulator 
    ? {
        damping: 20,
        stiffness: 150,
        mass: 0.8,
      }
    : {
        damping: 15,
        stiffness: 100,
        mass: 1,
      },
  
  // Reduce shadow complexity in simulator
  shadowConfig: isSimulator
    ? {
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      }
    : {
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 10,
      },
};