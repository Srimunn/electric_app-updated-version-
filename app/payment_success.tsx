import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, withDelay } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    sessionId?: string;
    stationId?: string;
    stationName?: string;
    paymentId?: string;
    orderId?: string;
    amountPaid?: string;
    image?: string;
  }>();

  // Animation values
  const scaleAnim = useSharedValue(0.5);
  const opacityAnim = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(30);

  useEffect(() => {
    // Checkmark animation
    scaleAnim.value = withSpring(1, { damping: 10, stiffness: 80 });
    opacityAnim.value = withTiming(1, { duration: 400 });

    // Text and button animation
    contentOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));
    contentTranslateY.value = withDelay(300, withSpring(0, { damping: 12, stiffness: 90 }));
  }, []);

  const checkmarkStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleAnim.value }],
      opacity: opacityAnim.value,
    };
  });

  const contentStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: contentTranslateY.value }],
      opacity: contentOpacity.value,
    };
  });

  const amountPaid = params.amountPaid || '0.00';
  const paymentId = params.paymentId || 'TXN-MOCK';
  const orderId = params.orderId || 'ORD-MOCK';
  const sessionId = params.sessionId;
  const stationId = params.stationId;
  const stationName = params.stationName || 'EV Charger';

  const handleStartCharging = () => {
    if (sessionId && stationId) {
      router.replace({
        pathname: '/charging_start',
        params: {
          sessionId: sessionId,
          stationId: stationId,
          stationName: stationName,
          image: params.image || ''
        }
      });
    } else {
      router.replace('/home');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Animated.View style={[styles.successIconContainer, checkmarkStyle]}>
             <View style={styles.successIconOuter}>
                <View style={styles.successIconInner}>
                   <Ionicons name="checkmark-sharp" size={48} color="#FFFFFF" />
                </View>
             </View>
          </Animated.View>

          <Animated.View style={[styles.textContent, contentStyle]}>
             <Text style={styles.title}>Payment Successful!</Text>
             <Text style={styles.subtitle}>
               ₹{amountPaid} has been authorized and pre-paid. Your charging session is ready to begin.
             </Text>

             <View style={styles.receiptCard}>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Payment ID</Text>
                    <Text style={styles.receiptValue}>{paymentId}</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Order ID</Text>
                    <Text style={styles.receiptValue}>{orderId}</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Charging Station</Text>
                    <Text style={styles.receiptValue} numberOfLines={1}>{stationName}</Text>
                  </View>
                  <View style={[styles.receiptRow, { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 }]}>
                    <Text style={styles.receiptLabel}>Total Paid</Text>
                    <Text style={styles.receiptHighlight}>₹{amountPaid}</Text>
                  </View>
             </View>
          </Animated.View>
        </View>

        <Animated.View style={[styles.footer, contentStyle]}>
           <TouchableOpacity style={styles.primaryBtn} onPress={handleStartCharging}>
              <Text style={styles.primaryBtnText}>Start Charging Session</Text>
              <Ionicons name="flash" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
           </TouchableOpacity>
        </Animated.View>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 22,
  },
  successIconContainer: {
    marginBottom: 30,
    shadowColor: '#0D7FF2',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  successIconOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIconInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0D7FF2', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContent: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
    marginBottom: 35,
  },
  receiptCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  receiptLabel: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  receiptValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '700',
  },
  receiptHighlight: {
    fontSize: 16,
    color: '#0D7FF2',
    fontWeight: '800',
  },
  footer: {
    paddingHorizontal: 22,
    paddingBottom: 30,
    paddingTop: 10,
  },
  primaryBtn: {
    width: '100%',
    height: 64,
    backgroundColor: '#0D7FF2',
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#0D7FF2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  primaryBtnText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
