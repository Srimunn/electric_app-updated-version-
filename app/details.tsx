import React from 'react';
import { StyleSheet, Text, View, Image, SafeAreaView, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

/**
 * BRAND COLORS:
 * Grey: #DADBDF
 * Blue: #0D7FF2
 * Black/White
 */

const VEHICLES = [
  { id: '1', name: 'Tata Nexon EV', variant: 'Empower+ Long Range', battery: '40.5 KWH', range: '465 KM', image: require('../assets/images/hero-car.png'), topSpeed: '150 km/h', acceleration: '8.9 sec' },
  { id: '2', name: 'Mahindra XUV400', variant: 'EL Pro Variant', battery: '39.4 KWH', range: '390 KM', image: require('../assets/images/hero-car.png'), topSpeed: '150 km/h', acceleration: '8.3 sec' },
  { id: '3', name: 'Suzuki Wagon R EV', variant: 'Concept Version', battery: '28.5 KWH', range: '250 KM', image: require('../assets/images/hero-car.png'), topSpeed: '120 km/h', acceleration: '12.5 sec' },
  { id: '4', name: 'MG ZS EV', variant: 'Exclusive Plus', battery: '50.3 KWH', range: '461 KM', image: require('../assets/images/hero-car.png'), topSpeed: '140 km/h', acceleration: '8.5 sec' },
  { id: '5', name: 'Hyundai IONIQ 5', variant: 'RWD 72.6 kWh', battery: '72.6 KWH', range: '631 KM', image: require('../assets/images/hero-car.png'), topSpeed: '185 km/h', acceleration: '7.6 sec' },
  { id: '6', name: 'KIA EV6', variant: 'GT-Line AWD', battery: '77.4 KWH', range: '528 KM', image: require('../assets/images/hero-car.png'), topSpeed: '192 km/h', acceleration: '5.2 sec' },
  { id: '7', name: 'BYD Atto 3', variant: 'Superior', battery: '60.4 KWH', range: '521 KM', image: require('../assets/images/hero-car.png'), topSpeed: '160 km/h', acceleration: '7.3 sec' },
  { id: '8', name: 'Volvo XC40 Recharge', variant: 'Twin Motor', battery: '78 KWH', range: '418 KM', image: require('../assets/images/hero-car.png'), topSpeed: '180 km/h', acceleration: '4.9 sec' },
  { id: '9', name: 'BMW i4', variant: 'eDrive40', battery: '83.9 KWH', range: '590 KM', image: require('../assets/images/hero-car.png'), topSpeed: '190 km/h', acceleration: '5.7 sec' },
  { id: '10', name: 'Mercedes-Benz EQB', variant: '350 4MATIC', battery: '66.5 KWH', range: '423 KM', image: require('../assets/images/hero-car.png'), topSpeed: '160 km/h', acceleration: '6.2 sec' },
];

export default function VehicleDetails() {
  const router = useRouter();
  const { id, name, variant, battery, range, topSpeed, acceleration } = useLocalSearchParams();

  const staticVehicle = VEHICLES.find(v => v.id === id) || VEHICLES[0];

  // Merge the dynamically fetched data (passed via params) with static defaults
  const vehicle = {
    id: id || staticVehicle.id,
    name: name || staticVehicle.name,
    variant: variant || staticVehicle.variant,
    battery: battery || staticVehicle.battery,
    range: range || staticVehicle.range,
    topSpeed: topSpeed || staticVehicle.topSpeed,
    acceleration: acceleration || staticVehicle.acceleration,
    image: staticVehicle.image // Default to static image since APIs may lack direct local image mapping
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Vehicle Selection</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.heroSection}>
            <View style={styles.imageWrapper}>
               <Image 
                source={vehicle.image} 
                style={styles.heroImage}
                resizeMode="cover"
              />
              <View style={styles.activeBadge}>
                <View style={styles.dot} />
                <Text style={styles.activeText}>ACTIVE</Text>
              </View>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.brandTitle}>{vehicle.name}</Text>
              <Text style={styles.subTitle}>{vehicle.variant} • Zero Emissions</Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="battery-charging-high" size={24} color="#0D7FF2" />
              </View>
              <Text style={styles.statLabel}>BATTERY</Text>
              <View style={styles.valueRow}>
                <Text style={styles.statValue}>{vehicle.battery.split(' ')[0]}</Text>
                <Text style={styles.statUnit}>kWh</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={styles.iconCircle}>
                <Ionicons name="location-outline" size={24} color="#0D7FF2" />
              </View>
              <Text style={styles.statLabel}>RANGE</Text>
              <View style={styles.valueRow}>
                <Text style={styles.statValue}>{vehicle.range.split(' ')[0]}</Text>
                <Text style={styles.statUnit}>km</Text>
              </View>
            </View>
          </View>

          <View style={styles.specSection}>
            <Text style={styles.specTitle}>Core Specifications</Text>

            <View style={styles.specRow}>
              <View style={styles.specLabelGroup}>
                <MaterialCommunityIcons name="speedometer" size={20} color="#64748B" />
                <Text style={styles.specLabel}>Top Speed</Text>
              </View>
              <Text style={styles.specValue}>{vehicle.topSpeed}</Text>
            </View>

            <View style={styles.specRow}>
              <View style={styles.specLabelGroup}>
                <MaterialCommunityIcons name="timer-outline" size={20} color="#64748B" />
                <Text style={styles.specLabel}>0-100 km/h</Text>
              </View>
              <Text style={styles.specValue}>{vehicle.acceleration}</Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.continueButton}
              onPress={() => router.push({ pathname: '/home', params: { vehicleName: vehicle.name } })}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={24} color="#FFFFFF" style={{ marginLeft: 10 }} />
            </TouchableOpacity>
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
    fontSize: 20,
    fontWeight: '800',
    color: '#000000',
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginTop: 10,
  },
  imageWrapper: {
    width: width * 0.9,
    height: 250,
    backgroundColor: '#FFFFFF',
    borderRadius: 35,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  activeBadge: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: '#0D7FF2',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  activeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  infoSection: {
    alignItems: 'center',
    marginTop: 25,
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: -1,
  },
  subTitle: {
    fontSize: 15,
    color: '#64748B',
    marginTop: 5,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 35,
  },
  statCard: {
    width: (width - 60) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    padding: 18,
    alignItems: 'flex-start',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 5,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  statValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#000000',
  },
  statUnit: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 4,
    fontWeight: '700',
  },
  specSection: {
    paddingHorizontal: 20,
    marginTop: 40,
  },
  specTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 20,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 18,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
  },
  specLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  specLabel: {
    fontSize: 15,
    color: '#475569',
    marginLeft: 15,
    fontWeight: '600',
  },
  specValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  continueButton: {
    height: 64,
    backgroundColor: '#0D7FF2',
    borderRadius: 22,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#0D7FF2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  continueButtonText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
