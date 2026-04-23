import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { VehicleProvider } from '../context/VehicleContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <VehicleProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="selection" />
        <Stack.Screen name="details" />
        <Stack.Screen name="home" />
        <Stack.Screen name="map" />
        <Stack.Screen name="hub" />
        <Stack.Screen name="parking" />
        <Stack.Screen name="safety" />
        <Stack.Screen name="charging_start" />
        <Stack.Screen name="completed" />
        <Stack.Screen name="payment" />
        <Stack.Screen name="payment_success" />
        <Stack.Screen name="history" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="settings" />
      </Stack>
      <StatusBar style="auto" />
    </VehicleProvider>
  );
}
