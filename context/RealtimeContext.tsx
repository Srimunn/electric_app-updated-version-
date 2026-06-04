import React, { createContext, useContext, useEffect, useState } from 'react';
import { API_BASE_URL } from '../app/config/network';
import socketService from '../app/services/socket';

interface RealtimeContextType {
  isConnected: boolean | null;
  hasConnected: boolean;
  lastUpdate: any;
  stationsStatus: Record<string, string>;
  subscribe: (callback: (event: string, data: any) => void) => () => void;
  joinStation: (id: string) => void;
  leaveStation: (id: string) => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [hasConnected, setHasConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<any>(null);
  const [stationsStatus, setStationsStatus] = useState<Record<string, string>>({});

  useEffect(() => {
    let mounted = true;

    const checkHealthAndConnect = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/health`, { method: 'GET' });
        if (!mounted) return;
        if (res.ok) {
          const json = await res.json();
          if (json?.status === 'ok') {
            socketService.connect();
            return;
          }
        }
        // if health check failed, surface disconnected state
        socketService.notifyListeners && socketService.notifyListeners('connection_change', false);
      } catch (e) {
        console.warn('Backend health check failed', e);
        socketService.notifyListeners && socketService.notifyListeners('connection_change', false);
      }
    };

    checkHealthAndConnect();

    const unsubscribe = socketService.subscribe((event: string, data: any) => {
      if (event === 'connection_change') {
        setIsConnected(data);
        if (data) {
          setHasConnected(true);
        }
      } else if (event === 'station_update') {
        setStationsStatus(prev => ({
          ...prev,
          [data.stationId]: data.status
        }));
      } else if (event === 'live_updates' || event === 'live_data' || event.startsWith('live_data:')) {
        setLastUpdate(data);
      } else if (event === 'transaction_update') {
        setLastUpdate(data);
      } else if (event === 'fault_alert' || event === 'alert') {
        // propagate alerts into lastUpdate so components can react
        setLastUpdate(data);
      } else if (event === 'ocpp_status') {
        // status changes from OCPP backend for station-level connection
        setStationsStatus(prev => ({
          ...prev,
          [data.stationId]: data.status
        }));
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
      socketService.disconnect();
    };
  }, []);

  return (
    <RealtimeContext.Provider value={{ 
      isConnected, 
      hasConnected,
      lastUpdate, 
      stationsStatus,
      subscribe: socketService.subscribe.bind(socketService),
      joinStation: socketService.joinStation.bind(socketService),
      leaveStation: socketService.leaveStation.bind(socketService)
    }}>
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (context === undefined) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};
