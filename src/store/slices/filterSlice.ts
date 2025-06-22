import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PropertyType, ListingType } from '../../types';

export interface FilterState {
  location: {
    city: string;
    state: string;
    zipCode: string;
    radius: number; // in miles
  };
  priceRange: {
    min: number;
    max: number;
  };
  bedrooms: {
    min: number;
    max: number | null;
  };
  bathrooms: {
    min: number;
    max: number | null;
  };
  propertyTypes: PropertyType[];
  listingType: ListingType | null;
  squareFeet: {
    min: number;
    max: number | null;
  };
  yearBuilt: {
    min: number | null;
    max: number | null;
  };
  daysOnMarket: number | null;
  features: string[];
  isActive: boolean;
}

const initialState: FilterState = {
  location: {
    city: 'Nashville',
    state: 'TN',
    zipCode: '',
    radius: 10,
  },
  priceRange: {
    min: 0,
    max: 2000000,
  },
  bedrooms: {
    min: 0,
    max: null,
  },
  bathrooms: {
    min: 0,
    max: null,
  },
  propertyTypes: [],
  listingType: null,
  squareFeet: {
    min: 0,
    max: null,
  },
  yearBuilt: {
    min: null,
    max: null,
  },
  daysOnMarket: null,
  features: [],
  isActive: false,
};

const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    setLocation: (state, action: PayloadAction<Partial<FilterState['location']>>) => {
      state.location = { ...state.location, ...action.payload };
      state.isActive = true;
    },
    setPriceRange: (state, action: PayloadAction<{ min: number; max: number }>) => {
      state.priceRange = action.payload;
      state.isActive = true;
    },
    setBedroomRange: (state, action: PayloadAction<{ min: number; max: number | null }>) => {
      state.bedrooms = action.payload;
      state.isActive = true;
    },
    setBathroomRange: (state, action: PayloadAction<{ min: number; max: number | null }>) => {
      state.bathrooms = action.payload;
      state.isActive = true;
    },
    togglePropertyType: (state, action: PayloadAction<PropertyType>) => {
      const index = state.propertyTypes.indexOf(action.payload);
      if (index > -1) {
        state.propertyTypes.splice(index, 1);
      } else {
        state.propertyTypes.push(action.payload);
      }
      state.isActive = true;
    },
    setPropertyTypes: (state, action: PayloadAction<PropertyType[]>) => {
      state.propertyTypes = action.payload;
      state.isActive = action.payload.length > 0;
    },
    setListingType: (state, action: PayloadAction<ListingType | null>) => {
      state.listingType = action.payload;
      state.isActive = true;
    },
    setSquareFeetRange: (state, action: PayloadAction<{ min: number; max: number | null }>) => {
      state.squareFeet = action.payload;
      state.isActive = true;
    },
    setYearBuiltRange: (state, action: PayloadAction<{ min: number | null; max: number | null }>) => {
      state.yearBuilt = action.payload;
      state.isActive = true;
    },
    setDaysOnMarket: (state, action: PayloadAction<number | null>) => {
      state.daysOnMarket = action.payload;
      state.isActive = true;
    },
    toggleFeature: (state, action: PayloadAction<string>) => {
      const index = state.features.indexOf(action.payload);
      if (index > -1) {
        state.features.splice(index, 1);
      } else {
        state.features.push(action.payload);
      }
      state.isActive = true;
    },
    resetFilters: () => initialState,
    setActiveStatus: (state, action: PayloadAction<boolean>) => {
      state.isActive = action.payload;
    },
  },
});

export const {
  setLocation,
  setPriceRange,
  setBedroomRange,
  setBathroomRange,
  togglePropertyType,
  setPropertyTypes,
  setListingType,
  setSquareFeetRange,
  setYearBuiltRange,
  setDaysOnMarket,
  toggleFeature,
  resetFilters,
  setActiveStatus,
} = filterSlice.actions;

export default filterSlice.reducer;