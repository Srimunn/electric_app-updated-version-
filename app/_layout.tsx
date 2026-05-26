import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { StyleSheet, Text, View } from 'react-native';
import { RealtimeProvider, useRealtime } from '../context/RealtimeContext';
import { VehicleProvider } from '../context/VehicleContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    const initApp = async () => {
      try {
        const activeSession = await AsyncStorage.getItem('activeSessionId');
        const userToken = await AsyncStorage.getItem('userToken');

        if (activeSession) {
          setTimeout(() => {
            router.replace('/charging_start');
          }, 500);
        } else if (userToken) {
          setTimeout(() => {
            router.replace('/selection');
          }, 500);
        }
      } catch (err) {
        console.log('Error initializing app', err);
      } finally {
        // We hide splash screen after a short delay to ensure initial routes are ready
        setTimeout(() => {
          SplashScreen.hideAsync();
        }, 1000);
      }
    };

    initApp();
  }, [router]);

  return (
    <RealtimeProvider>
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
        <OfflineIndicator />
        <StatusBar style="auto" />
      </VehicleProvider>
    </RealtimeProvider>
  );
}

function OfflineIndicator() {
  const { isConnected, hasConnected } = useRealtime();
  if (!hasConnected || isConnected === true) return null;
  return (
    <View style={styles.offlineBanner}>
      <Text style={styles.offlineText}>Disconnected — trying to reconnect...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  offlineBanner: {
    position: 'absolute',
    top: 40,
    left: 12,
    right: 12,
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    zIndex: 9999,
    elevation: 20,
  },
  offlineText: {
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
  }
});
