// diagnose_network.js
// Run with: node diagnose_network.js
require('dotenv').config({ path: '.env' });
const fetch = require('node-fetch');

function normalize(raw) {
  if (!raw) return null;
  const s = raw.trim();
  return s.replace(/\/$/, '');
}

// Resolve API base URL similar to network.ts logic
const explicit = normalize(process.env.EXPO_PUBLIC_API_URL);
let DEFAULT_HOST = explicit || 'http://10.0.2.2:5000'; // emulator fallback
const API_BASE_URL = `${DEFAULT_HOST.replace(/\/$/, '')}/api`;
const SOCKET_BASE_URL = API_BASE_URL;
const IMAGE_BASE_URL = `${API_BASE_URL}/uploads`;

console.log('API_BASE_URL =', API_BASE_URL);
console.log('SOCKET_BASE_URL =', SOCKET_BASE_URL);
console.log('IMAGE_BASE_URL =', IMAGE_BASE_URL);

async function healthCheck() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    const data = await res.json();
    console.log('Health check status:', res.status, data);
  } catch (e) {
    console.error('Health check failed:', e.message);
  }
}

healthCheck();
