import React, { createContext, useContext, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { lightTheme, darkTheme, Theme } from './colors';

interface ThemeContextType {
  colors: Theme;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useSelector((state: RootState) => state.ui.theme);
  
  const value = useMemo(() => ({
    colors: theme === 'dark' ? darkTheme : lightTheme,
    isDark: theme === 'dark',
  }), [theme]);
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};