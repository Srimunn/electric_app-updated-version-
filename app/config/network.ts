// app/config/network.ts
import { Platform } from 'react-native';
import Constants from 'expo-constants';

function normalize(raw?: string | null) {
  if (!raw) return null;
  const s = raw.trim();
  return s.replace(/\/$/, '');
}

// 1. Check explicit EXPO_PUBLIC_API_URL (production or explicit dev overrides)
const explicit = normalize(
  process.env.EXPO_PUBLIC_API_URL ||
    Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL
);

// 2. Discover dynamically from developer machine IP (Expo bundler host)
const getDynamicDevHost = () => {
  // Expo serves manifest containing hostUri (e.g. "192.168.1.15:8081" or "10.0.0.5:8081")
  const hostUri = Constants.expoConfig?.hostUri || '';
  if (!hostUri) return null;
  
  const ip = hostUri.split(':')[0];
  if (!ip) return null;
  
  if (ip === 'localhost' || ip === '127.0.0.1') {
    return Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';
  }
  
  return `http://${ip}:5000`;
};

const resolvedHost = explicit || getDynamicDevHost() || 'http://localhost:5000';

console.log('📡 [Server Discovery] Resolved server host base:', resolvedHost);

export const API_BASE_URL = `${resolvedHost}/api`;
export const SOCKET_BASE_URL = resolvedHost;
export const IMAGE_BASE_URL = `${resolvedHost}/uploads`;

export default {
  API_BASE_URL,
  SOCKET_BASE_URL,
  IMAGE_BASE_URL,
};
