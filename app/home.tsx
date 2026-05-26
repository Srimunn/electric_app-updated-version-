import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVehicle } from '../context/VehicleContext';
import { getImageUrl, getStations } from './services/api';

const { width, height } = Dimensions.get('window');

/**
 * BRAND COLORS:
 * Grey: #DADBDF
 * Blue: #0D7FF2
 * Black/White
 */

export default function HomeScreen() {
  const router = useRouter();
  const { vehicleName } = useLocalSearchParams();
  const { selectedVehicleName } = useVehicle();
  const [showNotification, setShowNotification] = useState(false);
  const [nearestStation, setNearestStation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHomeData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getStations();
      if (data && data.length > 0) {
        // For now, just pick the first one as "nearest"
        setNearestStation(data[0]);
      } else {
        setNearestStation(null);
      }
    } catch (err) {
      console.error('Home fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchHomeData();
    }, [fetchHomeData])
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Top Background Gradient Effect */}
      <View style={styles.topCurvedBg} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Header Section */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greetingHeader}>Hello Srimun</Text>
              <Text style={styles.vehicleNameText}>{selectedVehicleName || vehicleName || 'Tata Nexon EV'}</Text>
            </View>
            <TouchableOpacity 
              style={styles.notificationBtn}
              onPress={() => setShowNotification(true)}
            >
              <Ionicons name="notifications-outline" size={26} color="#FFFFFF" />
              <View style={styles.notifDot} />
            </TouchableOpacity>
          </View>

          {/* Status Overview Card */}
          <View style={styles.mainStatusCard}>
            <View style={styles.statusRow}>
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Current Status</Text>
                <View style={styles.valueRow}>
                  <Text style={styles.mainValue}>78</Text>
                  <Text style={styles.percentSymbol}>%</Text>
                </View>
                <Text style={styles.lastUpdateText}>Last charged 2 hours ago</Text>
              </View>

              <View style={styles.statusItemRight}>
                <Text style={styles.statusLabel}>Est. Range</Text>
                <View style={styles.valueRow}>
                  <Text style={[styles.mainValue, { color: '#0D7FF2' }]}>279</Text>
                  <Text style={[styles.percentSymbol, { color: '#0D7FF2' }]}>mi</Text>
                </View>
                <View style={styles.rangeIndicatorTrack}>
                  <View style={styles.rangeIndicatorFill} />
                </View>
              </View>
            </View>
          </View>

          {/* Nearest Station Card */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Nearest Station</Text>
              {nearestStation && (
                <View style={[styles.availableBadge, { backgroundColor: nearestStation.status === 'online' ? '#10B981' : '#EF4444' }]}>
                  <Text style={styles.availableBadgeText}>{nearestStation.status?.toUpperCase() || 'OFFLINE'}</Text>
                </View>
              )}
            </View>

            {isLoading ? (
              <ActivityIndicator size="small" color="#0D7FF2" style={{ marginVertical: 20 }} />
            ) : nearestStation ? (
              <View style={styles.stationInfoRow}>
                <View style={styles.stationIconBox}>
                  {nearestStation.image ? (
                    <Image 
                      source={{ uri: nearestStation.image.startsWith('http') ? nearestStation.image : getImageUrl(nearestStation.image) }} 
                      style={{ width: '100%', height: '100%', borderRadius: 20 }}
                    />
                  ) : (
                    <MaterialCommunityIcons name="flash-outline" size={30} color="#0D7FF2" />
                  )}
                </View>
                <View style={styles.stationTextContent}>
                  <Text style={styles.stationName} numberOfLines={1}>{nearestStation.name || nearestStation.stationName}</Text>
                  <Text style={styles.stationMeta} numberOfLines={1}>{nearestStation.location}</Text>
                  <Text style={styles.stationTiming}>{nearestStation.powerOutput} kW • {nearestStation.connectorType || 'Type 2'}</Text>
                </View>
              </View>
            ) : (
              <Text style={{ textAlign: 'center', color: '#94A3B8', marginVertical: 10 }}>No stations found nearby</Text>
            )}

            <TouchableOpacity 
              style={styles.secondaryActionBtn}
              onPress={() => router.push({ pathname: '/map', params: { vehicleName: vehicleName } })}
            >
              <Text style={styles.secondaryActionText}>View on Map</Text>
            </TouchableOpacity>
          </View>

          {/* Last Charging Session Card */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Last Charging Session</Text>
            <Text style={styles.sessionDate}>Jan 24, 2026</Text>

            <View style={styles.sessionStatsContainer}>
              <View style={styles.sessionStatItem}>
                <Text style={styles.sessionStatValue}>42 kWh</Text>
                <Text style={styles.sessionStatLabel}>ENERGY</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.sessionStatItem}>
                <Text style={styles.sessionStatValue}>28 min</Text>
                <Text style={styles.sessionStatLabel}>TIME</Text>
              </View>
              <View style={styles.sessionCostInfo}>
                <Text style={styles.costValue}>₹1,225.00</Text>
                <Text style={styles.successText}>Successful</Text>
              </View>
            </View>
          </View>

          {/* Primary Action Button */}
          <TouchableOpacity 
            style={styles.primaryActionBtn}
            onPress={() => router.push({ pathname: '/map', params: { vehicleName: vehicleName } })}
          >
            <Text style={styles.primaryActionText}>Find Charging Station</Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>

      {/* Notification Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showNotification}
        onRequestClose={() => setShowNotification(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowNotification(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notifications</Text>
              <TouchableOpacity onPress={() => setShowNotification(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.messageItem}>
              <View style={styles.blueDot} />
              <View style={styles.messageTextContainer}>
                <Text style={styles.messageTitle}>Charging Complete!</Text>
                <Text style={styles.messageBody}>Your vehicle is now fully charged and ready for your next adventure. Enjoy the ride!</Text>
                <Text style={styles.messageTime}>Just now</Text>
              </View>
            </View>

            <View style={[styles.messageItem, { opacity: 0.6 }]}>
              <View style={[styles.blueDot, { backgroundColor: '#CBD5E1' }]} />
              <View style={styles.messageTextContainer}>
                <Text style={styles.messageTitle}>System Update</Text>
                <Text style={styles.messageBody}>Wireless handshake optimization is now active in your area.</Text>
                <Text style={styles.messageTime}>2 hours ago</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.closeModalBtn}
              onPress={() => setShowNotification(false)}
            >
              <Text style={styles.closeModalBtnText}>Understood</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Custom Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={styles.tabItem}
          onPress={() => router.replace('/home')}
        >
          <Ionicons name="home" size={24} color="#0D7FF2" />
          <Text style={[styles.tabLabel, { color: '#0D7FF2' }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.tabItem}
          onPress={() => router.push({ pathname: '/map', params: { vehicleName: vehicleName } })}
        >
          <Ionicons name="location-outline" size={24} color="#94A3B8" />
          <Text style={styles.tabLabel}>Map</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.tabItem}
          onPress={() => router.replace('/history')}
        >
          <Ionicons name="time-outline" size={24} color="#94A3B8" />
          <Text style={styles.tabLabel}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.tabItem}
          onPress={() => router.replace('/profile')}
        >
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
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    marginTop: 40,
  },
  greetingHeader: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
  },
  vehicleNameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    marginTop: 2,
  },
  notificationBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#475569',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  notifDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0D7FF2',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  mainStatusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    padding: 25,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    marginBottom: 25,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusItem: {
    flex: 1,
  },
  statusItemRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 8,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  mainValue: {
    fontSize: 48,
    fontWeight: '800',
    color: '#1E293B',
  },
  percentSymbol: {
    fontSize: 20,
    fontWeight: '700',
    color: '#94A3B8',
    marginLeft: 4,
  },
  lastUpdateText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 10,
    fontWeight: '500',
  },
  rangeIndicatorTrack: {
    width: 65,
    height: 24,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    marginTop: 12,
    overflow: 'hidden',
  },
  rangeIndicatorFill: {
    width: '70%',
    height: '100%',
    backgroundColor: '#0D7FF2',
    borderRadius: 12,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  availableBadge: {
    backgroundColor: '#0D7FF2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  availableBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  stationInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stationIconBox: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stationTextContent: {
    marginLeft: 15,
    flex: 1,
  },
  stationName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E293B',
  },
  stationMeta: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  stationTiming: {
    fontSize: 13,
    color: '#0D7FF2',
    marginTop: 4,
    fontWeight: '700',
  },
  secondaryActionBtn: {
    backgroundColor: '#F8FAFC',
    height: 54,
    borderRadius: 18,
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  secondaryActionText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  sessionDate: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 15,
    fontWeight: '600',
  },
  sessionStatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionStatItem: {
    flex: 1,
  },
  sessionStatValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  sessionStatLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  divider: {
    width: 1,
    height: 35,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 15,
  },
  sessionCostInfo: {
    alignItems: 'flex-end',
  },
  costValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
  },
  successText: {
    fontSize: 12,
    color: '#0D7FF2',
    fontWeight: '700',
    marginTop: 2,
  },
  primaryActionBtn: {
    backgroundColor: '#0D7FF2',
    height: 64,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    elevation: 8,
    shadowColor: '#0D7FF2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  primaryActionText: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.85,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    padding: 25,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
  },
  messageItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  blueDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0D7FF2',
    marginTop: 6,
    marginRight: 12,
  },
  messageTextContainer: {
    flex: 1,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  messageBody: {
    fontSize: 14,
    color: '#475569',
    marginTop: 4,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 8,
    fontWeight: '600',
  },
  closeModalBtn: {
    backgroundColor: '#0D7FF2',
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  closeModalBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
