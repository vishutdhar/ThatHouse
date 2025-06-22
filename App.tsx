import React, { useEffect } from 'react';
import { Text, Button } from 'react-native';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/theme/ThemeContext';
import AuthInitializer from './src/components/AuthInitializer';
import { initSentry, ErrorBoundary } from './src/config/sentry';

function App() {
  useEffect(() => {
    initSentry();
  }, []);

  return (
    <ErrorBoundary fallback={ErrorFallback}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Provider store={store}>
          <ThemeProvider>
            <AuthInitializer>
              <AppNavigator />
            </AuthInitializer>
          </ThemeProvider>
        </Provider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const ErrorFallback = ({ error, resetError }: any) => {
  return (
    <GestureHandlerRootView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Something went wrong</Text>
      <Button title="Try again" onPress={resetError} />
    </GestureHandlerRootView>
  );
};

export default App;
