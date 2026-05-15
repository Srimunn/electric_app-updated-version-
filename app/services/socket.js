import { io } from 'socket.io-client';
import { SERVER_URL } from './api';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Set();
  }

  connect() {
    if (this.socket) return;

    console.log(`🔌 Connecting to Socket.io at: ${SERVER_URL}`);
    this.socket = io(SERVER_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket.io Connected');
      this.notifyListeners('connection_change', true);
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Socket.io Disconnected');
      this.notifyListeners('connection_change', false);
    });

    this.socket.on('error', (error) => {
      console.error('❌ Socket.io Error:', error);
    });

    // Global updates
    this.socket.on('station_update', (data) => {
      this.notifyListeners('station_update', data);
    });

    this.socket.on('live_updates', (data) => {
      this.notifyListeners('live_updates', data);
    });

    this.socket.on('new_alert', (data) => {
      this.notifyListeners('alert', data);
    });
  }

  joinStation(stationId) {
    if (!this.socket) return;
    this.socket.emit('join_station', stationId);
    console.log(`👥 Joined station room: ${stationId}`);

    // Listen for live data for this specific station
    this.socket.on('live_data', (data) => {
      if (data.stationId === stationId) {
        this.notifyListeners(`live_data:${stationId}`, data);
      }
    });
  }

  leaveStation(stationId) {
    if (!this.socket) return;
    this.socket.emit('leave_station', stationId);
    this.socket.off('live_data');
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
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

const socketService = new SocketService();
export default socketService;
