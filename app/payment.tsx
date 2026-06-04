import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createOrder, openCheckout, verifyPayment } from './services/payment';

const { width } = Dimensions.get('window');

const PaymentOption = ({ 
  id, 
  title, 
  subtitle, 
  icon, 
  selected, 
  onSelect 
}: { 
  id: string, 
  title: string, 
  subtitle: string, 
  icon: any, 
  selected: boolean, 
  onSelect: () => void 
}) => {
  return (
    <TouchableOpacity 
      style={[styles.optionCard, selected && styles.optionCardSelected]} 
      onPress={onSelect}
      activeOpacity={0.8}
    >
      <View style={styles.optionLeft}>
        <View style={[styles.iconBox, selected && styles.iconBoxSelected]}>
           <MaterialCommunityIcons name={icon} size={24} color={selected ? "#0D7FF2" : "#94A3B8"} />
        </View>
        <View style={styles.optionTextCol}>
          <Text style={[styles.optionTitle, selected && styles.optionTitleSelected]}>{title}</Text>
          <Text style={styles.optionSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <View style={[styles.radioCircle, selected && styles.radioCircleSelected]}>
        {selected && <View style={styles.radioDot} />}
      </View>
    </TouchableOpacity>
  );
};

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    stationId?: string;
    stationName?: string;
    location?: string;
    connectorId?: string;
    basePricePerKwh?: string;
    tax?: string;
    convenienceFee?: string;
    connectorType?: string;
    image?: string;
  }>();

  const stationId = params.stationId as string;
  const basePricePerKwh = Number(params.basePricePerKwh || '15');
  const tax = Number(params.tax || '0');
  const convenienceFee = Number(params.convenienceFee || '0');
  const connectorId = params.connectorId || '1';

  const [estimatedEnergy, setEstimatedEnergy] = useState<number>(10); // Default 10 kWh
  const [selectedMethod, setSelectedMethod] = useState('cards');
  const [isProcessing, setIsProcessing] = useState(false);

  // Billing calculations (flat tax & fee per backend spec)
  const energyCost = estimatedEnergy * basePricePerKwh;
  const estimatedTotal = energyCost + tax + convenienceFee;

  const handlePayAndStart = async () => {
    if (!stationId) {
      Alert.alert('Error', 'Invalid station information.');
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Fetch user data for prefill
      const storedUserData = await AsyncStorage.getItem('userData');
      const user = storedUserData ? JSON.parse(storedUserData) : {};

      // 2. Create Order on Backend
      console.log(`[Payment] Creating Razorpay order for station: ${stationId}, energy: ${estimatedEnergy} kWh`);
      const orderData: any = await createOrder(stationId, estimatedEnergy);

      // 3. Setup Razorpay Options
      const options = {
        description: `Charge Hub Pre-Pay for Connector ${connectorId} at ${params.stationName}`,
        image: 'https://cdn.razorpay.com/logos/FFvI01fF4d0Kud_original.png',
        currency: orderData.currency,
        key: orderData.keyId,
        amount: orderData.amountInPaise,
        name: 'EV Charge Hub',
        order_id: orderData.orderId,
        prefill: {
          email: user.email || '',
          contact: user.mobile || '',
          name: user.name || '',
        },
        theme: { color: '#0D7FF2' }
      };

      // 4. Trigger checkout modal (simulated or real)
      const paymentResult: any = await openCheckout(options);

      // 5. Verify payment & Start session via single backend gate
      console.log('[Payment] Verifying signature and starting session...', paymentResult);
      const verificationResponse: any = await verifyPayment(paymentResult);

      const session = verificationResponse.session;
      const sessionId = session?._id || session?.sessionId;

      if (sessionId) {
        // Save active session locally
        await AsyncStorage.setItem('activeSessionId', sessionId);
        await AsyncStorage.setItem('activeStationId', stationId);
        
        // Navigate directly to success page
        router.push({
          pathname: '/payment_success',
          params: {
            sessionId: sessionId,
            stationId: stationId,
            stationName: params.stationName,
            paymentId: verificationResponse.payment?.paymentId || paymentResult.razorpay_payment_id,
            orderId: orderData.orderId,
            amountPaid: String(estimatedTotal.toFixed(2)),
            image: params.image || ''
          }
        });
      } else {
        Alert.alert('Verification Failed', 'Payment was successful but we could not establish a charging session. Please contact support.');
      }
    } catch (err: any) {
      console.error('[Payment] Error during pay and start charging:', err);
      const errMsg = err.response?.data?.error || err.message || 'Payment or charging start failed.';
      Alert.alert('Payment / Start Failed', errMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} disabled={isProcessing}>
            <Ionicons name="arrow-back" size={26} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Estimated Billing</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Station Summary Card */}
          <View style={styles.stationCard}>
            <Text style={styles.stationName}>{params.stationName || 'Charging Station'}</Text>
            <Text style={styles.stationLocation}>{params.location || 'Location details'}</Text>
            <View style={styles.connectorBadge}>
              <Ionicons name="flash" size={14} color="#0D7FF2" style={{ marginRight: 4 }} />
              <Text style={styles.connectorBadgeText}>
                Slot #{connectorId} • {params.connectorType || 'Type 2'}
              </Text>
            </View>
          </View>

          {/* Energy Estimate Selector */}
          <Text style={styles.sectionTitle}>Select Estimated Energy</Text>
          <View style={styles.energySelector}>
            {[10, 20, 30, 45].map((kwh) => (
              <TouchableOpacity
                key={kwh}
                style={[styles.energyBtn, estimatedEnergy === kwh && styles.energyBtnSelected]}
                onPress={() => setEstimatedEnergy(kwh)}
                disabled={isProcessing}
              >
                <Text style={[styles.energyBtnText, estimatedEnergy === kwh && styles.energyBtnTextSelected]}>
                  {kwh} kWh
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Billing Breakdown */}
          <Text style={styles.sectionTitle}>Price Summary (Pre-Paid)</Text>
          <View style={styles.detailsCard}>
             <View style={styles.detailRow}>
               <Text style={styles.detailLabel}>Estimated Energy</Text>
               <Text style={styles.detailValue}>{estimatedEnergy} kWh</Text>
             </View>
             <View style={styles.detailRow}>
               <Text style={styles.detailLabel}>Price per kWh</Text>
               <Text style={styles.detailValue}>₹{basePricePerKwh.toFixed(2)}</Text>
             </View>
             <View style={styles.detailRow}>
               <Text style={styles.detailLabel}>Energy Cost</Text>
               <Text style={styles.detailValue}>₹{energyCost.toFixed(2)}</Text>
             </View>
             <View style={styles.detailRow}>
               <Text style={styles.detailLabel}>Convenience Fee</Text>
               <Text style={styles.detailValue}>₹{convenienceFee.toFixed(2)}</Text>
             </View>
             <View style={styles.detailRow}>
               <Text style={styles.detailLabel}>Estimated Tax</Text>
               <Text style={styles.detailValue}>₹{tax.toFixed(2)}</Text>
             </View>
             <View style={[styles.detailRow, { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 }]}>
               <Text style={styles.totalLabel}>Estimated Total</Text>
               <Text style={styles.totalValue}>₹{estimatedTotal.toFixed(2)}</Text>
             </View>
          </View>

          {/* Payment Method */}
          <Text style={styles.sectionTitle}>Payment Method</Text>
          
          <PaymentOption 
             id="cards"
             title="Razorpay Secure"
             subtitle="UPI, Cards, Wallets or NetBanking"
             icon="credit-card-outline"
             selected={selectedMethod === 'cards'}
             onSelect={() => setSelectedMethod('cards')}
          />

          <PaymentOption 
             id="wallet"
             title="EV Wallet"
             subtitle="Balance: ₹ 1,240.00"
             icon="wallet-outline"
             selected={selectedMethod === 'wallet'}
             onSelect={() => setSelectedMethod('wallet')}
          />

        </ScrollView>
        
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.payBtn, isProcessing && styles.payBtnDisabled]} 
            onPress={handlePayAndStart}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.payBtnText}>Pay & Start Charging Session</Text>
            )}
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E2E8F0', // Sleek light grey background
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
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingBottom: 140,
  },
  stationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  stationName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  stationLocation: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
    fontWeight: '500',
  },
  connectorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  connectorBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 14,
    marginLeft: 4,
  },
  energySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
  },
  energyBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  energyBtnSelected: {
    borderColor: '#0D7FF2',
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
  },
  energyBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  energyBtnTextSelected: {
    color: '#0D7FF2',
    fontWeight: '800',
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
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
  totalLabel: {
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '800',
  },
  totalValue: {
    fontSize: 20,
    color: '#0D7FF2',
    fontWeight: '900',
  },
  optionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  optionCardSelected: {
    borderColor: '#0D7FF2',
    backgroundColor: '#F0F7FF',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconBoxSelected: {
    backgroundColor: '#DBEAFE',
  },
  optionTextCol: {
    justifyContent: 'center',
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 4,
  },
  optionTitleSelected: {
    color: '#0F172A',
  },
  optionSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94A3B8',
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: '#0D7FF2',
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0D7FF2',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: width,
    paddingHorizontal: 22,
    paddingBottom: 30,
    paddingTop: 10,
    backgroundColor: '#E2E8F0',
  },
  payBtn: {
    width: '100%',
    height: 64,
    backgroundColor: '#0D7FF2',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#0D7FF2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  payBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  payBtnText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
