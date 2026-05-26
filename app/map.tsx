import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Image,
    Keyboard,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { MapViewType } from '../components/MapProvider';
import MapView, { Marker } from '../components/MapProvider';
import FallbackImage from '../components/ui/fallback-image';
import { useRealtime } from '../context/RealtimeContext';
import { getImageUrl, getStations, searchStations } from './services/api';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const CARD_SPACING = 15;

/**
 * BRAND COLORS
 */
const COLORS = {
  primary: '#0D7FF2', // Electric Blue
  secondary: '#10B981', // Green for available
  danger: '#EF4444', // Red for offline
  warning: '#F59E0B', // Amber
  grey: '#94A3B8',
  dark: '#1E293B',
  white: '#FFFFFF',
  background: '#F8FAFC'
};

interface Station {
  _id: string;
  stationNumber: string;
  stationName: string;
  name: string;
  location: string;
  district: string;
  latitude: number;
  longitude: number;
  status: 'online' | 'offline' | 'maintenance' | 'charging';
  availabilityStatus: string;
  powerOutput: number;
  connectorType: string;
  image: string;
  ports: number;
  basePricePerKwh: number;
}

const EVMarkerIcon = React.memo(({ selected = false, availability = 'online' }: { selected?: boolean, availability?: string }) => {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: selected ? 1.4 : 1,
      useNativeDriver: true,
      friction: 4,
    }).start();
  }, [selected]);

  const getStatusColor = () => {
    const s = availability.toLowerCase();
    if (s === 'online' || s === 'available') return COLORS.secondary;
    if (s === 'charging') return '#3B82F6';
    return COLORS.danger;
  };

  return (
    <Animated.View style={[styles.markerWrapper, { transform: [{ scale }] }]}>
      <View style={[styles.marker3DContainer, selected && styles.marker3DGlow]}>
        <Image 
          source={require('../assets/images/image.png')} 
          style={styles.marker3DImage}
          resizeMode="contain"
        />
        {/* Availability Indicator Dot */}
        <View style={[styles.markerStatusDot, { backgroundColor: getStatusColor() }]} />
      </View>
      {selected && <View style={styles.markerHalo3D} />}
    </Animated.View>
  );
});

