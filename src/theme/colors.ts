export const lightTheme = {
  // Primary colors
  primary: '#FF6B6B',
  primaryLight: '#FFF5F5',
  
  // Background colors
  background: '#FFFFFF',
  backgroundSecondary: '#F5F5F5',
  backgroundTertiary: '#F8F8F8',
  
  // Text colors
  text: '#333333',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textInverse: '#FFFFFF',
  
  // Border colors
  border: '#EEEEEE',
  borderLight: '#F0F0F0',
  borderDark: '#DDDDDD',
  
  // Status colors
  success: '#4CCC93',
  error: '#FF5252',
  warning: '#FF9500',
  info: '#2196F3',
  
  // Component specific
  cardBackground: '#FFFFFF',
  cardShadow: 'rgba(0, 0, 0, 0.1)',
  modalOverlay: 'rgba(0, 0, 0, 0.5)',
  modalBackground: 'rgba(0, 0, 0, 0.5)',
  inputBackground: '#F5F5F5',
  inputBorder: '#DDDDDD',
  chipBackground: '#F0F0F0',
  chipText: '#666666',
  chipTextActive: '#FFFFFF',
  
  // Navigation
  tabBarBackground: '#FFFFFF',
  tabBarActive: '#FF6B6B',
  tabBarInactive: '#808080',
  headerBackground: '#FFFFFF',
  
  // Shadows
  shadowColor: '#000000',
};

export const darkTheme = {
  // Primary colors
  primary: '#FF6B6B',
  primaryLight: '#3A2222',
  
  // Background colors
  background: '#121212',
  backgroundSecondary: '#1E1E1E',
  backgroundTertiary: '#2A2A2A',
  
  // Text colors
  text: '#FFFFFF',
  textSecondary: '#B3B3B3',
  textTertiary: '#808080',
  textInverse: '#121212',
  
  // Border colors
  border: '#2A2A2A',
  borderLight: '#333333',
  borderDark: '#1A1A1A',
  
  // Status colors
  success: '#4CCC93',
  error: '#FF5252',
  warning: '#FF9500',
  info: '#2196F3',
  
  // Component specific
  cardBackground: '#1E1E1E',
  cardShadow: 'rgba(0, 0, 0, 0.3)',
  modalOverlay: 'rgba(0, 0, 0, 0.7)',
  modalBackground: 'rgba(0, 0, 0, 0.7)',
  inputBackground: '#2A2A2A',
  inputBorder: '#3A3A3A',
  chipBackground: '#2A2A2A',
  chipText: '#B3B3B3',
  chipTextActive: '#FFFFFF',
  
  // Navigation
  tabBarBackground: '#1E1E1E',
  tabBarActive: '#FF6B6B',
  tabBarInactive: '#808080',
  headerBackground: '#1E1E1E',
  
  // Shadows
  shadowColor: '#000000',
};

export type Theme = typeof lightTheme;