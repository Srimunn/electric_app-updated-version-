import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { stopSession, getImageUrl } from './services/api';
import { useRealtime } from '../context/RealtimeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const StatusChip = ({ icon, label, color }: { icon: any, label: string, color: string }) => (
  <View style={styles.statusChip}>
    <Ionicons name={icon} size={16} color={color} style={{ marginRight: 6 }} />
    <Text style={styles.statusChipText}>{label}</Text>
  </View>
);

const StatItem = ({ icon, value, label }: { icon: any, value: string, label: string }) => (
  <View style={styles.statBox}>
    <View style={styles.statIconContainer}>
      <MaterialCommunityIcons name={icon} size={26} color="#0D7FF2" />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

function BatteryGlyph({
  percent,
  percentRowAnimatedStyle,
}: {
  percent: number;
  percentRowAnimatedStyle: { transform: { scale: number }[] } & Record<string, unknown>;
}) {
  const [trackHeight, setTrackHeight] = React.useState(0);
  const level = Math.min(100, Math.max(0, percent));
  const fillH =
    trackHeight > 0 && level > 0 ? Math.max((trackHeight * level) / 100, 3) : 0;
  const textOnFill = level >= 52;
  return (
    <View style={styles.batteryGlyphRoot}>
      <View style={styles.batteryGlyphNub} />
      <View style={styles.batteryGlyphShell}>
        <View
          style={styles.batteryGlyphTrack}
          onLayout={(e) => setTrackHeight(e.nativeEvent.layout.height)}
        >
          {fillH > 0 ? (
            <LinearGradient
              colors={['#1E40AF', '#0D7FF2', '#38BDF8']}
              locations={[0, 0.5, 1]}
              start={{ x: 0.5, y: 1 }}
              end={{ x: 0.5, y: 0 }}
              style={[styles.batteryGlyphFill, { height: fillH }]}
            />
          ) : null}
          <Animated.View
            style={[styles.batteryPercentOverlay, percentRowAnimatedStyle]}
            pointerEvents="none"
          >
            <Text
              style={[
                styles.batteryPercentNum,
                textOnFill ? styles.batteryPercentNumLight : styles.batteryPercentNumDark,
              ]}
            >
              {percent}
            </Text>
            <Text
              style={[
                styles.batteryPercentSym,
                textOnFill ? styles.batteryPercentSymLight : styles.batteryPercentSymDark,
              ]}
            >
              %
            </Text>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

export default function ChargingStartScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ sessionId?: string, stationId?: string, stationName?: string, image?: string }>();
  const { lastUpdate, joinStation, leaveStation } = useRealtime();
  
  const [percent, setPercent] = useState(0);
  const [stats, setStats] = useState({
    power: 0,
    voltage: 0,
    current: 0,
    temperature: 0,
    energy: 0,
  });
  
  const [isPaused, setIsPaused] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);

  const batteryBreath = useSharedValue(1);
  const labelPhase = useSharedValue(0);
  const percentPop = useSharedValue(1);

  // Join station room for real-time updates
  useEffect(() => {
    if (params.stationId) {
      joinStation(params.stationId);
    }
    return () => {
      if (params.stationId) {
        leaveStation(params.stationId);
      }
    };
  }, [params.stationId]);

  const hasReceivedSocketUpdates = useRef(false);

  // Handle real-time updates
  useEffect(() => {
    if (lastUpdate && lastUpdate.stationId === params.stationId) {
      hasReceivedSocketUpdates.current = true;
      setStats({
        power: lastUpdate.power || 0,
        voltage: lastUpdate.voltage || 0,
        current: lastUpdate.current || 0,
        temperature: lastUpdate.temperature || 0,
        energy: lastUpdate.energyConsumed || 0,
      });
      // Logic for battery percentage (mocked or from telemetry if available)
      if (lastUpdate.soc !== undefined) {
        setPercent(lastUpdate.soc);
      } else {
        // Increment slowly if not provided
        setPercent(prev => Math.min(100, prev + (isPaused ? 0 : 0.1)));
      }
    }
  }, [lastUpdate, isPaused]);

  // Local telemetry simulation when offline/no socket updates are active
  useEffect(() => {
    if (hasReceivedSocketUpdates.current) return;

    // Initialize with realistic charging telemetry starting values if currently 0
    setStats((prev) => {
      if (prev.voltage === 0) {
        return {
          power: 45.8,
          voltage: 380.0,
          current: 120.5,
          temperature: 32.5,
          energy: 0.0,
        };
      }
      return prev;
    });

    const interval = setInterval(() => {
      if (!isPaused) {
        setStats((prev) => {
          const powerOffset = (Math.random() - 0.5) * 1.5;
          const power = Math.max(20, Math.min(150, prev.power + powerOffset));
          const voltage = 380 + (Math.random() - 0.5) * 8;
          const current = (power * 1000) / voltage;
          const temperature = Math.min(65, prev.temperature + 0.03);
          const energy = prev.energy + (power / 3600); // 1 sec power to kWh conversion
          return { power, voltage, current, temperature, energy };
        });

        setPercent((prev) => {
          if (prev >= 100) return 100;
          return Math.min(100, prev + 1);
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused]);

  // Session duration timer
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isPaused) {
        setSessionDuration(prev => prev + 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const runChargingMicroAnimations = () => {
    cancelAnimation(batteryBreath);
    cancelAnimation(labelPhase);
    batteryBreath.value = withRepeat(
      withSequence(
        withTiming(1.09, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    labelPhase.value = withRepeat(
      withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.sin) }),
      -1,
      false
    );
  };

  useEffect(() => {
    if (isPaused) {
      cancelAnimation(batteryBreath);
      cancelAnimation(labelPhase);
      batteryBreath.value = withTiming(1, { duration: 320, easing: Easing.out(Easing.cubic) });
      labelPhase.value = withTiming(0.35, { duration: 320 });
    } else {
      runChargingMicroAnimations();
    }
  }, [isPaused]);

  const handleStopCharging = () => {
    Alert.alert(
      'Confirm Stop',
      'Are you sure you want to stop the charging session?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Stop Charging', style: 'destructive', onPress: performStopCharging }
      ],
      { cancelable: true }
    );
  };

  const performStopCharging = async () => {
    setIsStopping(true);
    try {
      const sessionId = params.sessionId || await AsyncStorage.getItem('activeSessionId');
      if (sessionId) {
        await stopSession(sessionId);
        await AsyncStorage.setItem('lastSessionId', sessionId);
        await AsyncStorage.removeItem('activeSessionId');
        await AsyncStorage.removeItem('activeStationId');
      }
      router.replace({ 
        pathname: '/completed', 
        params: { 
          percent: Math.round(percent), 
          energy: stats.energy.toFixed(2),
          duration: formatTime(sessionDuration),
          sessionId: sessionId || ''
        } 
      });
    } catch (err: any) {
      console.log('Failed to stop session', err);
      Alert.alert('Error', err.response?.data?.message || 'Failed to stop session');
    } finally {
      setIsStopping(false);
    }
  };

  const handleAutoStopAt100 = async () => {
    setIsStopping(true);
    try {
      const sessionId = params.sessionId || await AsyncStorage.getItem('activeSessionId');
      if (sessionId) {
        await stopSession(sessionId);
        await AsyncStorage.setItem('lastSessionId', sessionId);
        await AsyncStorage.removeItem('activeSessionId');
        await AsyncStorage.removeItem('activeStationId');
      }
      Alert.alert('Charging Complete', 'Your battery has reached 100%. Redirecting to history.');
      router.replace('/history');
    } catch (err) {
      console.log('Failed to auto stop session', err);
      router.replace('/history');
    } finally {
      setIsStopping(false);
    }
  };

  useEffect(() => {
    if (percent >= 100 && !isStopping) {
      handleAutoStopAt100();
    }
  }, [percent]);

  const didMountPercent = useRef(false);
  useEffect(() => {
    if (!didMountPercent.current) {
      didMountPercent.current = true;
      return;
    }
    percentPop.value = withSequence(
      withSpring(1.06, { damping: 14, stiffness: 380 }),
      withSpring(1, { damping: 18, stiffness: 260 })
    );
  }, [percent, percentPop]);

  const batteryWrapStyle = useAnimatedStyle(() => ({
    transform: [{ scale: batteryBreath.value }],
  }));

  const percentRowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: percentPop.value }],
  }));

  const chargingLabelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(labelPhase.value, [0, 0.5, 1], [0.45, 1, 0.45]),
  }));

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.topCurvedBg} />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={26} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Active Session</Text>
          <TouchableOpacity style={styles.settingsBtn}>
            <Ionicons name="settings-sharp" size={24} color="#1E293B" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.carInfoSection}>
            <View style={styles.carLogoContainer}>
               {params.image ? (
                 <Image 
                   source={{ uri: params.image.startsWith('http') ? params.image : getImageUrl(params.image) }} 
                   style={styles.carLogo} 
                   resizeMode="cover" 
                 />
               ) : (
                 <Image source={require('../assets/images/nexon.png')} style={styles.carLogo} resizeMode="cover" />
               )}
            </View>
            <Text style={styles.carName}>{params.stationName || 'EV Charging Station'}</Text>
            <View style={styles.chargingBadge}>
              <Text style={styles.chargingBadgeText}>Charging in progress</Text>
            </View>
            <View style={styles.activeRow}>
              <View style={[styles.activeDot, { backgroundColor: isPaused ? '#94A3B8' : '#3B82F6' }]} />
              <Text style={styles.activeText}>{isPaused ? 'Paused' : 'Active'}</Text>
            </View>
          </View>

          <View style={styles.chipsContainer}>
            <StatusChip icon="flash-outline" label={`${stats.voltage.toFixed(1)}V`} color="#6366F1" />
            <StatusChip icon="analytics-outline" label={`${stats.current.toFixed(1)}A`} color="#6366F1" />
          </View>
          <View style={{ alignItems: 'center', marginTop: 12 }}>
            <StatusChip icon="thermometer" label={`TEMP: ${stats.temperature.toFixed(1)}°C`} color="#0D7FF2" />
          </View>

          <View style={styles.progressSection}>
            <View style={styles.ringContainer}>
              <View style={styles.centerHub}>
                <Animated.View style={[styles.centerBatteryWrap, batteryWrapStyle]}>
                  <BatteryGlyph percent={Math.round(percent)} percentRowAnimatedStyle={percentRowStyle} />
                </Animated.View>
                <Animated.View style={chargingLabelStyle}>
                  <Text style={styles.chargingLabel}>{isPaused ? 'PAUSED' : 'CHARGING'}</Text>
                </Animated.View>
              </View>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <StatItem icon="flash" value={`${stats.power.toFixed(2)} kW`} label="LIVE POWER" />
            <StatItem icon="lightning-bolt" value={`${stats.energy.toFixed(2)} kWh`} label="ENERGY" />
            <StatItem icon="clock-outline" value={formatTime(sessionDuration)} label="DURATION" />
          </View>

          <View style={styles.summaryCard}>
             <View style={styles.summaryCol}>
                <Text style={styles.summaryLabel}>Estimated Cost</Text>
                <Text style={styles.summaryValue}>₹{(stats.energy * 15).toFixed(2)}</Text>
             </View>
             <View style={styles.divider} />
             <View style={styles.summaryCol}>
                <Text style={styles.summaryLabel}>Station ID</Text>
                <Text style={styles.summaryValue}>{params.stationId?.slice(-6) || 'N/A'}</Text>
             </View>
          </View>

          <View style={styles.controls}>
             <TouchableOpacity style={styles.pauseBtn} onPress={() => setIsPaused(!isPaused)}>
                <Ionicons name={isPaused ? "play-circle" : "pause-circle"} size={26} color="#1D4ED8" style={{ marginRight: 8 }} />
                <Text style={styles.pauseBtnText}>{isPaused ? "Resume Charging" : "Pause Charging"}</Text>
             </TouchableOpacity>
             <TouchableOpacity style={styles.stopBtn} onPress={handleStopCharging} disabled={isStopping}>
                {isStopping ? (
                   <ActivityIndicator color="#1D4ED8" style={{ marginRight: 8 }} />
                ) : (
                   <Ionicons name="stop-circle" size={26} color="#1D4ED8" style={{ marginRight: 8 }} />
                )}
                <Text style={styles.stopBtnText}>{isStopping ? 'Stopping...' : 'Stop Charging'}</Text>
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
    backgroundColor: '#FFFFFF',
  },
  topCurvedBg: {
    position: 'absolute',
    top: 0,
    width: width,
    height: 320,
    backgroundColor: '#F1F5F9',
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
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
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  carInfoSection: {
    alignItems: 'center',
    marginTop: 10,
  },
  carLogoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    overflow: 'hidden',
  },
  carLogo: {
    width: '100%',
    height: '100%',
  },
  carName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1E293B',
    marginTop: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  chargingBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 10,
  },
  chargingBadgeText: {
    fontSize: 13,
    color: '#1D4ED8',
    fontWeight: '700',
  },
  activeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  activeText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '800',
  },
  chipsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 25,
    paddingHorizontal: 20,
  },
  statusChip: {
    backgroundColor: 'white',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E293B',
  },
  progressSection: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 30,
  },
  ringContainer: {
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerHub: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  centerBatteryWrap: {
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  batteryGlyphRoot: {
    alignItems: 'center',
  },
  batteryGlyphNub: {
    width: 32,
    height: 16,
    borderRadius: 2,
    backgroundColor: '#0D7FF2',
    marginBottom: 4,
  },
  batteryGlyphShell: {
    width: 116,
    height: 142,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: '#0D7FF2',
    padding: 8,
    backgroundColor: '#F8FAFC',
  },
  batteryGlyphTrack: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
    position: 'relative',
  },
  batteryGlyphFill: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  batteryPercentOverlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  batteryPercentNum: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -1,
  },
  batteryPercentNumLight: {
    color: '#FFFFFF',
    textShadowColor: 'rgba(15, 23, 42, 0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  batteryPercentNumDark: {
    color: '#0F172A',
    textShadowColor: 'rgba(255, 255, 255, 0.85)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 2,
  },
  batteryPercentSym: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 2,
    marginTop: 5,
  },
  batteryPercentSymLight: {
    color: 'rgba(255,255,255,0.92)',
    textShadowColor: 'rgba(15, 23, 42, 0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  batteryPercentSymDark: {
    color: '#475569',
    textShadowColor: 'rgba(255, 255, 255, 0.75)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 1,
  },
  chargingLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 3.2,
    marginTop: 0,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 22,
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  statBox: {
    width: (width - 64) / 3,
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
  },
  statIconContainer: {
    marginBottom: 10,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1E293B',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    marginTop: 4,
  },
  summaryCard: {
    marginHorizontal: 22,
    backgroundColor: '#F1F5F9',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  summaryCol: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1E293B',
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: '#CBD5E1',
    marginHorizontal: 20,
  },
  controls: {
    paddingHorizontal: 22,
    gap: 16,
  },
  pauseBtn: {
    width: '100%',
    height: 70,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseBtnText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  stopBtn: {
    width: '100%',
    height: 70,
    borderRadius: 24,
    backgroundColor: '#DBEAFE',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopBtnText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1D4ED8',
  },
});
