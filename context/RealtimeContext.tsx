import React, { createContext, useContext, useEffect, useState } from 'react';
import socketService from '../app/services/socket';

interface RealtimeContextType {
  isConnected: boolean;
  lastUpdate: any;
  stationsStatus: Record<string, string>;
  subscribe: (callback: (event: string, data: any) => void) => () => void;
  joinStation: (id: string) => void;
  leaveStation: (id: string) => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<any>(null);
  const [stationsStatus, setStationsStatus] = useState<Record<string, string>>({});

  useEffect(() => {
    socketService.connect();

    const unsubscribe = socketService.subscribe((event, data) => {
      if (event === 'connection_change') {
        setIsConnected(data);
      } else if (event === 'station_update') {
        setStationsStatus(prev => ({
          ...prev,
          [data.stationId]: data.status
        }));
      } else if (event === 'live_updates' || event.startsWith('live_data:')) {
        setLastUpdate(data);
      }
    });

    return () => {
      unsubscribe();
      socketService.disconnect();
    };
  }, []);

  return (
    <RealtimeContext.Provider value={{ 
      isConnected, 
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
