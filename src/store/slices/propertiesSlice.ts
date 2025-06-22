import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Property, PropertiesState, PropertyFilters } from '../../types';
import { propertyApi } from '../../services/api';

// Async thunks for API calls
export const fetchProperties = createAsyncThunk(
  'properties/fetchProperties',
  async (params?: { limit?: number; offset?: number; excludeViewed?: boolean }) => {
    const response = await propertyApi.getProperties(params);
    return response;
  }
);

export const searchProperties = createAsyncThunk(
  'properties/searchProperties',
  async (params: {
    location?: string;
    priceMin?: number;
    priceMax?: number;
    beds?: number;
    baths?: number;
    propertyType?: string;
  }) => {
    const response = await propertyApi.searchProperties(params);
    return response;
  }
);

export const getMapProperties = createAsyncThunk(
  'properties/getMapProperties',
  async (bounds: { north: number; south: number; east: number; west: number }) => {
    const response = await propertyApi.getMapProperties(bounds);
    return response;
  }
);

const initialState: PropertiesState = {
  properties: [],
  currentIndex: 0,
  isLoading: false,
  hasMore: true,
  error: null,
  filters: {
    priceRange: {},
    bedrooms: {},
    bathrooms: {},
    squareFeet: {},
    propertyTypes: [],
    sortBy: 'newest',
    sortOrder: 'desc',
  },
  previousIndices: [],
  propertyNotes: {},
  propertyCollections: {},
};

const propertiesSlice = createSlice({
  name: 'properties',
  initialState,
  reducers: {
    setCurrentIndex: (state, action: PayloadAction<number>) => {
      state.currentIndex = action.payload;
    },
    incrementIndex: (state) => {
      state.previousIndices.push(state.currentIndex);
      state.currentIndex += 1;
    },
    decrementIndex: (state) => {
      if (state.previousIndices.length > 0) {
        state.currentIndex = state.previousIndices.pop() || 0;
      }
    },
    removeProperty: (state, action: PayloadAction<string>) => {
      state.properties = state.properties.filter(p => p.id !== action.payload);
    },
    updateFilters: (state, action: PayloadAction<Partial<PropertyFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.properties = [];
      state.currentIndex = 0;
      state.hasMore = true;
    },
    resetProperties: (state) => {
      state.properties = [];
      state.currentIndex = 0;
      state.hasMore = true;
      state.error = null;
      state.previousIndices = [];
    },
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const property = state.properties.find(p => p.id === action.payload);
      if (property) {
        property.isFavorite = !property.isFavorite;
      }
    },
    addPropertyNote: (state, action: PayloadAction<{ propertyId: string; note: string }>) => {
      state.propertyNotes[action.payload.propertyId] = action.payload.note;
    },
    removePropertyNote: (state, action: PayloadAction<string>) => {
      delete state.propertyNotes[action.payload];
    },
    setPropertyCollection: (state, action: PayloadAction<{ propertyId: string; collectionId: string }>) => {
      state.propertyCollections[action.payload.propertyId] = action.payload.collectionId;
    },
    removePropertyFromCollection: (state, action: PayloadAction<string>) => {
      delete state.propertyCollections[action.payload];
    },
    clearAllProperties: (state) => {
      state.properties = [];
      state.currentIndex = 0;
      state.hasMore = true;
      state.error = null;
      state.previousIndices = [];
      state.propertyNotes = {};
      state.propertyCollections = {};
    },
  },
  extraReducers: (builder) => {
    // Handle fetchProperties
    builder
      .addCase(fetchProperties.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.isLoading = false;
        // Merge new properties, avoiding duplicates
        const existingIds = new Set(state.properties.map(p => p.id));
        const newProperties = action.payload.properties.filter(p => !existingIds.has(p.id));
        state.properties = [...state.properties, ...newProperties];
        state.hasMore = action.payload.hasMore;
        state.error = null;
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch properties';
      });

    // Handle searchProperties
    builder
      .addCase(searchProperties.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchProperties.fulfilled, (state, action) => {
        state.isLoading = false;
        state.properties = action.payload.properties;
        state.currentIndex = 0;
        state.error = null;
      })
      .addCase(searchProperties.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to search properties';
      });

    // Handle getMapProperties
    builder
      .addCase(getMapProperties.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMapProperties.fulfilled, (state, action) => {
        state.isLoading = false;
        state.properties = action.payload.properties;
        state.error = null;
      })
      .addCase(getMapProperties.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch map properties';
      });
  },
});

export const {
  setCurrentIndex,
  incrementIndex,
  decrementIndex,
  removeProperty,
  updateFilters,
  resetProperties,
  toggleFavorite,
  addPropertyNote,
  removePropertyNote,
  setPropertyCollection,
  removePropertyFromCollection,
  clearAllProperties,
} = propertiesSlice.actions;

export default propertiesSlice.reducer;