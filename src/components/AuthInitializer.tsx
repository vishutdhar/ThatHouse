import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { setCurrentUser } from '../store/slices/userSlice';
import { useTheme } from '../theme/ThemeContext';
import { supabase } from '../lib/supabase';
import { UserType } from '../types';

const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for existing Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Get user profile from our database
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          const user = {
            id: session.user.id,
            email: session.user.email!,
            firstName: profile?.first_name || '',
            lastName: profile?.last_name || '',
            savedProperties: [],
            rejectedProperties: [],
            priorityProperties: [],
            userType: 'BUYER' as UserType,
            preferences: {
              priceRange: { min: 0, max: 1000000 },
              bedrooms: { min: 1, max: 5 },
              bathrooms: { min: 1, max: 4 },
              propertyTypes: ['SINGLE_FAMILY', 'CONDO', 'TOWNHOUSE'],
              amenities: [],
              searchRadius: 10,
            },
          };
          
          dispatch(setCurrentUser(user));
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [dispatch]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
};

export default AuthInitializer;