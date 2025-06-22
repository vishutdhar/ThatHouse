import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UIState } from '../../types';

const initialState: UIState = {
  isOnboarding: false, // Set to false to bypass onboarding
  activeTab: 'swipe',
  theme: 'dark', // Dark mode only
  notifications: {
    messages: true,
    matches: true,
    updates: true,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    completeOnboarding: (state) => {
      state.isOnboarding = false;
    },
    setActiveTab: (state, action: PayloadAction<UIState['activeTab']>) => {
      state.activeTab = action.payload;
    },
    updateNotificationSettings: (state, action: PayloadAction<Partial<UIState['notifications']>>) => {
      state.notifications = { ...state.notifications, ...action.payload };
    },
  },
});

export const {
  completeOnboarding,
  setActiveTab,
  updateNotificationSettings,
} = uiSlice.actions;

export default uiSlice.reducer;