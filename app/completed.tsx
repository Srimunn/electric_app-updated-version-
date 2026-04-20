import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

export default function CompletedScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const finalPercent = params.percent ? parseInt(params.percent as string, 10) : 75;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={26} color="#475569" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Charging Status</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.successSection}>
            <View style={styles.iconContainer}>
              <View style={styles.successIconOuter}>
                <View style={styles.successIconInner}>
                   <Ionicons name="checkmark" size={40} color="#FFFFFF" />
                </View>
              </View>
            </View>
            <Text style={styles.title}>Charging Complete!</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardLabel}>SESSION SUMMARY</Text>
              <View style={styles.completedBadge}>
                <Text style={styles.completedBadgeText}>Completed</Text>
              </View>
            </View>

            <View style={styles.batteryBox}>
              <View style={styles.batteryHeader}>
                <Text style={styles.batteryLabel}>Final Battery Level</Text>
                <Text style={styles.batteryPercent}>{finalPercent}%</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${finalPercent}%` }]} />
              </View>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statCol}>
                <View style={styles.statTitleRow}>
                  <MaterialCommunityIcons name="lightning-bolt" size={14} color="#94A3B8" />
                  <Text style={styles.statTitle}>ENERGY</Text>
                </View>
                <Text style={styles.statValue}>24.8 kWh</Text>
                <Text style={styles.statDesc}>Delivered</Text>
              </View>
              
              <View style={styles.statCol}>
                <View style={styles.statTitleRow}>
                  <Ionicons name="time-outline" size={14} color="#94A3B8" />
                  <Text style={styles.statTitle}>DURATION</Text>
                </View>
                <Text style={styles.statValue}>28 mins</Text>
                <Text style={styles.statDesc}>Charging time</Text>
              </View>
            </View>
          </View>

          <View style={styles.paymentCard}>
            <View style={styles.paymentLeft}>
              <View style={styles.paymentIconBox}>
                <MaterialCommunityIcons name="cash-multiple" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.paymentTextCol}>
                 <Text style={styles.paymentLabel}>TOTAL AMOUNT</Text>
                 <Text style={styles.paymentAmount}>₹450.00</Text>
              </View>
            </View>
            <View style={styles.receiptIcon}>
              <Ionicons name="receipt-outline" size={32} color="#94A3B8" />
            </View>
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/payment')}>
             <Text style={styles.primaryBtnText}>View Bill & Pay</Text>
             <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
          </TouchableOpacity>

          <Text style={styles.footerText}>Need help with this session?</Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E2E8F0', // Matches reference grey background
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
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  successSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  iconContainer: {
    shadowColor: '#0D7FF2',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 24,
  },
  successIconOuter: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIconInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0D7FF2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0D7FF2',
    letterSpacing: -0.5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  completedBadge: {
    backgroundColor: '#0D7FF2',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  batteryBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  batteryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  batteryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  batteryPercent: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0D7FF2',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    width: '100%',
  },
  progressBarFill: {
    height: 6,
    backgroundColor: '#0D7FF2',
    borderRadius: 3,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 4,
  },
  statCol: {
    flex: 1,
  },
  statTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  statTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    marginLeft: 4,
    letterSpacing: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1E293B',
    marginBottom: 2,
  },
  statDesc: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  paymentCard: {
    backgroundColor: '#DBEAFE', // Light blue background
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#0D7FF2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  paymentTextCol: {
    justifyContent: 'center',
  },
  paymentLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1D4ED8',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  paymentAmount: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1E293B',
  },
  receiptIcon: {
    opacity: 0.4,
  },
  primaryBtn: {
    width: '100%',
    height: 64,
    backgroundColor: '#0D7FF2',
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#0D7FF2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  primaryBtnText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
});
