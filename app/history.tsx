import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

const HistoryCard = ({ 
  location, 
  datetime, 
  startPercent, 
  endPercent, 
  energy, 
  duration, 
  cost 
}: {
  location: string,
  datetime: string,
  startPercent: number,
  endPercent: number,
  energy: string,
  duration: string,
  cost: string
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={18} color="#0D7FF2" />
          <Text style={styles.locationName}>{location}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
      </View>
      <Text style={styles.datetime}>{datetime}</Text>

      <View style={styles.batteryRow}>
        <View style={styles.batteryLabel}>
          <Ionicons name="battery-half" size={14} color="#64748B" style={{ marginRight: 4 }} />
          <Text style={styles.batteryPercent}>{startPercent}%</Text>
        </View>
        <Text style={styles.batteryPercentEnd}>{endPercent}%</Text>
      </View>

      <View style={styles.progressBarBg}>
         <View style={[styles.progressBarFill, { width: `${endPercent}%` }]} />
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statBox, { backgroundColor: '#EBF4FF', borderColor: '#BFDBFE', borderWidth: 1 }]}>
          <MaterialCommunityIcons name="lightning-bolt" size={20} color="#0D7FF2" />
          <Text style={styles.statValueMain}>{energy}</Text>
          <Text style={styles.statLabel}>kWh</Text>
        </View>
        
        <View style={styles.statBox}>
          <Ionicons name="time-outline" size={20} color="#94A3B8" />
          <Text style={styles.statValueMain}>{duration}</Text>
          <Text style={styles.statLabel}>min</Text>
        </View>
        
        <View style={styles.statBox}>
          <Ionicons name="cash-outline" size={20} color="#0D7FF2" />
          <Text style={styles.statValueMain}>{cost}</Text>
          <Text style={styles.statLabel}>Cost</Text>
        </View>
      </View>

      <View style={styles.statusRow}>
        <View style={styles.completedBadge}>
          <Ionicons name="checkmark-circle-outline" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
          <Text style={styles.completedBadgeText}>Completed</Text>
        </View>
      </View>
    </View>
  );
};

export default function HistoryScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={26} color="#0D7FF2" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Charging History</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.subHeader}>
            <Text style={styles.sectionTitle}>Recent Sessions</Text>
            <TouchableOpacity>
              <Text style={styles.filterText}>Filter</Text>
            </TouchableOpacity>
          </View>

          <HistoryCard 
            location="Downtown Hub"
            datetime="Today, 2:45 PM"
            startPercent={78}
            endPercent={95}
            energy="24.8"
            duration="28"
            cost="₹450.00"
          />

          <HistoryCard 
            location="Highway Express Plaza"
            datetime="Jan 21, 2026, 08:15 PM"
            startPercent={15}
            endPercent={85}
            energy="52.4"
            duration="45"
            cost="₹980.00"
          />

          <Text style={styles.footerText}>Showing your last 2 sessions</Text>

        </ScrollView>
        
        {/* Custom Bottom Tab Bar */}
        <View style={styles.tabBar}>
          <TouchableOpacity 
            style={styles.tabItem}
            onPress={() => router.replace('/home')}
          >
            <Ionicons name="home-outline" size={24} color="#94A3B8" />
            <Text style={styles.tabLabel}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.tabItem}
            onPress={() => router.push('/map')}
          >
            <Ionicons name="location-outline" size={24} color="#94A3B8" />
            <Text style={styles.tabLabel}>Map</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.tabItem}
          >
            <Ionicons name="time" size={24} color="#0D7FF2" />
            <Text style={[styles.tabLabel, { color: '#0D7FF2' }]}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.tabItem}
            onPress={() => router.replace('/profile')}
          >
            <Ionicons name="person-outline" size={24} color="#94A3B8" />
            <Text style={styles.tabLabel}>Profile</Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E2E8F0',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    marginTop: 20,
    marginBottom: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginLeft: -20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 110,
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#334155',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0D7FF2',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginLeft: 8,
  },
  datetime: {
    fontSize: 12,
    color: '#94A3B8',
    marginLeft: 26,
    marginTop: 2,
    fontWeight: '500',
  },
  batteryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  batteryLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  batteryPercent: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
  },
  batteryPercentEnd: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0D7FF2',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#475569',
    borderRadius: 3,
    width: '100%',
    marginBottom: 20,
  },
  progressBarFill: {
    height: 6,
    backgroundColor: '#0D7FF2',
    borderRadius: 3,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statBox: {
    width: (width - 80) / 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statValueMain: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1E293B',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 2,
  },
  statusRow: {
    flexDirection: 'row',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D7FF2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  completedBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  footerText: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 10,
    marginBottom: 20,
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
