import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_CLIENT from './services/api';

export default function CompletedScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    percent?: string;
    energy?: string;
    duration?: string;
    sessionId?: string;
  }>();

  const finalPercent = params.percent ? parseInt(params.percent as string, 10) : 75;
  const energy = params.energy ? parseFloat(params.energy as string) : 0;
  let duration = params.duration ? (params.duration as string) : '0:00';
  if (!duration.includes('min') && !duration.includes(':')) {
    duration = `${duration} mins`;
  }

  const [isLoading, setIsLoading] = useState(true);
  const [payment, setPayment] = useState<any>(null);
  const pollCount = useRef(0);

  useEffect(() => {
    let active = true;
    const fetchAndPollReconciliation = async () => {
      try {
        // Resolve sessionId
        let sessionId = params.sessionId;
        if (!sessionId) {
          sessionId = await AsyncStorage.getItem('lastSessionId') || undefined;
        }
        if (!sessionId) {
          // If absolutely no sessionId is found, use a short timeout and fallback
          setIsLoading(false);
          return;
        }

        console.log(`[Completed] Fetching payment details for session: ${sessionId}`);
        const res = await API_CLIENT.get(`/payments/session/${sessionId}`);
        const paymentData = res.data;

        if (active) {
          setPayment(paymentData);

          // If the payment is reconciled (completed or refunded), stop polling
          if (paymentData.status === 'completed' || paymentData.status === 'refunded' || pollCount.current >= 8) {
            setIsLoading(false);
          } else {
            // Keep polling every 1 second (up to 8 times)
            pollCount.current += 1;
            setTimeout(fetchAndPollReconciliation, 1000);
          }
        }
      } catch (err) {
        console.error('[Completed] Poll error:', err);
        if (active) {
          // Keep trying if we haven't hit the limit
          if (pollCount.current < 8) {
            pollCount.current += 1;
            setTimeout(fetchAndPollReconciliation, 1200);
          } else {
            setIsLoading(false);
          }
        }
      }
    };

    fetchAndPollReconciliation();

    return () => {
      active = false;
    };
  }, [params.sessionId]);

  // Fallbacks if backend doesn't return payment in time
  const estimatedPaid = payment?.estimatedAmount ?? (energy > 0 ? Math.ceil(energy * 15 * 1.2) : 150);
  const actualCost = payment?.actualAmount ?? payment?.totalAmount ?? (energy > 0 ? (energy * 15) : 0);
  const refundAmount = payment?.refundAmount ?? Math.max(0, estimatedPaid - actualCost);
  const extraAmount = payment?.extraAmount ?? 0;
  const paymentStatus = payment?.status ?? 'completed';

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/home')}>
            <Ionicons name="close" size={26} color="#475569" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Session Summary</Text>
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
              <Text style={styles.cardLabel}>PERFORMANCE</Text>
              <View style={styles.completedBadge}>
                <Text style={styles.completedBadgeText}>Success</Text>
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
                  <Text style={styles.statTitle}>ENERGY DELIVERED</Text>
                </View>
                <Text style={styles.statValue}>{energy.toFixed(2)} kWh</Text>
                <Text style={styles.statDesc}>Total usage</Text>
              </View>
              
              <View style={styles.statCol}>
                <View style={styles.statTitleRow}>
                  <Ionicons name="time-outline" size={14} color="#94A3B8" />
                  <Text style={styles.statTitle}>TOTAL DURATION</Text>
                </View>
                <Text style={styles.statValue}>{duration}</Text>
                <Text style={styles.statDesc}>Time plugged in</Text>
              </View>
            </View>
          </View>

          {isLoading ? (
            <View style={styles.loaderCard}>
              <ActivityIndicator color="#0D7FF2" size="small" />
              <Text style={styles.loaderText}>Reconciling actual charging cost...</Text>
            </View>
          ) : (
            <>
              {/* Cost Reconciliation Card */}
              <Text style={styles.sectionTitle}>Reconciliation Summary</Text>
              <View style={styles.detailsCard}>
                 <View style={styles.detailRow}>
                   <Text style={styles.detailLabel}>Estimated Pre-Paid</Text>
                   <Text style={styles.detailValue}>₹{estimatedPaid.toFixed(2)}</Text>
                 </View>
                 <View style={styles.detailRow}>
                   <Text style={styles.detailLabel}>Actual Charging Cost</Text>
                   <Text style={styles.detailValue}>₹{actualCost.toFixed(2)}</Text>
                 </View>

                 {refundAmount > 0 && (
                   <View style={styles.refundRow}>
                     <View style={styles.refundLabelGroup}>
                       <MaterialCommunityIcons name="cash-refund" size={18} color="#10B981" />
                       <Text style={styles.refundLabel}>Auto Refund Difference</Text>
                     </View>
                     <Text style={styles.refundValue}>- ₹{refundAmount.toFixed(2)}</Text>
                   </View>
                 )}

                 {extraAmount > 0 && (
                   <View style={styles.detailRow}>
                     <Text style={styles.detailLabel}>Extra Amount Due</Text>
                     <Text style={styles.detailValue}>₹{extraAmount.toFixed(2)}</Text>
                   </View>
                 )}

                 <View style={[styles.detailRow, { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 }]}>
                   <Text style={styles.totalLabel}>Final Settled Amount</Text>
                   <Text style={styles.totalValue}>₹{actualCost.toFixed(2)}</Text>
                 </View>
              </View>

              {/* Refund Status Alert */}
              {refundAmount > 0 && (
                <View style={styles.refundStatusCard}>
                  <Ionicons name="information-circle-outline" size={24} color="#047857" style={{ marginRight: 12 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.refundStatusTitle}>Refund Processed</Text>
                    <Text style={styles.refundStatusBody}>
                      Unused balance of ₹{refundAmount.toFixed(2)} has been automatically refunded to your original payment method via Razorpay.
                    </Text>
                    {payment?.refundId && (
                      <Text style={styles.refundIdText}>Refund ID: {payment.refundId}</Text>
                    )}
                  </View>
                </View>
              )}
            </>
          )}

          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.replace('/home')}>
             <Text style={styles.primaryBtnText}>Back to Home</Text>
             <Ionicons name="home-outline" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
  
        </ScrollView>
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
    marginTop: 15,
    marginBottom: 15,
  },
  iconContainer: {
    shadowColor: '#0D7FF2',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 16,
  },
  successIconOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIconInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0D7FF2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
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
    letterSpacing: 0.5,
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
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 12,
    marginLeft: 4,
  },
  loaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
  },
  loaderText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '700',
  },
  refundRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  refundLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  refundLabel: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '700',
  },
  refundValue: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '800',
  },
  totalLabel: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '800',
  },
  totalValue: {
    fontSize: 18,
    color: '#0D7FF2',
    fontWeight: '900',
  },
  refundStatusCard: {
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 25,
  },
  refundStatusTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#065F46',
    marginBottom: 4,
  },
  refundStatusBody: {
    fontSize: 13,
    color: '#065F46',
    lineHeight: 18,
    fontWeight: '500',
  },
  refundIdText: {
    fontSize: 11,
    color: '#047857',
    fontWeight: '700',
    marginTop: 6,
    fontFamily: 'monospace',
  },
  primaryBtn: {
    width: '100%',
    height: 64,
    backgroundColor: '#0D7FF2',
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
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
});
