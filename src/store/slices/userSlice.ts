import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { User, UserState, UserType } from '../../types';
import * as supabaseApi from '../../services/supabaseApi';

// Async thunks
export const login = createAsyncThunk(
  'user/login',
  async ({ email, password }: { email: string; password: string }) => {
    const response = await supabaseApi.login(email, password);
    // Transform to match existing structure
    return {
      user: {
        ...response.user,
        savedProperties: [],
        rejectedProperties: [],
        priorityProperties: [],
        userType: 'BUYER' as UserType,
        preferences: {
          priceRange: { min: 0, max: 1000000 },
          bedrooms: { min: 1, max: 5 },
          bathrooms: { min: 1, max: 4 },
          propertyTypes: ['SINGLE_FAMILY', 'CONDO', 'TOWNHOUSE'],
          amenities: [],
          searchRadius: 10,
        },
      },
      token: response.token,
    };
  }
);

export const register = createAsyncThunk(
  'user/register',
  async (data: { email: string; password: string; firstName: string; lastName: string }) => {
    const response = await supabaseApi.register(data);
    // Transform to match existing structure
    return {
      user: {
        ...response.user,
        savedProperties: [],
        rejectedProperties: [],
        priorityProperties: [],
        userType: 'BUYER' as UserType,
        preferences: {
          priceRange: { min: 0, max: 1000000 },
          bedrooms: { min: 1, max: 5 },
          bathrooms: { min: 1, max: 4 },
          propertyTypes: ['SINGLE_FAMILY', 'CONDO', 'TOWNHOUSE'],
          amenities: [],
          searchRadius: 10,
        },
      },
      token: response.token,
    };
  }
);

export const savePropertyAsync = createAsyncThunk(
  'user/saveProperty',
  async (propertyId: string) => {
    await supabaseApi.saveProperty(propertyId);
    return propertyId;
  }
);

export const unsavePropertyAsync = createAsyncThunk(
  'user/unsaveProperty',
  async (propertyId: string) => {
    await supabaseApi.removeSavedProperty(propertyId);
    return propertyId;
  }
);

export const rejectPropertyAsync = createAsyncThunk(
  'user/rejectProperty',
  async (propertyId: string) => {
    await supabaseApi.rejectProperty(propertyId);
    return propertyId;
  }
);

export const unrejectPropertyAsync = createAsyncThunk(
  'user/unrejectProperty',
  async (propertyId: string) => {
    await supabaseApi.unrejectProperty(propertyId);
    return propertyId;
  }
);

export const fetchSavedProperties = createAsyncThunk(
  'user/fetchSavedProperties',
  async () => {
    const response = await supabaseApi.getSavedProperties();
    return response.properties;
  }
);

export const fetchRejectedProperties = createAsyncThunk(
  'user/fetchRejectedProperties',
  async () => {
    const response = await supabaseApi.getRejectedProperties();
    return response.properties;
  }
);

const initialState: UserState = {
  currentUser: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  savedProperties: [],
  rejectedProperties: [],
  priorityProperties: [],
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.error = null;
      state.savedProperties = [];
      state.rejectedProperties = [];
      state.priorityProperties = [];
      supabaseApi.logout();
    },
    updateUserPreferences: (state, action: PayloadAction<Partial<User>>) => {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload };
      }
    },
    // Local actions for immediate UI update
    addSavedProperty: (state, action: PayloadAction<string>) => {
      if (state.currentUser && !state.currentUser.savedProperties.includes(action.payload)) {
        state.currentUser.savedProperties.push(action.payload);
        state.savedProperties.push(action.payload);
      }
    },
    removeSavedProperty: (state, action: PayloadAction<string>) => {
      if (state.currentUser) {
        state.currentUser.savedProperties = state.currentUser.savedProperties.filter(id => id !== action.payload);
        state.savedProperties = state.savedProperties.filter(id => id !== action.payload);
      }
    },
    addRejectedProperty: (state, action: PayloadAction<string>) => {
      if (state.currentUser && !state.currentUser.rejectedProperties.includes(action.payload)) {
        state.currentUser.rejectedProperties.push(action.payload);
        state.rejectedProperties.push(action.payload);
      }
    },
    removeRejectedProperty: (state, action: PayloadAction<string>) => {
      if (state.currentUser) {
        state.currentUser.rejectedProperties = state.currentUser.rejectedProperties.filter(id => id !== action.payload);
        state.rejectedProperties = state.rejectedProperties.filter(id => id !== action.payload);
      }
    },
    addPriorityProperty: (state, action: PayloadAction<string>) => {
      if (state.currentUser && !state.currentUser.priorityProperties.includes(action.payload)) {
        state.currentUser.priorityProperties.push(action.payload);
        state.priorityProperties.push(action.payload);
      }
    },
    removePriorityProperty: (state, action: PayloadAction<string>) => {
      if (state.currentUser) {
        state.currentUser.priorityProperties = state.currentUser.priorityProperties.filter(id => id !== action.payload);
        state.priorityProperties = state.priorityProperties.filter(id => id !== action.payload);
      }
    },
    clearAllSavedProperties: (state) => {
      if (state.currentUser) {
        state.currentUser.savedProperties = [];
        state.savedProperties = [];
      }
    },
    clearAllRejectedProperties: (state) => {
      if (state.currentUser) {
        state.currentUser.rejectedProperties = [];
        state.rejectedProperties = [];
      }
    },
    setCurrentUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
      state.isAuthenticated = true;
      state.savedProperties = action.payload.savedProperties;
      state.rejectedProperties = action.payload.rejectedProperties;
      state.priorityProperties = action.payload.priorityProperties || [];
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.currentUser = action.payload.user;
        state.savedProperties = action.payload.user.savedProperties;
        state.rejectedProperties = action.payload.user.rejectedProperties;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Login failed';
      });

    // Register
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.currentUser = action.payload.user;
        state.savedProperties = action.payload.user.savedProperties;
        state.rejectedProperties = action.payload.user.rejectedProperties;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Registration failed';
      });

    // Save property
    builder.addCase(savePropertyAsync.fulfilled, (state, action) => {
      if (state.currentUser && !state.currentUser.savedProperties.includes(action.payload)) {
        state.currentUser.savedProperties.push(action.payload);
        state.savedProperties.push(action.payload);
      }
    });

    // Unsave property
    builder.addCase(unsavePropertyAsync.fulfilled, (state, action) => {
      if (state.currentUser) {
        state.currentUser.savedProperties = state.currentUser.savedProperties.filter(id => id !== action.payload);
        state.savedProperties = state.savedProperties.filter(id => id !== action.payload);
      }
    });

    // Reject property
    builder.addCase(rejectPropertyAsync.fulfilled, (state, action) => {
      if (state.currentUser && !state.currentUser.rejectedProperties.includes(action.payload)) {
        state.currentUser.rejectedProperties.push(action.payload);
        state.rejectedProperties.push(action.payload);
      }
    });

    // Unreject property
    builder.addCase(unrejectPropertyAsync.fulfilled, (state, action) => {
      if (state.currentUser) {
        state.currentUser.rejectedProperties = state.currentUser.rejectedProperties.filter(id => id !== action.payload);
        state.rejectedProperties = state.rejectedProperties.filter(id => id !== action.payload);
      }
    });
  },
});

export const {
  logout,
  updateUserPreferences,
  addSavedProperty,
  removeSavedProperty,
  addRejectedProperty,
  removeRejectedProperty,
  addPriorityProperty,
  removePriorityProperty,
  clearAllSavedProperties,
  clearAllRejectedProperties,
  setCurrentUser,
} = userSlice.actions;

export default userSlice.reducer;