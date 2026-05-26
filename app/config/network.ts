import Constants from 'expo-constants';

function normalize(raw?: string | null) {
  if (!raw) return null;
  const s = raw.trim();
  return s.replace(/\/$/, '');
}

// Priority: EXPO_PUBLIC_API_URL env -> Expo debugger host IP -> web host
const explicit = normalize(process.env.EXPO_PUBLIC_API_URL || Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL || Constants.manifest?.extra?.EXPO_PUBLIC_API_URL);

let deriveIp: string | null = null;
const debuggerHost = (Constants.manifest as any)?.debuggerHost || (Constants.expoConfig as any)?.hostUri || null;
if (debuggerHost && typeof debuggerHost === 'string') {
  const ip = debuggerHost.split(':')[0];
  if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
    deriveIp = `http://${ip}:5000`;
  }
}

let WEB_HOST: string | null = null;
if (typeof window !== 'undefined' && window.location) {
  WEB_HOST = `${window.location.protocol}//${window.location.hostname}:5000`;
}

const DEFAULT_HOST = explicit || deriveIp || WEB_HOST || null;

if (!DEFAULT_HOST) {
  // As a last resort, keep localhost but require explicit EXPO_PUBLIC_API_URL in production/dev for real LAN
  console.warn('No explicit API host detected; falling back to http://localhost:5000. Set EXPO_PUBLIC_API_URL to your LAN url.');
}

export const API_BASE_URL = (DEFAULT_HOST || 'http://localhost:5000').replace(/\/$/, '');
export const SOCKET_BASE_URL = API_BASE_URL; // socket server shares same host/port
export const IMAGE_BASE_URL = `${API_BASE_URL}/uploads`;

export default {
  API_BASE_URL,
  SOCKET_BASE_URL,
  IMAGE_BASE_URL,
};
