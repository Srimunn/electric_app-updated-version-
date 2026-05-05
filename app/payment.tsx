import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

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
  const [selectedMethod, setSelectedMethod] = useState('cards');

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={26} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment & Invoice</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Total Amount Due Card */}
          <View style={styles.amountCard}>
             <Text style={styles.amountLabel}>TOTAL AMOUNT DUE</Text>
             <Text style={styles.amountValue}>₹ 450.00</Text>
             
             <View style={styles.energyBadge}>
               <Ionicons name="flash" size={14} color="#0D7FF2" style={{ marginRight: 4 }} />
               <Text style={styles.energyBadgeText}>22.5 kWh Delivered</Text>
             </View>
          </View>

          {/* Session Details */}
          <Text style={styles.sectionTitle}>Session Details</Text>
          <View style={styles.detailsCard}>
             <View style={styles.detailRow}>
               <Text style={styles.detailLabel}>Session ID</Text>
               <Text style={styles.detailValue}>#EV-8923401</Text>
             </View>
             <View style={styles.detailRow}>
               <Text style={styles.detailLabel}>Energy Delivered</Text>
               <Text style={styles.detailValue}>22.5 kWh</Text>
             </View>
             <View style={[styles.detailRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
               <Text style={styles.detailLabel}>Date & Time</Text>
               <Text style={styles.detailValue}>24 Oct 2023, 01:30pm</Text>
             </View>
          </View>

          {/* Payment Method */}
          <Text style={styles.sectionTitle}>Payment Method</Text>
          
          <PaymentOption 
             id="wallet"
             title="EV Wallet"
             subtitle="Balance: ₹ 1,240.00"
             icon="wallet-outline"
             selected={selectedMethod === 'wallet'}
             onSelect={() => setSelectedMethod('wallet')}
          />
          
          <PaymentOption 
             id="upi"
             title="UPI / QR"
             subtitle="Google Pay, PhonePe, Paytm"
             icon="qrcode-scan"
             selected={selectedMethod === 'upi'}
             onSelect={() => setSelectedMethod('upi')}
          />

          <PaymentOption 
             id="cards"
             title="Cards"
             subtitle="Debit or Credit Cards"
             icon="credit-card-outline"
             selected={selectedMethod === 'cards'}
             onSelect={() => setSelectedMethod('cards')}
          />

        </ScrollView>
        
        <View style={styles.footer}>
           <TouchableOpacity style={styles.payBtn} onPress={() => router.push('/payment_success')}>
              <Text style={styles.payBtnText}>Pay Now</Text>
           </TouchableOpacity>
        </View>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E2E8F0', // Light grey background
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
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingBottom: 140, // Increased to let users scroll past the fixed footer
  },
  amountCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 32,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  amountLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 12,
  },
  amountValue: {
    fontSize: 42,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 16,
  },
  energyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  energyBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 16,
    marginLeft: 4,
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
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
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailLabel: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '700',
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
    backgroundColor: '#E2E8F0', // Match background so it blends perfectly
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
  payBtnText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
