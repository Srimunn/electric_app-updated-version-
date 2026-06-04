// app/config/network.ts
import { Platform } from 'react-native';
import Constants from 'expo-constants';

function normalize(raw?: string | null) {
  if (!raw) return null;
  const s = raw.trim();
  return s.replace(/\/$/, '');
}

// Priority: EXPO_PUBLIC_API_URL env variable -> Expo config extras
const explicit = normalize(
  process.env.EXPO_PUBLIC_API_URL ||
    Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL ||
    Constants.manifest?.extra?.EXPO_PUBLIC_API_URL
);

// Fallback to explicit config. Do not use local/emulator fallback IPs.
let DEFAULT_HOST = explicit || '';

if (!DEFAULT_HOST) {
  console.error('❌ No API host detected. Please set EXPO_PUBLIC_API_URL environment variable.');
}

export const API_BASE_URL = `${DEFAULT_HOST.replace(/\/$/, '')}/api`;
export const SOCKET_BASE_URL = DEFAULT_HOST.replace(/\/$/, ''); // Socket.io connects to root, NOT /api
export const IMAGE_BASE_URL = `${DEFAULT_HOST.replace(/\/$/, '')}/uploads`; // Images are served from /uploads, NOT /api/uploads

// Debug logs for resolved URLs
console.log('🔎 Centralized API_BASE_URL:', API_BASE_URL);
console.log('🔎 Centralized SOCKET_BASE_URL:', SOCKET_BASE_URL);
console.log('🔎 Centralized IMAGE_BASE_URL:', IMAGE_BASE_URL);

export default {
  API_BASE_URL,
  SOCKET_BASE_URL,
  IMAGE_BASE_URL,
};
