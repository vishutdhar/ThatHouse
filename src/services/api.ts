import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base configuration
// Use your computer's IP address instead of localhost for React Native
// On Mac: Get IP with `ifconfig | grep inet`
// On Windows: Get IP with `ipconfig`
const API_BASE_URL = __DEV__ 
  ? 'http://192.168.1.192:3001' // Local development
  : 'https://api.thathouse.com'; // Production API

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Making request to:', config.url, 'Method:', config.method);
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Handle responses
api.interceptors.response.use(
  (response) => {
    console.log('Response received from:', response.config.url, 'Status:', response.status);
    return response;
  },
  async (error) => {
    console.error('API Error:', error.message);
    console.error('Error details:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    });
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem('authToken');
      // Could dispatch logout action here
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authApi = {
  login: async (email: string, password: string) => {
    // For mock API, we'll check against the db.json users
    const response = await api.get('/users', {
      params: { email, password }
    });
    
    if (response.data && response.data.length > 0) {
      const user = response.data[0];
      await AsyncStorage.setItem('authToken', user.token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      return { token: user.token, user };
    } else {
      throw new Error('Invalid credentials');
    }
  },

  register: async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    const response = await api.post('/api/auth/register', data);
    if (response.data.token) {
      await AsyncStorage.setItem('authToken', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: async () => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('user');
    return { success: true };
  },

  getCurrentUser: async () => {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

// Property APIs
export const propertyApi = {
  getProperties: async (params?: {
    limit?: number;
    offset?: number;
    excludeViewed?: boolean;
  }) => {
    try {
      console.log('Fetching properties from:', API_BASE_URL + '/properties');
      console.log('With params:', params);
      const response = await api.get('/properties', { params });
      console.log('Properties response:', response);
      console.log('Properties data:', response.data);
      console.log('Properties fetched:', response.data.length);
      // Transform the response to match what the Redux slice expects
      return {
        properties: response.data,
        hasMore: response.data.length > 0
      };
    } catch (error: any) {
      console.error('Error fetching properties:', error);
      console.error('Error stack:', error.stack);
      throw error;
    }
  },

  searchProperties: async (params: {
    location?: string;
    priceMin?: number;
    priceMax?: number;
    beds?: number;
    baths?: number;
    propertyType?: string;
  }) => {
    const response = await api.get('/properties', { params });
    // Transform the response to match what the Redux slice expects
    return {
      properties: response.data
    };
  },

  getMapProperties: async (bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }) => {
    const response = await api.get('/properties', { params: bounds });
    // Transform the response to match what the Redux slice expects
    return {
      properties: response.data
    };
  },

  getPropertyById: async (id: string) => {
    const response = await api.get(`/properties/${id}`);
    return response.data;
  },

  saveProperty: async (propertyId: string) => {
    const response = await api.post(`/properties/${propertyId}/save`);
    return response.data;
  },

  unsaveProperty: async (propertyId: string) => {
    const response = await api.delete(`/properties/${propertyId}/save`);
    return response.data;
  },

  rejectProperty: async (propertyId: string) => {
    const response = await api.post(`/properties/${propertyId}/reject`);
    return response.data;
  },

  unrejectProperty: async (propertyId: string) => {
    const response = await api.delete(`/properties/${propertyId}/reject`);
    return response.data;
  },
};

// User APIs
export const userApi = {
  getSavedProperties: async () => {
    const response = await api.get('/users/saved-properties');
    return response.data;
  },

  getRejectedProperties: async () => {
    const response = await api.get('/users/rejected-properties');
    return response.data;
  },

  updateProfile: async (data: {
    firstName?: string;
    lastName?: string;
    email?: string;
  }) => {
    const response = await api.put('/api/users/profile', data);
    return response.data;
  },
};

export default api;