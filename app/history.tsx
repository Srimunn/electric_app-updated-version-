import React, { useState, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Dimensions, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  ActivityIndicator, 
  RefreshControl 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { getSessions, getUserPayments, getImageUrl } from './services/api';

const { width } = Dimensions.get('window');

// Date Formatter Helper
const formatDate = (dateStr: string) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  
  const now = new Date();
  const diffTime = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  if (d.toDateString() === now.toDateString()) {
    return `Today, ${timeStr}`;
  }
  
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${timeStr}`;
  }
  
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  return `${d.toLocaleDateString([], options)}, ${timeStr}`;
};

export default function HistoryScreen() {
  const router = useRouter();
  const [sessions, setSessions] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'sessions' | 'payments'>('all');

  const fetchHistory = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const [sessionsData, paymentsData] = await Promise.all([
        getSessions(),
        getUserPayments(),
      ]);
      setSessions(sessionsData || []);
      setPayments(paymentsData || []);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [fetchHistory])
  );

  const filterItems = (items: any[], type: 'session' | 'payment') => {
    const now = new Date();
    
    return items.filter(item => {
      const dateStr = type === 'session' ? item.startTime : (item.createdAt || item.updatedAt);
      if (!dateStr) return false;
      
      const itemDate = new Date(dateStr);
      if (isNaN(itemDate.getTime())) return false;
      
      if (activeFilter === 'today') {
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        return itemDate >= todayStart;
      }
      
      if (activeFilter === 'week') {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - 7);
        weekStart.setHours(0, 0, 0, 0);
        return itemDate >= weekStart;
      }
      
      if (activeFilter === 'month') {
        const monthStart = new Date(now);
        monthStart.setDate(monthStart.getDate() - 30);
        monthStart.setHours(0, 0, 0, 0);
        return itemDate >= monthStart;
      }
      
      return true; // 'all'
    });
  };

  const processedSessions = filterItems(sessions, 'session').map(s => ({
    ...s,
    timelineType: 'session' as const,
    timelineDate: new Date(s.startTime),
  }));

  const processedPayments = filterItems(payments, 'payment').map(p => ({
    ...p,
    timelineType: 'payment' as const,
    timelineDate: new Date(p.createdAt || p.updatedAt),
  }));

  let mergedTimeline: any[] = [];
  if (typeFilter === 'all') {
    mergedTimeline = [...processedSessions, ...processedPayments];
  } else if (typeFilter === 'sessions') {
    mergedTimeline = processedSessions;
  } else if (typeFilter === 'payments') {
    mergedTimeline = processedPayments;
  }

  // Sort newest first
  mergedTimeline.sort((a, b) => b.timelineDate.getTime() - a.timelineDate.getTime());

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <Ionicons name="calendar-outline" size={44} color="#94A3B8" />
      </View>
      <Text style={styles.emptyTitle}>No Activities Found</Text>
      <Text style={styles.emptySubtitle}>
        {activeFilter === 'all' 
          ? "You haven't made any sessions or payments yet." 
          : `No history available matching this date range.`}
      </Text>
      <TouchableOpacity style={styles.emptyActionBtn} onPress={() => router.push('/map')}>
        <Text style={styles.emptyActionText}>Find Charging Stations</Text>
      </TouchableOpacity>
    </View>
  );

  const ActivityCard = ({ item }: { item: any }) => {
    if (item.timelineType === 'session') {
      const stationName = item.stationId?.name || item.stationNumber || 'EV Charging Station';
      const location = item.stationId?.location || 'Location details unavailable';
      const imagePath = item.stationId?.image;
      
      const durationMin = item.endTime 
        ? Math.round((new Date(item.endTime).getTime() - new Date(item.startTime).getTime()) / 60000) 
        : Math.round((Date.now() - new Date(item.startTime).getTime()) / 60000);
        
      const isCompleted = item.status === 'completed';
      const energyKwh = item.energyUsed !== undefined ? Number(item.energyUsed).toFixed(1) : '0.0';
      const formattedCost = item.cost !== undefined ? `₹${Number(item.cost).toFixed(2)}` : '₹0.00';
      
      return (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.imageAndTitleRow}>
              {imagePath ? (
                <Image 
                  source={{ uri: getImageUrl(imagePath) }} 
                  style={styles.cardStationImage} 
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.cardStationImagePlaceholder, { backgroundColor: '#E0F2FE' }]}>
                  <MaterialCommunityIcons name="lightning-bolt" size={20} color="#0D7FF2" />
                </View>
              )}
              <View style={styles.titleTextContainer}>
                <Text style={styles.locationName} numberOfLines={1}>{stationName}</Text>
                <Text style={styles.datetime}>Start: {formatDate(item.startTime)}</Text>
                {item.endTime && (
                  <Text style={styles.datetime}>Stop: {formatDate(item.endTime)}</Text>
                )}
              </View>
            </View>
            <View style={[styles.typeBadge, { backgroundColor: '#EFF6FF' }]}>
              <Text style={[styles.typeBadgeText, { color: '#0D7FF2' }]}>SESSION</Text>
            </View>
          </View>

          <View style={styles.detailsRow}>
            <Ionicons name="location-outline" size={14} color="#64748B" style={{ marginRight: 4 }} />
            <Text style={styles.detailsLocationText} numberOfLines={1}>{location}</Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={[styles.statBox, { backgroundColor: '#F0F9FF', borderColor: '#E0F2FE' }]}>
              <MaterialCommunityIcons name="lightning-bolt" size={18} color="#0D7FF2" />
              <Text style={styles.statValueMain}>{energyKwh}</Text>
              <Text style={styles.statLabel}>kWh</Text>
            </View>
            
            <View style={[styles.statBox, { backgroundColor: '#F8FAFC', borderColor: '#F1F5F9' }]}>
              <Ionicons name="time-outline" size={18} color="#64748B" />
              <Text style={styles.statValueMain}>{durationMin}</Text>
              <Text style={styles.statLabel}>mins</Text>
            </View>
            
            <View style={[styles.statBox, { backgroundColor: '#F0FDF4', borderColor: '#DCFCE7' }]}>
              <Ionicons name="cash-outline" size={18} color="#16A34A" />
              <Text style={[styles.statValueMain, { color: '#16A34A' }]}>{formattedCost}</Text>
              <Text style={styles.statLabel}>Cost</Text>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>Connector #{item.connectorId || '1'}</Text>
            </View>
            <View style={[
              styles.statusBadge, 
              isCompleted ? styles.completedBadge : styles.activeBadge
            ]}>
              <Ionicons 
                name={isCompleted ? "checkmark-circle-outline" : "flash-outline"} 
                size={12} 
                color="#FFFFFF" 
                style={{ marginRight: 4 }} 
              />
              <Text style={styles.badgeText}>{isCompleted ? "Completed" : "Active"}</Text>
            </View>
          </View>
        </View>
      );
    } else {
      const stationName = item.stationId?.name || 'EV Charging Station';
      const imagePath = item.stationId?.image;
      const isPaid = item.status === 'paid' || item.status === 'completed';
      const isRefunded = item.status === 'refunded';
      const isFailed = item.status === 'failed';
      
      let statusText = 'Pending';
      let badgeBgColor = '#64748B';
      
      if (isPaid) {
        statusText = 'Paid';
        badgeBgColor = '#22C55E';
      } else if (isRefunded) {
        statusText = 'Refunded';
        badgeBgColor = '#06B6D4';
      } else if (isFailed) {
        statusText = 'Failed';
        badgeBgColor = '#EF4444';
      } else if (item.status === 'charging') {
        statusText = 'Charging';
        badgeBgColor = '#F59E0B';
      } else if (item.status === 'pending_refund') {
        statusText = 'Refund Pending';
        badgeBgColor = '#8B5CF6';
      }
      
      const formattedAmount = item.amount !== undefined ? `₹${Number(item.amount).toFixed(2)}` : '₹0.00';
      
      return (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.imageAndTitleRow}>
              {imagePath ? (
                <Image 
                  source={{ uri: getImageUrl(imagePath) }} 
                  style={styles.cardStationImage} 
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.cardStationImagePlaceholder, { backgroundColor: '#ECFDF5' }]}>
                  <Ionicons name="card-outline" size={20} color="#10B981" />
                </View>
              )}
              <View style={styles.titleTextContainer}>
                <Text style={styles.locationName} numberOfLines={1}>{stationName}</Text>
                <Text style={styles.datetime}>{formatDate(item.createdAt || item.updatedAt)}</Text>
              </View>
            </View>
            <View style={[styles.typeBadge, { backgroundColor: '#ECFDF5' }]}>
              <Text style={[styles.typeBadgeText, { color: '#10B981' }]}>PAYMENT</Text>
            </View>
          </View>

          <View style={styles.paymentDetailsBox}>
            <View style={styles.paymentDetailItem}>
              <Text style={styles.paymentDetailLabel}>Amount Charged</Text>
              <Text style={styles.paymentDetailVal}>{formattedAmount}</Text>
            </View>
            
            {item.refundAmount > 0 && (
              <View style={[styles.paymentDetailItem, { marginTop: 6 }]}>
                <Text style={[styles.paymentDetailLabel, { color: '#0891B2' }]}>Refund Received</Text>
                <Text style={[styles.paymentDetailVal, { color: '#0891B2', fontWeight: '800' }]}>₹{Number(item.refundAmount).toFixed(2)}</Text>
              </View>
            )}

            <View style={styles.paymentIdRow}>
              <Text style={styles.paymentIdLabel}>Razorpay Order:</Text>
              <Text style={styles.paymentIdVal} numberOfLines={1}>{item.orderId || 'N/A'}</Text>
            </View>
            {item.paymentId && (
              <View style={[styles.paymentIdRow, { marginTop: 2 }]}>
                <Text style={styles.paymentIdLabel}>Payment ID:</Text>
                <Text style={styles.paymentIdVal} numberOfLines={1}>{item.paymentId}</Text>
              </View>
            )}
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>Energy: ₹{Number(item.energyCost || 0).toFixed(2)}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: badgeBgColor }]}>
              <Text style={styles.badgeText}>{statusText}</Text>
            </View>
          </View>
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Curved Background Top Accent */}
      <View style={styles.topCurvedBg} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={26} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Charging & Payments</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Date Capsule Filters */}
        <View style={styles.filtersWrapper}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.dateFilterScroll}
          >
            {(['all', 'today', 'week', 'month'] as const).map((filter) => {
              const filterLabels = {
                all: 'All Time',
                today: 'Today',
                week: 'This Week',
                month: 'This Month'
              };
              return (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.dateFilterButton,
                    activeFilter === filter && styles.dateFilterButtonActive
                  ]}
                  onPress={() => setActiveFilter(filter)}
                >
                  <Text style={[
                    styles.dateFilterButtonText,
                    activeFilter === filter && styles.dateFilterButtonTextActive
                  ]}>
                    {filterLabels[filter]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Segmented Type Filter */}
          <View style={styles.typeFilterContainer}>
            {(['all', 'sessions', 'payments'] as const).map((type) => {
              const typeLabels = {
                all: 'All Activities',
                sessions: 'Sessions',
                payments: 'Payments'
              };
              return (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeFilterButton,
                    typeFilter === type && styles.typeFilterButtonActive
                  ]}
                  onPress={() => setTypeFilter(type)}
                >
                  <Text style={[
                    styles.typeFilterButtonText,
                    typeFilter === type && styles.typeFilterButtonTextActive
                  ]}>
                    {typeLabels[type]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0D7FF2" />
            <Text style={styles.loadingText}>Fetching history...</Text>
          </View>
        ) : (
          <ScrollView 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={() => fetchHistory(true)} 
                colors={['#0D7FF2']}
                tintColor="#0D7FF2"
              />
            }
          >
            {mergedTimeline.length === 0 ? renderEmptyState() : (
              mergedTimeline.map((item, idx) => (
                <ActivityCard key={item._id || idx} item={item} />
              ))
            )}

            {mergedTimeline.length > 0 && (
              <Text style={styles.footerText}>Showing {mergedTimeline.length} activities</Text>
            )}
          </ScrollView>
        )}
        
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
    backgroundColor: '#F8FAFC',
  },
  topCurvedBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
    backgroundColor: '#0D7FF2',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    marginTop: 10,
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
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  filtersWrapper: {
    marginTop: 15,
    marginBottom: 10,
  },
  dateFilterScroll: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  dateFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  dateFilterButtonActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  dateFilterButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E0F2FE',
  },
  dateFilterButtonTextActive: {
    color: '#0D7FF2',
  },
  typeFilterContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    marginHorizontal: 20,
    borderRadius: 14,
    padding: 3,
    marginTop: 5,
  },
  typeFilterButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 11,
  },
  typeFilterButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  typeFilterButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  typeFilterButtonTextActive: {
    color: '#0D7FF2',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 110,
    paddingTop: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  imageAndTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  cardStationImage: {
    width: 44,
    height: 44,
    borderRadius: 12,
    marginRight: 12,
  },
  cardStationImagePlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 12,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleTextContainer: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  datetime: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '600',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 2,
  },
  detailsLocationText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  statBox: {
    width: (width - 76) / 3,
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  statValueMain: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 1,
  },
  paymentDetailsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  paymentDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentDetailLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '700',
  },
  paymentDetailVal: {
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '800',
  },
  paymentIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 6,
  },
  paymentIdLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    width: 95,
  },
  paymentIdVal: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
    fontFamily: 'System',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  completedBadge: {
    backgroundColor: '#10B981',
  },
  activeBadge: {
    backgroundColor: '#F59E0B',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  footerText: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 10,
    marginBottom: 20,
    fontWeight: '700',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    fontWeight: '600',
  },
  emptyActionBtn: {
    backgroundColor: '#0D7FF2',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
