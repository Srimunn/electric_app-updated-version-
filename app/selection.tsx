import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { useVehicle } from '../context/VehicleContext';
import { ActivityIndicator, Dimensions, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SOCKET_BASE_URL } from './config/network';
import { usePushNotifications } from '../hooks/usePushNotifications';

const { width } = Dimensions.get('window');

/**
 * BRAND COLORS:
 * Grey: #DADBDF
 * Blue: #0D7FF2
 * Black/White
 */

// Fallback static data in case the fetch fails or API is not yet configured

const FALLBACK_VEHICLES = [
  { id: '1', name: 'Tata Nexon EV', variant: 'Empower+ Long Range', battery: '40.5 KWH', range: '465 KM', image: require('../assets/images/nexon.png')},
  { id: '2', name: 'Tata Punch EV', variant: 'Long Range', battery: '35 KWH', range: '421 KM', image: require('../assets/images/2 punch.png') },
  { id: '3', name: 'Tata Tiago EV', variant: 'XT LR', battery: '24 KWH', range: '315 KM', image: require('../assets/images/3 tiago.png')},
  { id: '4', name: 'Mahindra XUV400', variant: 'EL Pro', battery: '39.4 KWH', range: '390 KM', image: require('../assets/images/4_mahindra_xuv.png') },
  { id: '5', name: 'Mahindra BE 6', variant: 'Base', battery: '60 KWH', range: '450 KM', image: require('../assets/images/5 mahindra be .png') },
  { id: '6', name: 'Mahindra XEV 9e', variant: 'Top', battery: '70 KWH', range: '500 KM', image: require('../assets/images/6 Mahindra XEV 9e ev.png')},
  { id: '7', name: 'MG ZS EV', variant: 'Exclusive', battery: '50.3 KWH', range: '461 KM', image: require('../assets/images/7 MG ZS EV.png') },
  { id: '8', name: 'MG Comet EV', variant: 'Smart', battery: '17.3 KWH', range: '230 KM', image: require('../assets/images/8 MG Comet EV.png')},
  { id: '9', name: 'Hyundai Kona Electric', variant: 'Premium', battery: '39.2 KWH', range: '452 KM', image: require('../assets/images/9 Hyundai Kona Electric.png') },
  { id: '10', name: 'Hyundai IONIQ 5', variant: 'RWD', battery: '72.6 KWH', range: '631 KM', image: require('../assets/images/10 Hyundai IONIQ 5.png')},
];

