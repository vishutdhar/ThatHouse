declare module 'react-native-haptic-feedback' {
  export type HapticFeedbackTypes =
    | 'selection'
    | 'impactLight'
    | 'impactMedium'
    | 'impactHeavy'
    | 'rigid'
    | 'soft'
    | 'notificationSuccess'
    | 'notificationWarning'
    | 'notificationError';

  export interface HapticOptions {
    enableVibrateFallback?: boolean;
    ignoreAndroidSystemSettings?: boolean;
  }

  export function trigger(
    type: HapticFeedbackTypes,
    options?: HapticOptions
  ): void;

  const ReactNativeHapticFeedback: {
    trigger: typeof trigger;
  };

  export default ReactNativeHapticFeedback;
}