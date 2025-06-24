import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types matching our current app structure
export interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  yearBuilt: number;
  propertyType: 'SINGLE_FAMILY' | 'CONDO' | 'TOWNHOUSE' | 'MULTI_FAMILY';
  description: string;
  features: string[];
  images: string[];
  latitude: number;
  longitude: number;
  daysOnMarket: number;
  virtualTourUrl?: string;
  agent?: {
    id: string;
    name: string;
    phone: string;
    email: string;
  };
  // Price tracking
  previousPrice?: number;
  priceChangedDate?: string;
  isPriceReduced?: boolean;
  // Open house tracking
  nextOpenHouse?: {
    startTime: string;
    endTime: string;
    notes?: string;
  };
}

// Transform Supabase property to our app format
const transformProperty = (dbProperty: any, images: any[]): Property => {
  return {
    id: dbProperty.id,
    address: dbProperty.address,
    city: dbProperty.city,
    state: dbProperty.state,
    zipCode: dbProperty.zip_code,
    price: dbProperty.price,
    bedrooms: dbProperty.bedrooms,
    bathrooms: dbProperty.bathrooms,
    squareFeet: dbProperty.square_feet,
    yearBuilt: dbProperty.year_built,
    propertyType: dbProperty.property_type,
    description: dbProperty.description,
    features: dbProperty.features || [],
    images: images.map(img => img.image_url),
    latitude: dbProperty.latitude,
    longitude: dbProperty.longitude,
    daysOnMarket: dbProperty.days_on_market,
    virtualTourUrl: dbProperty.virtual_tour_url,
    // Price tracking fields
    previousPrice: dbProperty.previous_price,
    priceChangedDate: dbProperty.price_changed_date,
    isPriceReduced: dbProperty.is_price_reduced,
    // Open house info (if using the view)
    nextOpenHouse: dbProperty.next_open_house_start ? {
      startTime: dbProperty.next_open_house_start,
      endTime: dbProperty.next_open_house_end,
      notes: dbProperty.next_open_house_notes
    } : undefined,
  };
};

// Auth functions
export const login = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  // Store the session token
  if (data.session) {
    await AsyncStorage.setItem('authToken', data.session.access_token);
    await AsyncStorage.setItem('userId', data.user.id);
  }

  return {
    user: {
      id: data.user.id,
      email: data.user.email!,
      firstName: data.user.user_metadata?.first_name || '',
      lastName: data.user.user_metadata?.last_name || '',
    },
    token: data.session.access_token,
  };
};

export const register = async (data: { 
  email: string; 
  password: string; 
  firstName: string; 
  lastName: string;
}) => {
  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        first_name: data.firstName,
        last_name: data.lastName,
      },
    },
  });

  if (error) throw error;
  if (!authData.user) throw new Error('Registration failed');

  // Store the session token if available
  if (authData.session) {
    await AsyncStorage.setItem('authToken', authData.session.access_token);
    await AsyncStorage.setItem('userId', authData.user.id);
  }

  return {
    user: {
      id: authData.user.id,
      email: authData.user.email!,
      firstName: data.firstName,
      lastName: data.lastName,
    },
    token: authData.session?.access_token,
  };
};

export const logout = async () => {
  await supabase.auth.signOut();
  await AsyncStorage.removeItem('authToken');
  await AsyncStorage.removeItem('userId');
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  // Get user profile from our users table
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  return {
    id: user.id,
    email: user.email!,
    firstName: profile?.first_name || '',
    lastName: profile?.last_name || '',
  };
};

// Property functions
export const fetchProperties = async (page: number = 1, limit: number = 20) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // First get total count for pagination
  const { count } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'ACTIVE');

  // Fetch properties with their images and open house info
  const { data: properties, error } = await supabase
    .from('properties_with_open_houses')
    .select(`
      *,
      property_images (
        image_url,
        display_order
      )
    `)
    .eq('status', 'ACTIVE')
    .range(from, to)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Transform the data
  const transformedProperties = properties.map(prop => 
    transformProperty(prop, prop.property_images || [])
  );

  return {
    properties: transformedProperties,
    totalCount: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  };
};

export const saveProperty = async (propertyId: string) => {
  const userId = await AsyncStorage.getItem('userId');
  if (!userId) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('saved_properties')
    .insert({
      user_id: userId,
      property_id: propertyId,
    });

  if (error && error.code !== '23505') { // Ignore duplicate key errors
    throw error;
  }

  return { success: true };
};

export const rejectProperty = async (propertyId: string) => {
  const userId = await AsyncStorage.getItem('userId');
  if (!userId) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('rejected_properties')
    .insert({
      user_id: userId,
      property_id: propertyId,
    });

  if (error && error.code !== '23505') { // Ignore duplicate key errors
    throw error;
  }

  return { success: true };
};

export const getSavedProperties = async () => {
  const userId = await AsyncStorage.getItem('userId');
  if (!userId) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('saved_properties')
    .select(`
      property_id,
      saved_at,
      properties (
        *,
        property_images (
          image_url,
          display_order
        )
      )
    `)
    .eq('user_id', userId)
    .order('saved_at', { ascending: false });

  if (error) throw error;

  // Transform the data
  const properties = data.map(item => 
    transformProperty(item.properties, item.properties.property_images || [])
  );

  return { properties };
};

export const getRejectedProperties = async () => {
  const userId = await AsyncStorage.getItem('userId');
  if (!userId) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('rejected_properties')
    .select(`
      property_id,
      rejected_at,
      properties (
        *,
        property_images (
          image_url,
          display_order
        )
      )
    `)
    .eq('user_id', userId)
    .order('rejected_at', { ascending: false });

  if (error) throw error;

  // Transform the data
  const properties = data.map(item => 
    transformProperty(item.properties, item.properties.property_images || [])
  );

  return { properties };
};

export const removeSavedProperty = async (propertyId: string) => {
  const userId = await AsyncStorage.getItem('userId');
  if (!userId) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('saved_properties')
    .delete()
    .eq('user_id', userId)
    .eq('property_id', propertyId);

  if (error) throw error;

  return { success: true };
};

export const unrejectProperty = async (propertyId: string) => {
  const userId = await AsyncStorage.getItem('userId');
  if (!userId) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('rejected_properties')
    .delete()
    .eq('user_id', userId)
    .eq('property_id', propertyId);

  if (error) throw error;

  return { success: true };
};

export const searchProperties = async (query: string) => {
  const { data: properties, error } = await supabase
    .from('properties_with_open_houses')
    .select(`
      *,
      property_images (
        image_url,
        display_order
      )
    `)
    .eq('status', 'ACTIVE')
    .or(`address.ilike.%${query}%,city.ilike.%${query}%`)
    .limit(20);

  if (error) throw error;

  // Transform the data
  const transformedProperties = properties.map(prop => 
    transformProperty(prop, prop.property_images || [])
  );

  return { properties: transformedProperties };
};