export default function SelectionScreen() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState('1');
  const [searchQuery, setSearchQuery] = useState('');
  const { setSelectedVehicleName, setSelectedVehicleImage } = useVehicle();

  // Retrieve user ID and register FCM device token with the backend
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUserId = async () => {
      try {
        const stored = await AsyncStorage.getItem('userData');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?._id) {
            setUserId(parsed._id);
          }
        }
      } catch (err) {
        console.warn('Error reading userData from AsyncStorage:', err);
      }
    };
    getUserId();
  }, []);

  usePushNotifications(userId, SOCKET_BASE_URL);

  // Use the local static array directly to ensure exact 1:1 image mapping
  const vehicles = FALLBACK_VEHICLES;
  
  // Filter logic
  const filteredVehicles = vehicles.filter(v =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedVehicle = vehicles.find(v => v.id === selectedId) || vehicles[0];

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace('/login')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Your EV</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

            {/* Main Vehicle Hero */}
            <View style={styles.heroSection}>
              <View style={styles.imageWrapper}>
                <Image
                  source={selectedVehicle?.image}
                  style={styles.heroImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={styles.heroTitle}>{selectedVehicle?.name}</Text>
            </View>

            {/* Quick Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>BATTERY</Text>
                <Text style={styles.statValue}>{selectedVehicle?.battery}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>RANGE</Text>
                <Text style={styles.statValue}>{selectedVehicle?.range}</Text>
              </View>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <View style={styles.searchBar}>
                <Ionicons name="search" size={20} color="#94A3B8" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search vehicle model..."
                  placeholderTextColor="#94A3B8"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery !== '' && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={20} color="#94A3B8" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Available Vehicles Section */}
            <View style={styles.listSection}>
              <View style={styles.listHeader}>
                <Text style={styles.listTitle}>AVAILABLE VEHICLES</Text>
                <Text style={styles.listCount}>{filteredVehicles.length} Models Found</Text>
              </View>

              {filteredVehicles.length > 0 ? (
                filteredVehicles.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.vehicleCard,
                      selectedId === item.id && styles.selectedCard
                    ]}
                    onPress={() => setSelectedId(item.id)}
                  >
                    <Image source={item.image} style={styles.cardImage} />
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardName}>{item.name}</Text>
                      <Text style={styles.cardVariant}>{item.variant}</Text>
                      <View style={styles.cardMeta}>
                        <Ionicons name="flash" size={12} color="#94A3B8" />
                        <Text style={styles.metaText}>{item.battery}</Text>
                        <Ionicons name="location" size={12} color="#94A3B8" style={{ marginLeft: 10 }} />
                        <Text style={styles.metaText}>{item.range}</Text>
                      </View>
                    </View>
                    {selectedId === item.id && (
                      <Ionicons name="checkmark-circle" size={24} color="#0D7FF2" />
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.noMatchContainer}>
                  <MaterialCommunityIcons name="car-off" size={60} color="#94A3B8" />
                  <Text style={styles.noMatchText}>Vehicle not found</Text>
                  <Text style={styles.noMatchSubText}>{"It's not there! Try a different name."}</Text>
                </View>
              )}

              {filteredVehicles.length > 0 && (
                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={() => {
                    setSelectedVehicleName(selectedVehicle?.name || 'Tata Nexon EV');
                    setSelectedVehicleImage(selectedVehicle?.image || require('../assets/images/nexon.png'));
                    router.push({
                      pathname: '/details',
                      params: {
                        id: selectedVehicle?.id,
                        name: selectedVehicle?.name,
                        variant: selectedVehicle?.variant,
                        battery: selectedVehicle?.battery,
                        range: selectedVehicle?.range,
                        topSpeed: (selectedVehicle as any)?.topSpeed || '150 km/h',
                        acceleration: (selectedVehicle as any)?.acceleration || '8.5 sec'
                      }
                    });
                  }}
                >
                  <Text style={styles.selectButtonText}>Select Vehicle</Text>
                  <Ionicons name="arrow-forward" size={24} color="#FFFFFF" style={{ marginLeft: 10 }} />
                </TouchableOpacity>
              )}
            </View>

          </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DADBDF',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000000',
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: '600',
    color: '#0D7FF2',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  imageWrapper: {
    width: width * 0.9,
    height: 220,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#000000',
    marginTop: 15,
    letterSpacing: -1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 25,
  },
  statCard: {
    width: (width - 60) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000000',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  searchBar: {
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#000000',
  },
  listSection: {
    paddingHorizontal: 20,
    marginTop: 35,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: 1,
  },
  listCount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0D7FF2',
  },
  vehicleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'transparent',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
  },
  selectedCard: {
    borderColor: '#0D7FF2',
  },
  cardImage: {
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: '#F1F5F9',
  },
  cardInfo: {
    flex: 1,
    marginLeft: 15,
  },
  cardName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#000000',
  },
  cardVariant: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metaText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    marginLeft: 4,
  },
  selectButton: {
    height: 60,
    backgroundColor: '#0D7FF2',
    borderRadius: 20,
    marginTop: 20,
    marginBottom: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#0D7FF2',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  selectButtonText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  noMatchContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    marginTop: 20,
  },
  noMatchText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 15,
  },
  noMatchSubText: {
    fontSize: 15,
    color: '#64748B',
    marginTop: 5,
    textAlign: 'center',
  },
});


