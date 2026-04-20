import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import { Dimensions, Keyboard, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

/**
 * BRAND COLORS:
 * Grey: #DADBDF
 * Blue: #0D7FF2
 * Black/White
 */

// Simulation data for search - 50+ Places in Tamil Nadu
const SAMPLE_LOCATIONS = {
  'chennai': { latitude: 13.0827, longitude: 80.2707 },
  'coimbatore': { latitude: 11.0168, longitude: 76.9558 },
  'madurai': { latitude: 9.9252, longitude: 78.1198 },
  'tiruchirappalli': { latitude: 10.7905, longitude: 78.7047 },
  'salem': { latitude: 11.6643, longitude: 78.1460 },
  'erode': { latitude: 11.3410, longitude: 77.7172 },
  'tirunelveli': { latitude: 8.7139, longitude: 77.7567 },
  'vellore': { latitude: 12.9165, longitude: 79.1325 },
  'thoothukudi': { latitude: 8.7642, longitude: 78.1348 },
  'thanjavur': { latitude: 10.7905, longitude: 79.1378 },  
  'hosur': { latitude: 12.7409, longitude: 77.8257 },
  'kanyakumari': { latitude: 8.0883, longitude: 77.5385 },
  'nagercoil': { latitude: 8.1833, longitude: 77.4119 },
  'kancheepuram': { latitude: 12.8342, longitude: 79.7036 },
  'tiruppur': { latitude: 11.1085, longitude: 77.3411 },
  'karur': { latitude: 10.9601, longitude: 78.0766 },
  'cuddalore': { latitude: 11.7447, longitude: 79.7680 },
  'kumbakonam': { latitude: 10.9602, longitude: 79.3845 },
  'tiruvannamalai': { latitude: 12.2257, longitude: 79.0747 },
  'pollachi': { latitude: 10.6583, longitude: 77.0083 },
  'rajapalayam': { latitude: 9.4500, longitude: 77.5500 },
  'pudukkottai': { latitude: 10.3833, longitude: 78.8167 },
  'vaniyambadi': { latitude: 12.6833, longitude: 78.6167 },
  'ambur': { latitude: 12.7833, longitude: 78.7167 },
  'nagapattinam': { latitude: 10.7667, longitude: 79.8333 },
  'neyveli': { latitude: 11.6000, longitude: 79.4833 },
  'karaikudi': { latitude: 10.0667, longitude: 78.7833 },
  'kumarapalayam': { latitude: 11.4500, longitude: 77.7333 },
  'theni': { latitude: 10.0100, longitude: 77.4800 },
  'dindigul': { latitude: 10.3667, longitude: 77.9667 },
  'dharmapuri': { latitude: 12.1333, longitude: 78.1583 },
  'krishnagiri': { latitude: 12.5186, longitude: 78.2137 },
  'namakkal': { latitude: 11.2189, longitude: 78.1672 },
  'perambalur': { latitude: 11.2333, longitude: 78.8833 },
  'ariyalur': { latitude: 11.1333, longitude: 79.0667 },
  'tiruvarur': { latitude: 10.7667, longitude: 79.6333 },
  'mayiladuthurai': { latitude: 11.1000, longitude: 79.6500 },
  'ranipet': { latitude: 12.9275, longitude: 79.3328 },
  'tirupathur': { latitude: 12.4925, longitude: 78.5678 },
  'tenkasi': { latitude: 8.9594, longitude: 77.3139 },
  'sivakasi': { latitude: 9.4500, longitude: 77.8000 },
  'sivagangai': { latitude: 9.8500, longitude: 78.4833 },
  'komarapalayam': { latitude: 11.4363, longitude: 77.7232 },
  'amanpuram': { latitude: 13.1000, longitude: 80.2000 },
  'avadi': { latitude: 13.1167, longitude: 80.1000 },
  'tambaram': { latitude: 12.9249, longitude: 80.1277 },
  'pallavaram': { latitude: 12.9675, longitude: 80.1491 },
  'poonamallee': { latitude: 13.0475, longitude: 80.0944 },
  'tiruvallur': { latitude: 13.1333, longitude: 79.9167 },
  'chengalpattu': { latitude: 12.7000, longitude: 79.9833 },
  'kallakurichi': { latitude: 11.7333, longitude: 78.9667 },
  'viluppuram': { latitude: 11.9401, longitude: 79.4861 },
  'virudhunagar': { latitude: 9.5841, longitude: 77.9511 },
  'ooty': { latitude: 11.4064, longitude: 76.6932 },
  'kodaikanal': { latitude: 10.2381, longitude: 77.4892 },
  'yelagiri': { latitude: 12.5768, longitude: 78.6385 },
  'ootacamund': { latitude: 11.4064, longitude: 76.6932 },  
} as any;

// Automatically generate 2 spots per location
const GENERATED_STATIONS = Object.keys(SAMPLE_LOCATIONS).flatMap((city, index) => {
  const loc = SAMPLE_LOCATIONS[city];
  return [
    {
      id: `spot-a-${index}`,
      name: `${city.charAt(0).toUpperCase() + city.slice(1)} EV Hub A`,
      latitude: loc.latitude + 0.005,
      longitude: loc.longitude + 0.005,
      available: Math.floor(Math.random() * 10),
      total: 10,
      type: 'Supercharger'
    },
    {
      id: `spot-b-${index}`,
      name: `${city.charAt(0).toUpperCase() + city.slice(1)} Power Station B`,
      latitude: loc.latitude - 0.005,
      longitude: loc.longitude - 0.005,
      available: Math.floor(Math.random() * 5),
      total: 5,
      type: 'Fast'
    }
  ];
});

const CHARGING_STATIONS = [
  { id: '1', name: 'Downtown Charging Hub', latitude: 13.0827, longitude: 80.2707, available: 8, total: 10, type: 'Supercharger' },
  { id: '2', name: 'West Side EV Point', latitude: 13.0750, longitude: 80.2500, available: 3, total: 5, type: 'Fast' },
  ...GENERATED_STATIONS
];

const FILTERS = ['Available'];

export default function MapScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const { vehicleName } = useLocalSearchParams();
  const [selectedFilter, setSelectedFilter] = useState('Available');
  const [isLiked, setIsLiked] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Initial region
  const initialRegion = {
    latitude: 13.0827,
    longitude: 80.2707,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const handleSearch = () => {
    Keyboard.dismiss();
    const query = searchQuery.toLowerCase().trim();
    if (SAMPLE_LOCATIONS[query]) {
      mapRef.current?.animateToRegion({
        ...SAMPLE_LOCATIONS[query],
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 1000);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Real Map Integration */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        provider={PROVIDER_GOOGLE}
      >
        {CHARGING_STATIONS.map((station) => (
          <Marker
            key={station.id}
            coordinate={{ latitude: station.latitude, longitude: station.longitude }}
            title={station.name}
          >
            <View style={[station.available === 0 && styles.markerInactive]}>
              <Ionicons name="location-outline" size={20} color="#000000" />
              <View/>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Floating Header UI */}
      <SafeAreaView style={styles.floatingHeader}>
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#94A3B8" />
            <TextInput 
              style={styles.searchInput}
              placeholder="Search charging stations..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
          </View>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          {FILTERS.map((filter) => (
            <TouchableOpacity 
              key={filter}
              style={[
                styles.filterChip,
                selectedFilter === filter && styles.activeFilterChip
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Ionicons 
                name="checkmark-circle" 
                size={16} 
                color={selectedFilter === filter ? '#FFFFFF' : '#0D7FF2'} 
                style={{ marginRight: 6 }}
              />
              <Text style={[
                styles.filterText,
                selectedFilter === filter && styles.activeFilterText
              ]}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>

      {/* Dynamic Bottom Card */}
      <View style={styles.bottomCardWrapper}>
        <View style={styles.bottomCard}>
          <View style={styles.cardHeader}>
            <View style={styles.badgeRow}>
              <View style={styles.superchargerBadge}>
                <Text style={styles.superchargerText}>SUPERCHARGER</Text>
              </View>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text style={styles.ratingText}>4.9</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setIsLiked(!isLiked)}>
              <Ionicons 
                name={isLiked ? "heart" : "heart-outline"} 
                size={24} 
                color={isLiked ? "#EF4444" : "#94A3B8"} 
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.carTitle}>{vehicleName || 'Tata Nexon EV'}</Text>
          <View style={styles.locationInfo}>
            <Ionicons name="location" size={14} color="#94A3B8" />
            <Text style={styles.locationText}>1.2 km away • 8/10 available</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.specRow}>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>PRICE</Text>
              <Text style={styles.specValue}>28.75/kWh</Text>
            </View>
            <View style={styles.verticalDivider} />
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>SPEED</Text>
              <Text style={styles.specValue}>250 kW</Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={styles.navigateBtn}
              onPress={() => router.push({ pathname: '/hub', params: { stationName: 'Charging Hub' } })}
            >
              <Ionicons name="navigate" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.navigateText}>Navigate</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.infoBtn}>
              <Ionicons name="information-circle-outline" size={24} color="#1E293B" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.replace('/home')}>
          <Ionicons name="home-outline" size={24} color="#94A3B8" />
          <Text style={styles.tabLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="location" size={24} color="#0D7FF2" />
          <Text style={[styles.tabLabel, { color: '#0D7FF2' }]}>Map</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="time-outline" size={24} color="#94A3B8" />
          <Text style={styles.tabLabel}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="person-outline" size={24} color="#94A3B8" />
          <Text style={styles.tabLabel}>Profile</Text>
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
  map: {
    width: width,
    height: height,
  },
  markerInactive: {
    backgroundColor: '#E2E8F0',
    borderColor: '#F8FAFC',
  },
  floatingHeader: {
    position: 'absolute',
    top: 50,
    width: width,
    zIndex: 10,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  searchBar: {
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#1E293B',
  },
  filterScroll: {
    paddingLeft: 20,
  },
  filterContent: {
    paddingRight: 40,
  },
  filterChip: {
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginRight: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activeFilterChip: {
    backgroundColor: '#0D7FF2',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0D7FF2',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  bottomCardWrapper: {
    position: 'absolute',
    bottom: 105,
    width: width,
    alignItems: 'center',
  },
  bottomCard: {
    width: width * 0.92,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 30,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  superchargerBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginRight: 10,
  },
  superchargerText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0D7FF2',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F59E0B',
    marginLeft: 4,
  },
  carTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 6,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 6,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 18,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  specItem: {
    flex: 1,
  },
  specLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 6,
  },
  specValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  verticalDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 15,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 25,
  },
  navigateBtn: {
    flex: 1,
    height: 60,
    backgroundColor: '#0D7FF2',
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#0D7FF2',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  navigateText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  infoBtn: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    width: width,
    height: 85,
    backgroundColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  tabItem: {
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 5,
  },
});
