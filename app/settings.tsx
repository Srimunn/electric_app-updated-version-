import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

const SettingsOption = ({ 
  icon, 
  title, 
  subtitle, 
  isLast = false, 
  hideCaret = false,
  onPress 
}: { 
  icon: any, 
  title: string, 
  subtitle?: string, 
  isLast?: boolean, 
  hideCaret?: boolean,
  onPress?: () => void 
}) => (
  <TouchableOpacity style={[styles.optionRow, !isLast && styles.optionBorder]} onPress={onPress}>
    <View style={styles.optionIconBox}>
      <Ionicons name={icon} size={22} color="#0D7FF2" />
    </View>
    <View style={styles.optionTextCenter}>
      <Text style={styles.optionTitle}>{title}</Text>
      {subtitle && <Text style={styles.optionSubtitle}>{subtitle}</Text>}
    </View>
    {!hideCaret && <Ionicons name="chevron-forward" size={20} color="#94A3B8" />}
  </TouchableOpacity>
);

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={26} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* User Profile Summary */}
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarBorder}>
                 <Ionicons name="person" size={60} color="#0D7FF2" />
              </View>
              <View style={styles.editAvatarBadge}>
                <Ionicons name="pencil" size={12} color="#FFFFFF" />
              </View>
            </View>
            <Text style={styles.userName}>Srimun S S</Text>
            <Text style={styles.userVehicle}>Model 3 Long Range</Text>
          </View>

          {/* Section: Charging */}
          <Text style={styles.sectionLabel}>CHARGING</Text>
          <View style={styles.card}>
             <View style={styles.targetHeader}>
               <View style={styles.targetLeft}>
                 <Ionicons name="battery-charging-outline" size={24} color="#0D7FF2" />
                 <Text style={styles.targetTitle}>Target Charge</Text>
               </View>
               <Text style={styles.targetPercent}>80%</Text>
             </View>
             
             {/* Simple Mock Slider */}
             <View style={styles.sliderContainer}>
                <View style={styles.sliderTrack}>
                   <View style={styles.sliderFill} />
                </View>
                <View style={styles.sliderThumb} />
             </View>

             <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabelText}>50%</Text>
                <Text style={[styles.sliderLabelText, { color: '#94A3B8', fontWeight: '800' }]}>DAILY USE</Text>
                <Text style={styles.sliderLabelText}>100%</Text>
             </View>
          </View>

          {/* Section: Preferences */}
          <Text style={styles.sectionLabel}>PREFERENCES</Text>
          <View style={styles.card}>
             <SettingsOption 
                icon="notifications-outline"
                title="Notifications"
                subtitle="Push & Email"
             />
             <SettingsOption 
                icon="language-outline"
                title="Language"
                subtitle="English (US)"
                isLast={true}
             />
          </View>

          {/* Section: Support */}
          <Text style={styles.sectionLabel}>SUPPORT</Text>
          <View style={styles.card}>
             <SettingsOption 
                icon="help-circle-outline"
                title="Help and Support"
             />
             <SettingsOption 
                icon="log-out-outline"
                title="Log Out"
                isLast={true}
                hideCaret={true}
                onPress={() => router.replace('/login')}
             />
          </View>

          <Text style={styles.versionText}>v4.12.0 • Made with Pulse Energy</Text>

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
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginLeft: -20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 40,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarBorder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: '#0D7FF2',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#0D7FF2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  userVehicle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1.5,
    marginBottom: 12,
    marginLeft: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  targetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  targetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  targetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#334155',
    marginLeft: 12,
  },
  targetPercent: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0D7FF2',
  },
  sliderContainer: {
    height: 30,
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 10,
  },
  sliderTrack: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    width: '100%',
  },
  sliderFill: {
    height: 6,
    backgroundColor: '#0D7FF2',
    borderRadius: 3,
    width: '80%', // Static mockup of 80%
  },
  sliderThumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0D7FF2',
    left: '80%',
    marginLeft: -10,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabelText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  optionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  optionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionTextCenter: {
    flex: 1,
    marginLeft: 16,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  optionSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
    marginTop: 2,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 40,
  },
});
