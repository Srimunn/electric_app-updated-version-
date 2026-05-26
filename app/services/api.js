import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';
import { API_BASE_URL, IMAGE_BASE_URL } from '../config/network';

// Use centralized API_BASE_URL from config/network.ts

export const BASE_API_URL = `${API_BASE_URL}/api`;

// Primary axios client (single centralized host)
const API_CLIENT = axios.create({
  baseURL: BASE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'bypass-tunnel-reminder': 'true',
  },
});

const isNetworkError = (error) => {
  return error?.message === 'Network Error' || (error?.isAxiosError && !error?.response);
};

const attachCommonInterceptors = (client) => {
  client.interceptors.request.use(
    async (config) => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token?.startsWith('demo-token')) {
          console.warn('Demo token detected. Clearing invalid demo token before fresh API request.');
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
    (error) => Promise.reject(error)
  );

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response && error.response.status === 401) {
        console.warn('Unauthorized access detected. Clearing token...');
        await AsyncStorage.removeItem('userToken');
        if (router) {
          router.replace('/login');
        }
      }
      console.error(`API Error [${originalRequest?.url}]:`, error.message);
      return Promise.reject(error);
    }
  );
};

attachCommonInterceptors(API_CLIENT);

// NOTE: Mock fallbacks removed. The app will use the real backend only.
// If the backend is unreachable, APIs will throw so the calling UI can surface errors.

const getStoredUserProfile = async () => {
  try {
    const stored = await AsyncStorage.getItem('userData');
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    console.warn('Failed to parse stored user profile', e);
    return null;
  }
};

async function requestWithRetry(requestFn, retries = 1, delayMs = 600) {
  let lastErr = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await requestFn(API_CLIENT);
    } catch (err) {
      lastErr = err;
      if (!isNetworkError(err)) throw err;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, delayMs));
        delayMs *= 2; // exponential backoff
      }
    }
  }
  throw lastErr;
}

// Helper to get full image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  return `${IMAGE_BASE_URL}/${cleanPath}`;
};

/**
 * API SERVICE LAYER
 */

// Auth APIs
export const loginUser = async (email, password) => {
  const response = await requestWithRetry((client) => client.post('/auth/login', { email, password }), 2);
  if (response?.data?.token) {
    await AsyncStorage.setItem('userToken', response.data.token);
    await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const registerUser = async (name, email, password, mobile) => {
  const response = await requestWithRetry((client) => client.post('/auth/register', { name, email, password, mobile }), 2);
  return response.data;
};

export const verifyOTP = async (email, otp) => {
  const response = await requestWithRetry((client) => client.post('/auth/verify-otp', { email, otp }), 2);
  if (response.data?.token) {
    await AsyncStorage.setItem('userToken', response.data.token);
  }
  return response.data;
};

// Stations API
export const getStations = async () => {
  const response = await requestWithRetry((client) => client.get('/stations'), 2);
  return response.data;
};

export const searchStations = async (query) => {
  const response = await requestWithRetry((client) => client.get(`/stations/search?query=${encodeURIComponent(query)}`), 1);
  return response.data;
};

// Sessions API
export const startSession = async (stationId) => {
  const response = await requestWithRetry((client) => client.post('/sessions/start', { stationId }), 2);
  return response.data;
};

export const stopSession = async (sessionId) => {
  const response = await requestWithRetry((client) => client.post(`/sessions/stop/${sessionId}`), 1);
  return response.data;
};

// Pricing and station details
export const getPricing = async (stationId) => {
  const response = await requestWithRetry((client) => client.get(`/pricing/${encodeURIComponent(stationId)}`), 1);
  return response.data;
};

export const getStation = async (stationId) => {
  const response = await requestWithRetry((client) => client.get(`/stations/${encodeURIComponent(stationId)}`), 1);
  return response.data;
};

// User Profile
export const getUserProfile = async () => {
  const response = await requestWithRetry((client) => client.get('/users/profile'), 1);
  return response.data;
};
export default API_CLIENT;
