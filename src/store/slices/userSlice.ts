import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, UserState, UserType } from '../../types';

const initialState: UserState = {
  currentUser: {
    id: 'test-user',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    userType: UserType.BUYER,
    savedProperties: [],
    rejectedProperties: [],
    priorityProperties: [],
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
  },
  isAuthenticated: true, // Set to true to bypass login
  isLoading: false,
  error: null,
  savedProperties: [],
  rejectedProperties: [],
  priorityProperties: [], // Properties marked with superlike
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.currentUser = action.payload;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.currentUser = null;
      state.error = action.payload;
    },
    logout: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    updateUserPreferences: (state, action: PayloadAction<Partial<User>>) => {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload };
      }
    },
    addSavedProperty: (state, action: PayloadAction<string>) => {
      if (!state.savedProperties.includes(action.payload)) {
        state.savedProperties.push(action.payload);
      }
      if (state.currentUser && !state.currentUser.savedProperties.includes(action.payload)) {
        state.currentUser.savedProperties.push(action.payload);
      }
    },
    addPriorityProperty: (state, action: PayloadAction<string>) => {
      // Add to both saved and priority lists
      if (!state.savedProperties.includes(action.payload)) {
        state.savedProperties.push(action.payload);
      }
      if (!state.priorityProperties.includes(action.payload)) {
        state.priorityProperties.push(action.payload);
      }
      if (state.currentUser) {
        if (!state.currentUser.savedProperties.includes(action.payload)) {
          state.currentUser.savedProperties.push(action.payload);
        }
        if (!state.currentUser.priorityProperties?.includes(action.payload)) {
          if (!state.currentUser.priorityProperties) {
            state.currentUser.priorityProperties = [];
          }
          state.currentUser.priorityProperties.push(action.payload);
        }
      }
    },
    removeSavedProperty: (state, action: PayloadAction<string>) => {
      state.savedProperties = state.savedProperties.filter(
        id => id !== action.payload
      );
      state.priorityProperties = state.priorityProperties.filter(
        id => id !== action.payload
      );
      if (state.currentUser) {
        state.currentUser.savedProperties = state.currentUser.savedProperties.filter(
          id => id !== action.payload
        );
        if (state.currentUser.priorityProperties) {
          state.currentUser.priorityProperties = state.currentUser.priorityProperties.filter(
            id => id !== action.payload
          );
        }
      }
    },
    addRejectedProperty: (state, action: PayloadAction<string>) => {
      if (!state.rejectedProperties.includes(action.payload)) {
        state.rejectedProperties.push(action.payload);
      }
      if (state.currentUser && !state.currentUser.rejectedProperties.includes(action.payload)) {
        state.currentUser.rejectedProperties.push(action.payload);
      }
    },
    removeRejectedProperty: (state, action: PayloadAction<string>) => {
      state.rejectedProperties = state.rejectedProperties.filter(
        id => id !== action.payload
      );
      if (state.currentUser) {
        state.currentUser.rejectedProperties = state.currentUser.rejectedProperties.filter(
          id => id !== action.payload
        );
      }
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateUserPreferences,
  addSavedProperty,
  addPriorityProperty,
  removeSavedProperty,
  addRejectedProperty,
  removeRejectedProperty,
} = userSlice.actions;

export default userSlice.reducer;