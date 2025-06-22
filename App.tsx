import React from 'react';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/theme/ThemeContext';
import AuthInitializer from './src/components/AuthInitializer';

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <ThemeProvider>
          <AuthInitializer>
            <AppNavigator />
          </AuthInitializer>
        </ThemeProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}

export default App;
