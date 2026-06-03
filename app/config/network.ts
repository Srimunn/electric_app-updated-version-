// app/config/network.ts
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { NetworkInfo } from 'react-native-network-info';

// Debug log for URL resolution

function normalize(raw?: string | null) {
  if (!raw) return null;
  const s = raw.trim();
  return s.replace(/\/$/, '');
}

// Priority: EXPO_PUBLIC_API_URL env -> Expo debugger host IP -> web host
const explicit = normalize(
  process.env.EXPO_PUBLIC_API_URL ||
    Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL ||
    Constants.manifest?.extra?.EXPO_PUBLIC_API_URL
);

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

let DEFAULT_HOST = explicit || deriveIp || WEB_HOST || null;

if (!DEFAULT_HOST) {
  // No API host could be resolved. Throwing error to surface issue during development.
  console.error('❌ No API host detected. Please set EXPO_PUBLIC_API_URL environment variable or ensure debugger host is available.');
  // Optionally, you could set a placeholder to avoid crashes in production, but it's better to fix the configuration.
  DEFAULT_HOST = '';
}

// Export mutable variables so they can be updated after async IP detection
export let API_BASE_URL = `${DEFAULT_HOST.replace(/\/$/, '')}/api`;
export let SOCKET_BASE_URL = DEFAULT_HOST.replace(/\/$/, ''); // Socket.io connects to root, NOT /api
export let IMAGE_BASE_URL = `${DEFAULT_HOST.replace(/\/$/, '')}/uploads`; // Images are served from /uploads, NOT /api/uploads

if (Platform.OS !== 'web') {
  // Attempt to replace with dynamic LAN IP (for physical devices) when possible
  NetworkInfo.getIPV4Address()
    .then((ip) => {
      if (ip) {
        const dynamicHost = `http://${ip}:5000`;
        console.log('🔄 Dynamic LAN IP detected:', dynamicHost);
        API_BASE_URL = `${dynamicHost}/api`;
        SOCKET_BASE_URL = dynamicHost;
        IMAGE_BASE_URL = `${dynamicHost}/uploads`;
        console.log('🔎 Updated API_BASE_URL:', API_BASE_URL);
        console.log('🔎 Updated SOCKET_BASE_URL:', SOCKET_BASE_URL);
        console.log('🔎 Updated IMAGE_BASE_URL:', IMAGE_BASE_URL);
      }
    })
    .catch((e) => {
      // Silently log instead of warning to avoid clutter in Expo Go/Web where native module may be missing
      console.log('Failed to obtain dynamic LAN IP:', e.message);
    });
}

// Debug logs for resolved URLs (may update after async detection)
console.log('🔎 Resolved API_BASE_URL', API_BASE_URL);
console.log('🔎 Resolved SOCKET_BASE_URL', SOCKET_BASE_URL);
console.log('🔎 Resolved IMAGE_BASE_URL', IMAGE_BASE_URL);

export default {
  API_BASE_URL,
  SOCKET_BASE_URL,
  IMAGE_BASE_URL,
};
