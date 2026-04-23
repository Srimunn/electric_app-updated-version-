import React, { createContext, useContext, useState, ReactNode } from 'react';

type VehicleContextType = {
  selectedVehicleName: string;
  setSelectedVehicleName: (name: string) => void;
  selectedVehicleImage: any;
  setSelectedVehicleImage: (image: any) => void;
};

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

export function VehicleProvider({ children }: { children: ReactNode }) {
  const [selectedVehicleName, setSelectedVehicleName] = useState('Tata Nexon EV');
  const [selectedVehicleImage, setSelectedVehicleImage] = useState(require('../assets/images/nexon.png'));

  return (
    <VehicleContext.Provider value={{
      selectedVehicleName, setSelectedVehicleName,
      selectedVehicleImage, setSelectedVehicleImage
    }}>
      {children}
    </VehicleContext.Provider>
  );
}

export function useVehicle() {
  const context = useContext(VehicleContext);
  if (context === undefined) {
    throw new Error('useVehicle must be used within a VehicleProvider');
  }
  return context;
}

