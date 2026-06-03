import { io } from 'socket.io-client';
import { SOCKET_BASE_URL } from '../config/network';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Set();
    this.stationListeners = new Map(); // stationId -> handler
    this.globalHandlers = new Map();
    this.connected = false;
    // Use only the centralized socket base URL
    this.serverUrls = SOCKET_BASE_URL ? [SOCKET_BASE_URL] : [];
    this.currentUrlIndex = 0;
    this.isConnecting = false;
    this.allHostsExhausted = false; // Track if all fallback hosts have been tried
  }

  connect() {
    if (this.socket || this.isConnecting) return;
    this.currentUrlIndex = 0;
    this.allHostsExhausted = false; // Reset flag when retrying connection
    this.connectToUrl(this.serverUrls[this.currentUrlIndex]);
  }

  connectToUrl(url) {
    this.isConnecting = true;
    if (this.socket) {
      this.socket.off();
      this.socket.disconnect();
      this.socket = null;
    }

    console.log(`🔌 Connecting to Socket.io at: ${url}`);
    this.socket = io(url, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 8000,
      randomizationFactor: 0.3,
      timeout: 10000,
      auth: {},
    });

    this.socket.on('connect', () => {
      this.isConnecting = false;
      console.log(`✅ Socket.io Connected to ${url}`);
      this.connected = true;
      this.notifyListeners('connection_change', true);
    });

    this.socket.on('disconnect', () => {
      console.log(`🔌 Socket.io Disconnected from ${url}`);
      this.connected = false;
      this.notifyListeners('connection_change', false);
    });

    this.socket.on('connect_error', (error) => {
      console.error(`⚠️ Socket.io connect_error for ${url}:`, error?.message || error);
      // Allow socket.io automatic reconnection; if persistent, surface state via notifyListeners
      if (!this.connected) {
        this.notifyListeners('connection_change', false);
      }
    });

    this.socket.on('connect_timeout', () => {
      console.warn(`⚠️ Socket.io connect_timeout for ${url}`);
    });

    this.socket.on('error', (error) => {
      console.error('❌ Socket.io Error:', error);
    });

    // Global updates - attach named handlers and keep references for cleanup
    const globalEvents = ['station_update', 'live_updates', 'transaction_update', 'fault_alert', 'ocpp_status', 'new_alert'];
    globalEvents.forEach((evt) => {
      if (this.globalHandlers.has(evt)) return; // already registered
      const handler = (data) => {
        console.log(`📡 Socket Event [${evt}]: received data`);
        const name = evt === 'new_alert' ? 'alert' : evt;
        this.notifyListeners(name, data);
      };
      this.globalHandlers.set(evt, handler);
      this.socket.on(evt, handler);
    });
  }

  joinStation(stationId) {
    if (!this.socket) return;
    // Avoid double-joining
    if (this.stationListeners.has(stationId)) return;

    this.socket.emit('join_station', stationId);
    console.log(`👥 Joined station room: ${stationId}`);

    // Station-specific handler - only forward events for this station
    const handler = (data) => {
      if (!data) return;
      if (data.stationId && data.stationId !== stationId) return;
      console.log(`📡 Socket Event [live_data] for ${stationId}: received data`);
      this.notifyListeners('live_data', data);
      this.notifyListeners(`live_data:${stationId}`, data);
    };

    this.stationListeners.set(stationId, handler);
    this.socket.on('live_data', handler);
  }

  leaveStation(stationId) {
    if (!this.socket) return;
    this.socket.emit('leave_station', stationId);
    const handler = this.stationListeners.get(stationId);
    if (handler) {
      this.socket.off('live_data', handler);
      this.stationListeners.delete(stationId);
    }
    console.log(`🏃 Left station room: ${stationId}`);
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(event, data) {
    this.listeners.forEach((callback) => callback(event, data));
  }

  disconnect() {
    if (this.socket) {
      // cleanup station listeners
      this.stationListeners.forEach((handler, stationId) => {
        this.socket.off('live_data', handler);
      });
      this.stationListeners.clear();

      // cleanup global handlers
      this.globalHandlers.forEach((handler, evt) => {
        this.socket.off(evt, handler);
      });
      this.globalHandlers.clear();

      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }
}

const socketService = new SocketService();
export default socketService;