export default function MapScreen() {
  const router = useRouter();
  const mapRef = useRef<MapViewType>(null);
  const listRef = useRef<any>(null);
  const { stationsStatus, lastUpdate } = useRealtime();
  
  const [stations, setStations] = useState<Station[]>([]);
  const [filteredStations, setFilteredStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  // Animated values for UI transitions
  const scrollX = useRef(new Animated.Value(0)).current;

  // Initial fetch
  useEffect(() => {
    fetchStationData();
  }, []);

  // Keep filteredStations in sync when base stations or statuses change
  useEffect(() => {
    if (stations.length === 0) return;
    setFilteredStations(prev => {
      // apply current search filter if present
      if (searchQuery && searchQuery.trim().length > 0) return prev;
      return stations.map(s => ({ ...s }));
    });
  }, [stations, stationsStatus]);

  // Update station statuses from real-time context
  useEffect(() => {
    if (Object.keys(stationsStatus).length > 0) {
      setStations(currentStations => 
        currentStations.map(s => 
          stationsStatus[s._id] 
            ? { ...s, availabilityStatus: stationsStatus[s._id], status: stationsStatus[s._id] as any } 
            : s
        )
      );
    }
  }, [stationsStatus]);

  // Handle live data updates for global view if needed
  useEffect(() => {
    if (lastUpdate && lastUpdate.type === 'status') {
      // Handled by stationsStatus mostly, but good to have as fallback
    }
  }, [lastUpdate]);

  const fetchStationData = async () => {
    setIsLoading(true);
    try {
      const data = await getStations();
      if (Array.isArray(data)) {
        const mapped = data.map(s => ({
          ...s,
          latitude: Number(s.latitude),
          longitude: Number(s.longitude),
          stationName: s.stationName || s.name,
          availabilityStatus: s.availabilityStatus || s.status
        })).filter(s => !isNaN(s.latitude) && !isNaN(s.longitude));
        // Show only active stations by default
        const activeStatuses = ['online', 'available', 'charging'];
        const active = mapped.filter(s => activeStatuses.includes((s.availabilityStatus || '').toLowerCase()));

        setStations(mapped);
        setFilteredStations(active);
        
        if (mapped.length > 0 && !selectedStation) {
          setSelectedStation(mapped[0]);
          focusOnStation(mapped[0], 1000);
        }
      }
    } catch (error) {
      console.warn('Fetch Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setFilteredStations(stations);
      return;
    }
    
    setIsSearching(true);
    try {
      const data = await searchStations(searchQuery);
      if (Array.isArray(data)) {
        const mapped = data.map(s => ({
          ...s,
          latitude: Number(s.latitude),
          longitude: Number(s.longitude),
        })).filter(s => !isNaN(s.latitude) && !isNaN(s.longitude));

        // Client-side search fallback: match name, number, city, district
        const q = searchQuery.trim().toLowerCase();
        const filtered = mapped.filter(s => (
          (s.stationName || '').toLowerCase().includes(q) ||
          (s.stationNumber || '').toLowerCase().includes(q) ||
          (s.location || '').toLowerCase().includes(q) ||
          (s.district || '').toLowerCase().includes(q)
        ));

        setFilteredStations(filtered);
        if (filtered.length > 0) {
          setSelectedStation(filtered[0]);
          focusOnStation(filtered[0]);
        }
      }
    } catch (error) {
      console.warn('Search Error:', error);
    } finally {
      setIsSearching(false);
      Keyboard.dismiss();
    }
  };

  const focusOnStation = (station: Station, duration = 600) => {
    if (!mapRef.current) return;
    mapRef.current.animateToRegion({
      latitude: station.latitude,
      longitude: station.longitude,
      latitudeDelta: 0.015,
      longitudeDelta: 0.015,
    }, duration);
  };

  const onMarkerPress = (station: Station, index: number) => {
    setSelectedStation(station);
    focusOnStation(station);
    // Smooth scroll to the card in the horizontal list
    listRef.current?.scrollToIndex({ 
      index, 
      animated: true, 
      viewPosition: 0.5 
    });
  };

  const onScroll = useMemo(() => Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: true }
  ), [scrollX]);

  const renderStationCard = useCallback(({ item, index }: { item: Station, index: number }) => {
    const isSelected = selectedStation?._id === item._id;
    // Use real-time status from state
    const currentStatus = (item.availabilityStatus || 'offline').toLowerCase();
    const isOnline = currentStatus === 'online' || currentStatus === 'available';
    const isCharging = currentStatus === 'charging';
    
    // Resolve Image URL using helper
    const imageUrl = getImageUrl(item.image) || 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=400';

    const getStatusColor = () => {
      if (isCharging) return '#3B82F6'; // Blue
      if (isOnline) return COLORS.secondary;
      return COLORS.danger;
    };

    return (
      <TouchableOpacity 
        activeOpacity={0.9}
        onPress={() => {
          setSelectedStation(item);
          focusOnStation(item);
        }}
        style={[styles.card, isSelected && styles.cardActive]}
      >
        <View style={styles.cardMain}>
          <View style={styles.cardImageContainer}>
            <FallbackImage
              uri={imageUrl}
              fallback={require('../assets/images/image.png')}
              style={styles.cardImage}
              resizeMode="cover"
            />
            <View style={[styles.badgeOverlay, { backgroundColor: getStatusColor() }, isCharging && styles.badgeGlow]}>
              <Text style={styles.badgeText}>{currentStatus.toUpperCase()}</Text>
            </View>
          </View>
          
          <View style={styles.cardDetails}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.stationName}</Text>
              <Text style={styles.cardId}>ID: {item.stationNumber?.slice(-4) || 'N/A'}</Text>
            </View>
            
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={14} color={COLORS.primary} />
              <Text style={styles.cardSubtitle} numberOfLines={1}>{item.location}</Text>
            </View>

            <View style={styles.specGrid}>
              <View style={styles.specItem}>
                <MaterialCommunityIcons name="flash" size={16} color={COLORS.warning} />
                <Text style={styles.specLabel}>{item.powerOutput}kW</Text>
              </View>
              <View style={styles.dividerVertical} />
              <View style={styles.specItem}>
                <MaterialCommunityIcons name="ev-plug-type2" size={16} color={COLORS.primary} />
                <Text style={styles.specLabel}>{item.connectorType || 'Type 2'}</Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.navigateBtn, currentStatus === 'offline' && styles.navigateBtnDisabled]}
          onPress={() => {
            router.push({
              pathname: '/hub',
              params: {
                stationId: item._id,
                stationName: item.stationName,
                location: item.location,
                powerOutput: String(item.powerOutput),
                basePricePerKwh: String(item.basePricePerKwh),
                available: String(item.ports),
                total: String(item.ports),
                image: item.image,
                connectorType: item.connectorType,
                status: currentStatus
              }
            });
          }}
        >
          <Text style={styles.navigateText}>View Details & Start Charging</Text>
          <MaterialCommunityIcons name="flash" size={18} color="white" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }, [selectedStation, router]);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: 11.0168,
          longitude: 76.9558,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        {filteredStations.map((station, index) => {
          const isSelected = selectedStation?._id === station._id;
          return (
            <Marker
              key={`${station._id}-${station.availabilityStatus}-${isSelected}`}
              coordinate={{ latitude: station.latitude, longitude: station.longitude }}
              onPress={() => onMarkerPress(station, index)}
              tracksViewChanges={true} // Set to true to ensure custom icons render correctly
              zIndex={isSelected ? 100 : index}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <EVMarkerIcon 
                selected={isSelected}
                availability={station.availabilityStatus}
              />
            </Marker>
          );
        })}
      </MapView>

      {/* Header Overlay */}
      <SafeAreaView style={styles.headerContainer} pointerEvents="box-none">
        <View style={styles.searchWrapper}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={COLORS.grey} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search Station, City or District..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              placeholderTextColor={COLORS.grey}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => { setSearchQuery(''); setFilteredStations(stations); }}>
                <Ionicons name="close-circle" size={20} color={COLORS.grey} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>

      {/* Loading State */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Syncing Stations...</Text>
        </View>
      )}

      {/* Bottom Station List */}
      <View style={styles.bottomSheet}>
        <View style={styles.sheetHandle} />
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Nearby Stations ({filteredStations.length})</Text>
          <TouchableOpacity onPress={fetchStationData} style={styles.refreshBtn}>
            <Ionicons name="refresh" size={18} color={COLORS.primary} />
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {filteredStations.length === 0 && !isLoading ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="map-marker-off" size={48} color={COLORS.grey} />
            <Text style={styles.emptyText}>No stations found in this area</Text>
          </View>
        ) : (
          <Animated.FlatList
            ref={listRef}
            data={filteredStations}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item._id}
            renderItem={renderStationCard}
            snapToInterval={CARD_WIDTH + CARD_SPACING}
            decelerationRate="fast"
            contentContainerStyle={styles.listContent}
            onScroll={onScroll}
            scrollEventThrottle={16}
            getItemLayout={(data, index) => ({
              length: CARD_WIDTH + CARD_SPACING,
              offset: (CARD_WIDTH + CARD_SPACING) * index,
              index,
            })}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  map: {
    width: width,
    height: height,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  searchWrapper: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    height: 54,
    borderRadius: 27,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: COLORS.dark,
    fontWeight: '600',
  },
  markerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  marker3DContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  marker3DImage: {
    width: 38,
    height: 38,
  },
  marker3DGlow: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 12,
  },
  markerStatusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
    elevation: 4,
    zIndex: 10,
  },
  markerHalo3D: {
    position: 'absolute',
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.primary + '15',
    zIndex: 0,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 25,
  },
  sheetHandle: {
    width: 45,
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 15,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    marginBottom: 15,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.dark,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  refreshText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 4,
  },
  listContent: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    marginRight: CARD_SPACING,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.background,
    borderWidth: 2,
  },
  cardMain: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  cardImageContainer: {
    width: 90,
    height: 90,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  badgeOverlay: {
    position: 'absolute',
    top: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    zIndex: 10,
  },
  badgeGlow: {
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  cardDetails: {
    flex: 1,
    paddingLeft: 14,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.dark,
    flex: 1,
  },
  cardId: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.grey,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 10,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 13,
    color: COLORS.grey,
    marginLeft: 4,
    fontWeight: '500',
  },
  specGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  specLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.dark,
  },
  dividerVertical: {
    width: 1,
    height: 12,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 12,
  },
  navigateBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 16,
    gap: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 4,
  },
  navigateBtnDisabled: {
    backgroundColor: COLORS.grey,
    shadowOpacity: 0,
    elevation: 0,
  },
  navigateText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '800',
  },
  emptyState: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  emptyText: {
    marginTop: 12,
    color: COLORS.grey,
    fontSize: 15,
    fontWeight: '600',
  }
});
