import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { ENV } from '../config/env';

// Create Supabase client with AsyncStorage for auth persistence
export const supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types (we'll generate these later)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          user_type: 'BUYER' | 'SELLER' | 'AGENT';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      properties: {
        Row: {
          id: string;
          address: string;
          city: string;
          state: string;
          zip_code: string;
          price: number;
          bedrooms: number;
          bathrooms: number;
          square_feet: number;
          year_built: number;
          property_type: 'SINGLE_FAMILY' | 'CONDO' | 'TOWNHOUSE' | 'MULTI_FAMILY';
          description: string;
          features: string[];
          latitude: number;
          longitude: number;
          days_on_market: number;
          status: 'ACTIVE' | 'PENDING' | 'SOLD';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['properties']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['properties']['Insert']>;
      };
      property_images: {
        Row: {
          id: string;
          property_id: string;
          image_url: string;
          display_order: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['property_images']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['property_images']['Insert']>;
      };
      saved_properties: {
        Row: {
          user_id: string;
          property_id: string;
          saved_at: string;
        };
        Insert: Omit<Database['public']['Tables']['saved_properties']['Row'], 'saved_at'>;
        Update: Partial<Database['public']['Tables']['saved_properties']['Insert']>;
      };
      rejected_properties: {
        Row: {
          user_id: string;
          property_id: string;
          rejected_at: string;
        };
        Insert: Omit<Database['public']['Tables']['rejected_properties']['Row'], 'rejected_at'>;
        Update: Partial<Database['public']['Tables']['rejected_properties']['Insert']>;
      };
    };
  };
};