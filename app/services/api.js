import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';
import { API_BASE_URL, IMAGE_BASE_URL } from '../config/network';

// Use centralized API_BASE_URL from config/network.ts

export const BASE_API_URL = API_BASE_URL;

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
  return error?.isNetworkError || error?.message?.includes('Network Connection Error') || error?.message === 'Network Error' || (error?.isAxiosError && !error?.response);
};

// Mock station data removed; real data will be fetched from backend

// getMockDataForUrl function removed; offline fallback disabled

const attachCommonInterceptors = (client) => {
  client.interceptors.request.use(
    async (config) => {
      try {
        console.log(`📤 OUTBOUND REQUEST: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
        const token = await AsyncStorage.getItem('userToken');
        if (token?.startsWith('demo-token')) {
          config.headers.Authorization = `Bearer ${token}`;
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
    (response) => {
      console.log(`✅ INBOUND RESPONSE: ${response.config.method?.toUpperCase()} ${response.config.baseURL}${response.config.url} [${response.status}]`);
      return response;
    },
    async (error) => {
      const originalRequest = error.config;
      let finalError = error;

      if (error.response) {
        const status = error.response.status;
        const backendMsg = error.response.data?.error || error.response.data?.message;
        console.error(`❌ INBOUND ERROR: ${originalRequest?.method?.toUpperCase()} ${originalRequest?.baseURL}${originalRequest?.url} [${status}]: ${backendMsg}`);

        if (status === 401) {
          console.warn('Unauthorized access detected. Clearing token...');
          await AsyncStorage.removeItem('userToken');
          if (router) {
            router.replace('/login');
          }
          finalError = new Error(backendMsg || 'Not authorized, please log in again.');
          finalError.status = 401;
        } else if (status === 400) {
          finalError = new Error(backendMsg || 'Validation error.');
          finalError.status = 400;
        } else {
          finalError = new Error(backendMsg || `Server error: ${status}`);
          finalError.status = status;
        }
      } else if (error.message === 'Network Error' || !error.response) {
        console.error(`❌ NETWORK ERROR: ${originalRequest?.method?.toUpperCase()} ${originalRequest?.baseURL}${originalRequest?.url}: Cannot reach server`);
        finalError = new Error('Network Connection Error: Cannot connect to the server. Please check your internet connection and verify that the backend is running.');
        finalError.isNetworkError = true;
      }

      console.error(`API Error [${originalRequest?.url}]:`, finalError.message);
      return Promise.reject(finalError);
    }
  );
};

attachCommonInterceptors(API_CLIENT);

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
  
  // Network errors are propagated; no offline fallback
  throw lastErr;
}

// Helper to get full image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http') || imagePath.startsWith('data:')) return imagePath;
  
  // Extract host by removing /uploads from trailing IMAGE_BASE_URL
  const host = (IMAGE_BASE_URL || '').replace(/\/uploads$/, '');
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  if (cleanPath.startsWith('/uploads')) {
    return `${host}${cleanPath}`;
  }
  return `${IMAGE_BASE_URL}${cleanPath}`;
};

/**
 * API SERVICE LAYER
 */

// Auth APIs
export const loginUser = async (email, password) => {
  const response = await requestWithRetry((client) => client.post('/auth/login', { email, password }), 2);
  if (response?.data?.token) {
    await AsyncStorage.setItem('userToken', response.data.token);
    const userData = {
      _id: response.data._id,
      name: response.data.name,
      email: response.data.email,
      mobile: response.data.mobile
    };
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
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
    const userData = {
      _id: response.data._id,
      name: response.data.name,
      email: response.data.email,
      mobile: response.data.mobile
    };
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
  }
  return response.data;
};

// Stations API
export const getStations = async () => {
  const response = await requestWithRetry((client) => client.get('/stations/public'), 2);
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
  // Backend returns pricing details as part of the station object
  const response = await requestWithRetry((client) => client.get(`/stations/public/${encodeURIComponent(stationId)}`), 1);
  return response.data;
};

export const getStation = async (stationId) => {
  const response = await requestWithRetry((client) => client.get(`/stations/public/${encodeURIComponent(stationId)}`), 1);
  return response.data;
};

// User Profile
export const getUserProfile = async () => {
  const response = await requestWithRetry((client) => client.get('/users/profile'), 1);
  return response.data;
};

// Customer History & Payments Scoped
export const getSessions = async () => {
  const response = await requestWithRetry((client) => client.get('/sessions?scope=user'), 2);
  return response.data;
};

export const getUserPayments = async () => {
  const response = await requestWithRetry((client) => client.get('/payments?scope=user'), 2);
  return response.data;
};
export default API_CLIENT;
