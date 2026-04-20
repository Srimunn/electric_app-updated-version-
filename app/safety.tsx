import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Dimensions, TouchableOpacity, Animated, Easing } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

const DiagnosticItem = ({ label, status, isCompleted }: { label: string, status: string, isCompleted: boolean }) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isCompleted) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotateAnim.stopAnimation();
    }
  }, [isCompleted]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.itemCard, isCompleted && styles.itemCardCompleted]}>
      <View style={styles.itemLeft}>
        <Animated.View style={!isCompleted ? { transform: [{ rotate: spin }] } : {}}>
          <Ionicons 
            name={isCompleted ? "checkmark-circle" : "sync-outline"} 
            size={24} 
            color={isCompleted ? "#0D7FF2" : "#4A90E2"} 
          />
        </Animated.View>
        <Text style={[styles.itemLabel, isCompleted && styles.itemLabelCompleted]}>{label}</Text>
      </View>
      <Text style={[styles.itemStatus, isCompleted && styles.itemStatusCompleted]}>
        {status}
      </Text>
    </View>
  );
};

export default function SafetyScreen() {
  const router = useRouter();
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Stage-based progression
    const timers = [
      setTimeout(() => setStage(1), 2000),
      setTimeout(() => setStage(2), 4000),
      setTimeout(() => setStage(3), 6000),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  const diagnostics = [
    { id: 1, label: "Foreign Object Detection" },
    { id: 2, label: "Thermal Safety" },
    { id: 3, label: "Proximity Sensors" },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={26} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Safety Diagnostics</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <View style={styles.iconBg}>
              <Ionicons name="shield-checkmark" size={40} color="#0D7FF2" />
            </View>
          </View>

          <Text style={styles.title}>Running Safety Checks</Text>
          <Text style={styles.subtitle}>Verifying system readiness before charging</Text>

          <View style={styles.itemsContainer}>
            {diagnostics.map((item, index) => (
              <DiagnosticItem 
                key={item.id}
                label={item.label}
                status={stage > index ? "PASSED" : "CHECKING..."}
                isCompleted={stage > index}
              />
            ))}
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={22} color="#94A3B8" style={{ marginRight: 12, marginTop: 2 }} />
            <Text style={styles.infoText}>
              System is calibrating alignment with the charging pad. Please ensure the vehicle remains stationary until the procedure is complete.
            </Text>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity 
              disabled={stage < 3}
              style={[styles.primaryBtn, stage < 3 && styles.primaryBtnDisabled]}
              onPress={() => router.push('/charging_start')}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons 
                  name="flash" 
                  size={20} 
                  color={stage < 3 ? "#94A3B8" : "#FFFFFF"} 
                  style={{ marginRight: 8 }} 
                />
                <Text style={[styles.primaryBtnText, stage < 3 && styles.primaryBtnTextDisabled]}>Proceed to Charging</Text>
              </View>
            </TouchableOpacity>
            <Text style={styles.versionText}>DIAGNOSTIC MODE V4.2.1</Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
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
    marginBottom: 20,
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
    fontWeight: '700',
    color: '#1E293B',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  iconContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  iconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 32,
  },
  itemsContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 32,
  },
  itemCard: {
    width: '100%',
    height: 64,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  itemCardCompleted: {
    borderColor: '#DBEAFE',
    backgroundColor: '#F8FAFC',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
    marginLeft: 12,
  },
  itemLabelCompleted: {
    color: '#1E293B',
  },
  itemStatus: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4A90E2',
    letterSpacing: 0.5,
  },
  itemStatusCompleted: {
    color: '#0D7FF2',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    fontWeight: '400',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
  },
  primaryBtn: {
    width: '100%',
    height: 60,
    backgroundColor: '#0D7FF2',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#0D7FF2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  primaryBtnDisabled: {
    backgroundColor: '#E2E8F0',
    elevation: 0,
    shadowOpacity: 0,
  },
  primaryBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  primaryBtnTextDisabled: {
    color: '#94A3B8',
  },
  versionText: {
    marginTop: 16,
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 1,
  },
});
