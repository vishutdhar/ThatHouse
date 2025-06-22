import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import propertiesReducer from './slices/propertiesSlice';
import messagesReducer from './slices/messagesSlice';
import uiReducer from './slices/uiSlice';
import filterReducer from './slices/filterSlice';
import searchReducer from './slices/searchSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    properties: propertiesReducer,
    messages: messagesReducer,
    ui: uiReducer,
    filter: filterReducer,
    search: searchReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat((store) => (next) => (action) => {
      console.log('Redux Action:', action.type);
      const result = next(action);
      if (action.type.includes('Property')) {
        console.log('State after action:', {
          savedProperties: store.getState().user.currentUser?.savedProperties,
          rejectedProperties: store.getState().user.currentUser?.rejectedProperties,
          totalProperties: store.getState().properties.properties.length,
        });
      }
      return result;
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;