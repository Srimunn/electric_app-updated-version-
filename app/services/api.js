import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

// Read the base URL from the .env file
export const SERVER_URL = process.env.EXPO_PUBLIC_API_URL 
  ? process.env.EXPO_PUBLIC_API_URL.replace('/api', '') 
  : 'http://10.239.227.1:5000';
const BASE_URL = `${SERVER_URL}/api`;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
    'bypass-tunnel-reminder': 'true',
  },
});

// Helper to get full image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  // Ensure we don't have double slashes
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${SERVER_URL}${cleanPath}`;
};

// Request interceptor to add the auth token to headers
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token === 'demo-token') {
        console.warn('Stale demo token detected. Clearing...');
        await AsyncStorage.removeItem('userToken');
        return config;
      }
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error('Error reading token from storage', e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - redirect to login
    if (error.response && error.response.status === 401) {
      console.warn('Unauthorized access detected. Clearing token...');
      await AsyncStorage.removeItem('userToken');
      if (router) {
        router.replace('/login');
      }
    }

    // Log errors for debugging
    console.error(`API Error [${originalRequest.url}]:`, error.message);
    
    return Promise.reject(error);
  }
);

/**
 * API SERVICE LAYER
 */

// Auth APIs
export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      await AsyncStorage.setItem('userToken', response.data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const registerUser = async (name, email, password, mobile) => {
  try {
    const response = await api.post('/auth/register', { name, email, password, mobile });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const verifyOTP = async (email, otp) => {
  try {
    const response = await api.post('/auth/verify-otp', { email, otp });
    if (response.data.token) {
      await AsyncStorage.setItem('userToken', response.data.token);
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Stations API
export const getStations = async () => {
  try {
    const response = await api.get('/stations');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch stations:', error);
    return []; // Return empty array to avoid breaking UI components
  }
};

export const searchStations = async (query) => {
  try {
    const response = await api.get(`/stations/search?query=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error('Search failed:', error);
    return [];
  }
};

// Sessions API
export const startSession = async (stationId) => {
  try {
    const response = await api.post('/sessions/start', { stationId });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const stopSession = async (sessionId) => {
  try {
    const response = await api.post(`/sessions/stop/${sessionId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// User Profile
export const getUserProfile = async () => {
  try {
    const response = await api.get('/users/profile');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api;
