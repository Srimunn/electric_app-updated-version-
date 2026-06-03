import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

/**
 * BRAND COLORS:
 * Grey: #DADBDF
 * Blue: #0D7FF2
 * Black/White
 */

export default function ParkingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const progressAnim = useRef(new Animated.Value(0.25)).current;

  const player = useVideoPlayer(require('../assets/images/animation.mp4'), (p) => {
    p.loop = true;
    p.play();
    p.muted = true;
  });

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setStep(2);
      Animated.timing(progressAnim, { toValue: 0.65, duration: 600, useNativeDriver: false }).start();
    }, 2000);

    const timer2 = setTimeout(() => {
      setStep(3);
      Animated.timing(progressAnim, { toValue: 1, duration: 600, useNativeDriver: false }).start();
    }, 4000);

    return () => { clearTimeout(timer1); clearTimeout(timer2); };
  }, []);

  const getStepText = () => {
    switch(step) {
      case 1:
        return { main: "Move Forward 2.5 meters", sub: "Approaching pad...", icon: "information" };
      case 2:
        return { main: "Move Left 0.4 meters", sub: "Aligning laterally...", icon: "information" };
      default:
        return { main: "Alignment Achieved", sub: "✓ Perfect alignment!", icon: "chevron-double-right" };
      
    }
  };

  const stepData = getStepText();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.topCurvedBg} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name={step >= 3 ? "arrow-back" : "close"} size={26} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Parking Alignment</Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.content}>
          <Text style={styles.instructionSmall}>Follow the guidance to position your vehicle</Text>
          
          <View style={styles.visualizationContainer}>
            <View style={styles.alignmentImageContainer}>
              <VideoView
                player={player}
                style={styles.parkingVideo}
                contentFit="cover"
              />
            </View>
          </View>

          <View style={styles.statusCard}>
            <View style={styles.statusTextRow}>
              <View>
                <Text style={[styles.statusMain, step >= 3 && styles.statusMainPerfect]}>{stepData.main}</Text>
                <Text style={styles.statusSub}>{stepData.sub}</Text>
              </View>
              <MaterialCommunityIcons name={stepData.icon as any} size={28} color="#0D7FF2" />
            </View>
            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressFill, { width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity disabled={step < 3} style={[styles.primaryBtn, step < 3 && styles.primaryBtnDisabled]} onPress={() => router.push('/safety')}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.primaryBtnText}>Start Charging</Text>
                <MaterialCommunityIcons name="flash" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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
    backgroundColor: '#dadbdf',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 22,
    alignItems: 'center',
  },
  instructionSmall: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 30,
  },
  visualizationContainer: {
    width: width - 44,
    height: 240,
    borderRadius: 0,
    overflow: 'visible',
    backgroundColor: 'transparent',
    marginTop: height * 0.02, // Adjusted to be slightly higher (3% instead of 5%)
    marginBottom: 25,
    elevation: 0,
    shadowOpacity: 0,
  },
  parkingVideo: {
    width: '100%',
    height: '100%',
  },
  alignmentImageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 0,
  },
  statusCard: {
    width: '100%',
    backgroundColor: '#EFF6FF',
    borderRadius: 30,
    padding: 25,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  statusTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  statusMain: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0D7FF2',
    marginBottom: 4,
  },
  statusMainPerfect: {
    color: '#0D7FF2',
  },
  statusSub: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  progressTrack: {
    width: '100%',
    height: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0D7FF2',
    borderRadius: 5,
  },
  footer: {
    width: '100%',
    position: 'absolute',
    bottom: 75,
  },
  primaryBtn: {
    width: '100%',
    height: 64,
    backgroundColor: '#0D7FF2',
    borderRadius: 22,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#0D7FF2',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  primaryBtnDisabled: {
    backgroundColor: '#A5C9F1',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryBtnText: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

