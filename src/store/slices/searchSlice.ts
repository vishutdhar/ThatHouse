import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SavedSearch {
  id: string;
  query: string;
  filters: any;
  createdAt: string;
}

interface SearchState {
  searchHistory: string[];
  savedSearches: SavedSearch[];
  currentSearchResults: any[];
  isSearching: boolean;
}

const initialState: SearchState = {
  searchHistory: [],
  savedSearches: [],
  currentSearchResults: [],
  isSearching: false,
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    addSearchHistory: (state, action: PayloadAction<string>) => {
      // Remove duplicates and add to beginning
      state.searchHistory = [
        action.payload,
        ...state.searchHistory.filter(item => item !== action.payload)
      ].slice(0, 10); // Keep only last 10 searches
    },
    clearSearchHistory: (state) => {
      state.searchHistory = [];
    },
    addSavedSearch: (state, action: PayloadAction<SavedSearch>) => {
      state.savedSearches.push(action.payload);
    },
    removeSavedSearch: (state, action: PayloadAction<string>) => {
      state.savedSearches = state.savedSearches.filter(
        search => search.id !== action.payload
      );
    },
    setSearchResults: (state, action: PayloadAction<any[]>) => {
      state.currentSearchResults = action.payload;
    },
    setIsSearching: (state, action: PayloadAction<boolean>) => {
      state.isSearching = action.payload;
    },
  },
});

export const {
  addSearchHistory,
  clearSearchHistory,
  addSavedSearch,
  removeSavedSearch,
  setSearchResults,
  setIsSearching,
} = searchSlice.actions;

export default searchSlice.reducer;