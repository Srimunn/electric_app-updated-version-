import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState, useEffect } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View, Platform, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { startSession, getImageUrl } from './services/api';
import { useRealtime } from '../context/RealtimeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const AMENITIES = [
  { id: '1', name: 'Free Parking', icon: 'alpha-p-box', color: '#0D7FF2' },
  { id: '2', name: 'Café Nearby', icon: 'coffee', color: '#78350F' },
  { id: '3', name: 'Restrooms', icon: 'human-male-female', color: '#0369A1' },
  { id: '4', name: 'Free WiFi', icon: 'wifi', color: '#475569' },
  { id: '5', name: 'Shopping', icon: 'shopping', color: '#DB2777' },
];

export default function HubScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    stationId?: string;
    stationName?: string;
    location?: string;
    powerOutput?: string;
    basePricePerKwh?: string;
    available?: string;
    total?: string;
    image?: string;
    connectorType?: string;
    status?: string;
  }>();

  const { stationsStatus } = useRealtime();
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const stationId = params.stationId as string;
  const currentStatus = stationsStatus[stationId] || params.status || 'offline';
  const isOnline = currentStatus.toLowerCase() === 'online' || currentStatus.toLowerCase() === 'available';

  const SLOTS = useMemo(() => {
    const total = Number(params.total) || 4;
    return Array.from({ length: total }, (_, i) => ({
      id: i + 1,
      available: isOnline && i === 0 // Mocking first slot available if station is online
    }));
  }, [params.total, isOnline]);

  const handleStartCharging = async () => {
    if (!isOnline) {
      Alert.alert('Station Offline', 'This station is currently offline or busy.');
      return;
    }

    setIsStarting(true);
    try {
      const response = await startSession(stationId);
      // Backend returns the session object directly (not wrapped in response.session)
      const sessionId = response._id || response.session?._id;
      if (sessionId) {
        await AsyncStorage.setItem('activeSessionId', sessionId);
        await AsyncStorage.setItem('activeStationId', stationId);
        router.push({
          pathname: '/charging_start',
          params: {
            sessionId: sessionId,
            stationId: stationId,
            stationName: params.stationName,
          }
        });
      } else {
        Alert.alert('Error', 'Session was created but could not navigate. Please check your active sessions.');
      }
    } catch (err: any) {
      console.error('Failed to start session:', err);
      Alert.alert('Error', err.response?.data?.message || 'Failed to start charging session.');
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.topCurvedBg} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#1E293B" />
            </TouchableOpacity>
            <View style={[styles.availableBadge, { backgroundColor: isOnline ? '#0D7FF2' : '#EF4444' }]}>
              <Text style={styles.availableBadgeText}>{currentStatus.toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>{params.stationName || 'Charging Hub'}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={18} color="#475569" />
              <Text style={styles.locationText}>{params.location || 'Location details not available'}</Text>
            </View>
            <View style={styles.ratingRow}>
              <Text style={styles.ratingValue}>4.8</Text>
              <Text style={styles.ratingInfo}>(234 reviews)</Text>
            </View>
          </View>

          <View style={styles.imageSection}>
             <Image 
                source={{ uri: getImageUrl(params.image as string) || 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=400' }} 
                style={styles.stationImage}
                resizeMode="cover"
             />
          </View>

          <View style={styles.metricsGrid}>
            <View style={[styles.metricCard, styles.metricCardBlue]}>
              <View style={styles.metricHeader}>
                <MaterialCommunityIcons name="lightning-bolt" size={22} color="#0D7FF2" />
                <Text style={[styles.metricLabel, { color: '#0D7FF2' }]}>POWER</Text>
              </View>
              <Text style={styles.metricValue}>{params.powerOutput ? `${params.powerOutput} kW` : '--'}</Text>
              <Text style={styles.metricSub}>Fast Charging</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <MaterialCommunityIcons name="currency-inr" size={20} color="#64748B" />
                <Text style={styles.metricLabel}>COST</Text>
              </View>
              <Text style={styles.metricValue}>{params.basePricePerKwh ? `₹${params.basePricePerKwh}` : '--'}</Text>
              <Text style={styles.metricSub}>per kWh</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Ionicons name="time-outline" size={20} color="#64748B" />
                <Text style={styles.metricLabel}>CONNECTOR</Text>
              </View>
              <Text style={styles.metricValue}>{params.connectorType || 'Type 2'}</Text>
              <Text style={styles.metricSub}>Universal</Text>
            </View>

            <View style={[styles.metricCard, styles.metricCardBlue]}>
              <View style={styles.metricHeader}>
                <Ionicons name="navigate-outline" size={20} color="#0D7FF2" />
                <Text style={[styles.metricLabel, { color: '#0D7FF2' }]}>SLOTS</Text>
              </View>
              <Text style={styles.metricValue}>{params.available || '0'}/{params.total || '0'}</Text>
              <Text style={styles.metricSub}>Available Now</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Select Charging Slot</Text>
          <View style={styles.slotsGrid}>
            {SLOTS.map((slot) => (
              <TouchableOpacity 
                key={slot.id} 
                onPress={() => slot.available && setSelectedSlot(slot.id)}
                activeOpacity={slot.available ? 0.7 : 1}
                style={[
                  styles.slotCard, 
                  !slot.available && styles.slotOccupied,
                  selectedSlot === slot.id && styles.slotSelected
                ]}
              >
                {selectedSlot === slot.id && (
                  <View style={styles.checkMarker}>
                    <MaterialCommunityIcons name="check-circle" size={20} color="#FFFFFF" />
                  </View>
                )}
                <MaterialCommunityIcons 
                  name="lightning-bolt" 
                  size={22} 
                  color={slot.available ? (selectedSlot === slot.id ? "#FFFFFF" : "#0D7FF2") : "#94A3B8"} 
                />
                <Text style={[
                  styles.slotNumber,
                  !slot.available && styles.slotNumberOccupied,
                  slot.available && { color: selectedSlot === slot.id ? "#FFFFFF" : "#1E293B" }
                ]}>{slot.id}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Amenities</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.amenitiesContainer}>
            {AMENITIES.map((item) => (
              <View key={item.id} style={styles.amenityChip}>
                <MaterialCommunityIcons name={item.icon as any} size={18} color={item.color} style={{ marginRight: 6 }} />
                <Text style={styles.amenityText}>{item.name}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={{ height: 140 }} />
        </ScrollView>
      </SafeAreaView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.startActionBtn, (!isOnline || isStarting) && styles.startBtnDisabled]} 
          onPress={handleStartCharging}
          disabled={!isOnline || isStarting}
        >
          {isStarting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <MaterialCommunityIcons name="flash" size={22} color="#FFFFFF" style={{ marginRight: 10 }} />
              <Text style={styles.startActionText}>Start Charging Now</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topCurvedBg: {
    position: 'absolute',
    top: 0,
    width: width,
    height: 220,
    backgroundColor: '#DADBDF',
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  availableBadge: {
    backgroundColor: '#0D7FF2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  availableBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  titleSection: {
    marginBottom: 15,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  locationText: {
    fontSize: 15,
    color: '#475569',
    fontWeight: '600',
    marginLeft: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
    marginRight: 6,
  },
  ratingInfo: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
  },
  imageSection: {
    width: '100%',
    height: 200,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  stationImage: {
    width: '100%',
    height: '100%',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  metricCard: {
    width: (width - 58) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  metricCardBlue: {
    backgroundColor: '#EFF6FF',
    borderColor: '#DBEAFE',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  metricSub: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 15,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  slotCard: {
    width: (width - 78) / 4,
    height: 75,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#F1F5F9',
  },
  slotSelected: {
    backgroundColor: '#0D7FF2',
    borderColor: '#0D7FF2',
  },
  checkMarker: {
    position: 'absolute',
    top: 4,
    right: 4,
    zIndex: 10,
  },
  slotOccupied: {
    backgroundColor: '#F1F5F9',
    borderColor: '#F1F5F9',
  },
  slotNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 2,
  },
  slotNumberOccupied: {
    color: '#94A3B8',
  },
  amenitiesContainer: {
    flexDirection: 'row',
    paddingBottom: 10,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    marginRight: 10,
  },
  amenityText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    width: width,
    alignItems: 'center',
    paddingHorizontal: 22,
  },
  startActionBtn: {
    width: '100%',
    height: 64,
    backgroundColor: '#0D7FF2',
    borderRadius: 22,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#0D7FF2',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  startBtnDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
  },
  startActionText: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
