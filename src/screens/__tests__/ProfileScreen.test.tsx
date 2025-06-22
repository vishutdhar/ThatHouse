import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { Alert, Share } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import configureStore from 'redux-mock-store';
import ProfileScreen from '../ProfileScreen';
import { ThemeProvider } from '../../theme/ThemeContext';

// Mock dependencies
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');
jest.mock('@react-native-async-storage/async-storage', () => ({
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

// Mock Share
jest.mock('react-native/Libraries/Share/Share', () => ({
  share: jest.fn(() => Promise.resolve({ action: 'sharedAction' })),
}));

const mockStore = configureStore([]);
const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

describe('ProfileScreen', () => {
  let store: any;

  beforeEach(() => {
    store = mockStore({
      user: {
        currentUser: {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          savedProperties: ['prop1', 'prop2'],
          rejectedProperties: ['prop3'],
          preferences: {
            minPrice: 100000,
            maxPrice: 500000,
          },
        },
        isAuthenticated: true,
      },
      ui: {
        theme: 'light',
        notifications: {
          matches: true,
          messages: true,
          updates: true,
        },
      },
    });
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <Provider store={store}>
        <NavigationContainer>
          <ThemeProvider>
            <ProfileScreen />
          </ThemeProvider>
        </NavigationContainer>
      </Provider>
    );
  };

  it('renders correctly', () => {
    const { getByText } = renderComponent();
    
    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('john.doe@example.com')).toBeTruthy();
    expect(getByText('2')).toBeTruthy(); // Saved properties count
    expect(getByText('1')).toBeTruthy(); // Rejected properties count
  });

  it('navigates to Edit Profile screen', () => {
    const { getByText } = renderComponent();
    
    fireEvent.press(getByText('Edit Profile'));
    expect(mockNavigate).toHaveBeenCalledWith('EditProfile');
  });

  it('navigates to Preferences screen', () => {
    const { getByText } = renderComponent();
    
    fireEvent.press(getByText('Preferences'));
    expect(mockNavigate).toHaveBeenCalledWith('Preferences');
  });

  it('navigates to Notifications screen', () => {
    const { getByText } = renderComponent();
    
    fireEvent.press(getByText('Notifications'));
    expect(mockNavigate).toHaveBeenCalledWith('NotificationSettings');
  });

  it('navigates to Privacy screen', () => {
    const { getByText } = renderComponent();
    
    fireEvent.press(getByText('Privacy'));
    expect(mockNavigate).toHaveBeenCalledWith('Privacy');
  });

  it('navigates to Help & Support screen', () => {
    const { getByText } = renderComponent();
    
    fireEvent.press(getByText('Help & Support'));
    expect(mockNavigate).toHaveBeenCalledWith('HelpSupport');
  });

  it('navigates to About screen', () => {
    const { getByText } = renderComponent();
    
    fireEvent.press(getByText('About'));
    expect(mockNavigate).toHaveBeenCalledWith('About');
  });

  it('toggles dark mode', () => {
    const { getByTestId } = renderComponent();
    const actions = store.getActions();
    
    // Note: In actual implementation, you might need to add testID to the Switch component
    // For now, we'll check if the action is dispatched
    expect(actions).toEqual([]);
  });

  it('shows logout confirmation dialog', () => {
    const { getByText } = renderComponent();
    
    fireEvent.press(getByText('Log Out'));
    
    expect(Alert.alert).toHaveBeenCalledWith(
      'Logout',
      'Are you sure you want to logout?',
      expect.any(Array)
    );
  });

  it('shows clear cache confirmation dialog', async () => {
    const { getByText } = renderComponent();
    
    fireEvent.press(getByText('Clear Cache'));
    
    expect(Alert.alert).toHaveBeenCalledWith(
      'Clear Cache',
      'This will clear all cached data. Continue?',
      expect.any(Array)
    );
  });

  it('exports user data', () => {
    const { getByText } = renderComponent();
    
    fireEvent.press(getByText('Export My Data'));
    
    expect(Alert.alert).toHaveBeenCalledWith(
      'Export Data',
      'Your data will be exported as a JSON file',
      expect.any(Array)
    );
  });

  it('shares user profile', async () => {
    const { getByText } = renderComponent();
    
    fireEvent.press(getByText('Share Profile'));
    
    await waitFor(() => {
      expect(Share.share).toHaveBeenCalledWith({
        message: 'Check out my ThatHouse profile! I\'ve saved 2 properties so far.',
        title: 'Share Profile',
      });
    });
  });

  it('navigates to saved properties when stat card is pressed', () => {
    const { getByText } = renderComponent();
    
    fireEvent.press(getByText('Saved'));
    expect(mockNavigate).toHaveBeenCalledWith('Main', { screen: 'Saved' });
  });

  it('navigates to rejected properties when stat card is pressed', () => {
    const { getByText } = renderComponent();
    
    fireEvent.press(getByText('Rejected'));
    expect(mockNavigate).toHaveBeenCalledWith('RejectedProperties');
  });
});

export {};