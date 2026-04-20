import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withSpring,
  Easing,
  cancelAnimation,
  interpolate,
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
  const [percent, setPercent] = useState(56);
  const [isPaused, setIsPaused] = useState(false);

  const batteryBreath = useSharedValue(1);
  const labelPhase = useSharedValue(0);
  const percentPop = useSharedValue(1);

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

  // Simulate charging progress if not paused
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused) {
        setPercent(prev => {
          if (prev < 100) {
            const next = prev + 1;
            return next;
          }
          return prev;
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused]);

  useEffect(() => {
    return () => {
      cancelAnimation(batteryBreath);
      cancelAnimation(labelPhase);
    };
  }, [batteryBreath, labelPhase]);

  const batteryWrapStyle = useAnimatedStyle(() => ({
    transform: [{ scale: batteryBreath.value }],
  }));

  const percentRowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: percentPop.value }],
  }));

  const chargingLabelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(labelPhase.value, [0, 0.5, 1], [0.45, 1, 0.45]),
  }));

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.topCurvedBg} />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={26} color="#1E293B" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsBtn}>
            <Ionicons name="settings-sharp" size={24} color="#1E293B" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.carInfoSection}>
            <View style={styles.carLogoContainer}>
               <Image source={require('../assets/images/hero-car.png')} style={styles.carLogo} resizeMode="cover" />
            </View>
            <Text style={styles.carName}>Tata Nexon EV</Text>
            <View style={styles.chargingBadge}>
              <Text style={styles.chargingBadgeText}>Charging in progress</Text>
            </View>
            <View style={styles.activeRow}>
              <View style={[styles.activeDot, { backgroundColor: isPaused ? '#94A3B8' : '#3B82F6' }]} />
              <Text style={styles.activeText}>{isPaused ? 'Passed' : 'Active'}</Text>
            </View>
          </View>

          <View style={styles.chipsContainer}>
            <StatusChip icon="checkmark-circle-outline" label="ALIGNMENT: OK" color="#6366F1" />
            <StatusChip icon="shield-checkmark-outline" label="FOD: OK" color="#6366F1" />
          </View>
          <View style={{ alignItems: 'center', marginTop: 12 }}>
            <StatusChip icon="thermometer" label="THERMAL: OK" color="#0D7FF2" />
          </View>

          <View style={styles.progressSection}>
            <View style={styles.ringContainer}>
              <View style={styles.centerHub}>
                <Animated.View style={[styles.centerBatteryWrap, batteryWrapStyle]}>
                  <BatteryGlyph percent={percent} percentRowAnimatedStyle={percentRowStyle} />
                </Animated.View>
                <Animated.View style={chargingLabelStyle}>
                  <Text style={styles.chargingLabel}>CHARGING</Text>
                </Animated.View>
              </View>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <StatItem icon="flash" value="150 kW" label="POWER" />
            <StatItem icon="car-electric" value="150 kW" label="USED" />
            <StatItem icon="clock-outline" value="10 min" label="LEFT" />
          </View>

          <View style={styles.summaryCard}>
             <View style={styles.summaryCol}>
                <Text style={styles.summaryLabel}>Estimated Cost</Text>
                <Text style={styles.summaryValue}>₹450.00</Text>
             </View>
             <View style={styles.divider} />
             <View style={styles.summaryCol}>
                <Text style={styles.summaryLabel}>Session Duration</Text>
                <Text style={styles.summaryValue}>4 min</Text>
             </View>
          </View>

          <View style={styles.controls}>
             <TouchableOpacity style={styles.pauseBtn} onPress={() => setIsPaused(!isPaused)}>
                <Ionicons name={isPaused ? "play-circle" : "pause-circle"} size={26} color="#1D4ED8" style={{ marginRight: 8 }} />
                <Text style={styles.pauseBtnText}>{isPaused ? "Resume Charging" : "Pause Charging"}</Text>
             </TouchableOpacity>
             <TouchableOpacity style={styles.stopBtn} onPress={() => router.push({ pathname: '/completed', params: { percent } })}>
                <Ionicons name="stop-circle" size={26} color="#1D4ED8" style={{ marginRight: 8 }} />
                <Text style={styles.stopBtnText}>Stop Charging</Text>
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
    fontSize: 24,
    fontWeight: '900',
    color: '#1E293B',
    marginTop: 14,
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
    fontWeight: '800',
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
