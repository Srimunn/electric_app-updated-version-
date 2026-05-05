import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Dimensions, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

/**
 * BRAND COLORS:
 * Grey: #DADBDF
 * Blue: #0D7FF2
 * Black/White
 */

const AMENITIES = [
  { id: '1', name: 'Free Parking', icon: 'alpha-p-box', color: '#0D7FF2' },
  { id: '2', name: 'Café Nearby', icon: 'coffee', color: '#78350F' },
  { id: '3', name: 'Restrooms', icon: 'human-male-female', color: '#0369A1' },
  { id: '4', name: 'Free WiFi', icon: 'wifi', color: '#475569' },
  { id: '5', name: 'Shopping', icon: 'shopping', color: '#DB2777' },
];

const SLOTS = [
  { id: 1, available: true },
  { id: 2, available: true },
  { id: 3, available: false },
  { id: 4, available: true },
  { id: 5, available: true },
  { id: 6, available: false },
  { id: 7, available: true },
  { id: 8, available: true },
];

export default function HubScreen() {
  const router = useRouter();
  const { stationName } = useLocalSearchParams();

  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Top Background Pattern aligned with Home */}
      <View style={styles.topCurvedBg} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Header Overlay */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#1E293B" />
            </TouchableOpacity>
            <View style={styles.availableBadge}>
              <Text style={styles.availableBadgeText}>AVAILABLE</Text>
            </View>
          </View>

          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>{stationName || 'Charging Hub'}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={18} color="#475569" />
              <Text style={styles.locationText}>T Nagar, Chennai</Text>
            </View>
            <View style={styles.ratingRow}>
              <Text style={styles.ratingValue}>4.8</Text>
              <Text style={styles.ratingInfo}>(234 reviews)</Text>
            </View>
          </View>

          {/* Metrics Cards Grid */}
          <View style={styles.metricsGrid}>
            <View style={[styles.metricCard, styles.metricCardBlue]}>
              <View style={styles.metricHeader}>
                <MaterialCommunityIcons name="lightning-bolt" size={22} color="#000000" />
                <Text style={[styles.metricLabel, { color: '#000000' }]}>POWER</Text>
              </View>
              <Text style={styles.metricValue}>150 kW</Text>
              <Text style={styles.metricSub}>Fast Charging</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <MaterialCommunityIcons name="currency-inr" size={20} color="#64748B" />
                <Text style={styles.metricLabel}>COST</Text>
              </View>
              <Text style={styles.metricValue}>₹35</Text>
              <Text style={styles.metricSub}>per kWh</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Ionicons name="time-outline" size={20} color="#64748B" />
                <Text style={styles.metricLabel}>EST. TIME</Text>
              </View>
              <Text style={styles.metricValue}>~25</Text>
              <Text style={styles.metricSub}>minutes</Text>
            </View>

            <View style={[styles.metricCard, styles.metricCardBlue]}>
              <View style={styles.metricHeader}>
                <Ionicons name="navigate-outline" size={20} color="#0D7FF2" />
                <Text style={[styles.metricLabel, { color: '#0D7FF2' }]}>DISTANCE</Text>
              </View>
              <Text style={styles.metricValue}>1.2</Text>
              <Text style={styles.metricSub}>km away</Text>
            </View>
          </View>

          {/* Charging Slots Grid */}
          <Text style={styles.sectionTitle}>Available Charging Slots</Text>
          
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
                color={slot.available ? (selectedSlot === slot.id ? "#FFFFFF" : "#000000") : "#94A3B8"} 
              />
              <Text style={[
                styles.slotNumber,
                !slot.available && styles.slotNumberOccupied,
                slot.available && { color: selectedSlot === slot.id ? "#FFFFFF" : "#000000" }
              ]}>{slot.id}</Text>
            </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.slotsCount}>6 slots available now</Text>

          {/* Amenities */}
          <Text style={styles.sectionTitle}>Amenities</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.amenitiesContainer}
          >
            {AMENITIES.map((item) => (
              <View key={item.id} style={styles.amenityChip}>
                <MaterialCommunityIcons name={item.icon as any} size={18} color={item.color} style={{ marginRight: 6 }} />
                <Text style={styles.amenityText}>{item.name}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Operating Hours */}
          <Text style={styles.sectionTitle}>Operating Hours</Text>
          <View style={styles.hoursCard}>
            <View style={styles.statusDot} />
            <Text style={styles.hoursText}>Open 24/7</Text>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>

      {/* Floating Action Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.navigateActionBtn} onPress={() => router.push('/parking')}>
          <Ionicons name="navigate" size={22} color="#FFFFFF" style={{ marginRight: 10 }} />
          <Text style={styles.navigateActionText}>Navigate to Station</Text>
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
    backgroundColor: '#dadbdf',
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
    marginBottom: 8,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 16,
    color: '#475569',
    fontWeight: '600',
    marginLeft:8,
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
    fontSize: 22,
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
    marginBottom: 10,
  },
  slotCard: {
    width: (width - 78) / 4,
    height: 75,
    backgroundColor: '#0D7FF2',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  slotSelected: {
    backgroundColor: '#0D7FF2',
    transform: [{ scale: 1.05 }],
  },
  checkMarker: {
    position: 'absolute',
    top: 5,
    right: 5,
    zIndex: 10,
  },
  slotOccupied: {
    backgroundColor: '#E2E8F0',
  },
  slotNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  slotNumberOccupied: {
    color: '#94A3B8',
  },
  slotsCount: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '700',
    marginBottom: 30,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    marginBottom: 30,
    paddingRight: 40,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 10,
    marginBottom: 10,
  },
  amenityText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  hoursCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0D7FF2',
    marginRight: 12,
  },
  hoursText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    width: width,
    alignItems: 'center',
    paddingHorizontal: 22,
  },
  navigateActionBtn: {
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
  navigateActionText: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
