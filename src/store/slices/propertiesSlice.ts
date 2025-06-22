import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Property, PropertiesState, PropertyFilters } from '../../types';

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
    fetchPropertiesStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchPropertiesSuccess: (state, action: PayloadAction<Property[]>) => {
      state.isLoading = false;
      state.properties = [...state.properties, ...action.payload];
      state.hasMore = action.payload.length > 0;
      state.error = null;
    },
    fetchPropertiesFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
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
});

export const {
  fetchPropertiesStart,
  fetchPropertiesSuccess,
  fetchPropertiesFailure,
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