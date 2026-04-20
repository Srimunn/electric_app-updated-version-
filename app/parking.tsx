import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Image, SafeAreaView, Dimensions, TouchableOpacity, Animated } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

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
  const progressAnim = useRef(new Animated.Value(0.33)).current;
  const carTranslateY = useRef(new Animated.Value(160)).current;
  const carTranslateX = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.timing(carTranslateY, { toValue: 80, duration: 2000, useNativeDriver: true }).start();
    const timer1 = setTimeout(() => {
      setStep(2);
      Animated.parallel([
        Animated.timing(progressAnim, { toValue: 0.66, duration: 1000, useNativeDriver: false }),
        Animated.timing(carTranslateX, { toValue: 0, duration: 2000, useNativeDriver: true }),
        Animated.timing(carTranslateY, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ]).start();
    }, 2500);
    const timer2 = setTimeout(() => {
      setStep(3);
      Animated.timing(progressAnim, { toValue: 1, duration: 1000, useNativeDriver: false }).start();
    }, 5000);
    return () => { clearTimeout(timer1); clearTimeout(timer2); };
  }, []);

  const getStepText = () => {
    switch(step) {
      case 1: return { main: "Move forward 2.5 meters", sub: "Adjusting Position....", icon: "information" };
      case 2: return { main: "Move left 0.4 meters", sub: "Adjusting Position....", icon: "information" };
      case 3: return { main: "Perfect alignment achieved", sub: "Ready to Charge", icon: "chevron-double-right" };
      default: return { main: "Loading...", sub: "Please wait", icon: "help-circle-outline" };
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
            <Ionicons name={step === 3 ? "arrow-back" : "close"} size={26} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Parking Alignment</Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.content}>
          <Text style={styles.instructionSmall}>Follow the guidance to position your vehicle</Text>
          <View style={styles.visualizationContainer}>
            <Animated.View style={[styles.alignmentImageContainer, { transform: [{ translateX: carTranslateX }, { translateY: carTranslateY }] }]}>
              <Image source={require('../assets/images/hero-car.png')} style={styles.alignmentImage} resizeMode="contain" />
            </Animated.View>
            <View style={[styles.alignmentBox, step === 3 && styles.alignmentBoxPerfect]}>
              {step === 3 ? (
                <View style={styles.perfectBadge}>
                  <Ionicons name="checkmark-circle" size={40} color="#FFFFFF" />
                </View>
              ) : null}
            </View>
          </View>
          <View style={styles.statusCard}>
            <View style={styles.statusTextRow}>
              <View>
                <Text style={[styles.statusMain, step === 3 && styles.statusMainPerfect]}>{stepData.main}</Text>
                <Text style={styles.statusSub}>{stepData.sub}</Text>
              </View>
              <MaterialCommunityIcons name={stepData.icon as any} size={28} color="#0D7FF2" />
            </View>
            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressFill, { width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
            </View>
          </View>
          <View style={styles.footer}>
            <TouchableOpacity disabled={step !== 3} style={[styles.primaryBtn, step !== 3 && styles.primaryBtnDisabled]} onPress={() => router.push('/safety')}>
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
    height: 380,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#000000',
    marginTop: height * 0.02, // Adjusted to be slightly higher (3% instead of 5%)
    marginBottom: 25,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  alignmentImageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alignmentImage: {
    width: '110%', // Slightly larger for better coverage
    height: '110%',
  },
  alignmentBox: {
    position: 'absolute',
    top: '30%',
    left: '15%',
    right: '15%',
    bottom: '25%',
    borderWidth: 2,
    borderColor: '#0D7FF2',
    borderRadius: 20,
    backgroundColor: 'rgba(13, 127, 242, 0.1)',
  },
  alignmentBoxPerfect: {
    borderColor: '#0D7FF2',
    backgroundColor: 'rgba(13, 127, 242, 0.1)',
    borderWidth: 4,
  },
  perfectBadge: {
    position: 'absolute',
    top: -20,
    alignSelf: 'center',
    backgroundColor: '#0D7FF2',
    borderRadius: 25,
    padding: 2,
    elevation: 8,
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
    bottom: 60,
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
