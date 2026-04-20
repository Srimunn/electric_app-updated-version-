import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, Dimensions, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

const ProfileOption = ({ icon, title, subtitle, isLast = false, onSelect }: { icon: any, title: string, subtitle: string, isLast?: boolean, onSelect?: () => void }) => (
  <TouchableOpacity style={[styles.optionRow, !isLast && styles.optionBorder]} onPress={onSelect}>
    <View style={styles.optionIconBox}>
      <MaterialCommunityIcons name={icon} size={24} color="#0D7FF2" />
    </View>
    <View style={styles.optionTextCenter}>
      <Text style={styles.optionTitle}>{title}</Text>
      <Text style={styles.optionSubtitle}>{subtitle}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Top Banner */}
      <View style={styles.topCurvedBg} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={26} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity style={styles.settingsBtn} onPress={() => router.push('/settings')}>
            <Ionicons name="settings-outline" size={26} color="#0F172A" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* User Info */}
          <View style={styles.userInfoSection}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarBorder}>
                 {/* Placeholder for avatar, using vector icon as fallback */}
                 <Ionicons name="person-circle" size={80} color="#0D7FF2" />
              </View>
              <View style={styles.editAvatarBadge}>
                <Ionicons name="camera" size={12} color="#FFFFFF" />
              </View>
            </View>
            <Text style={styles.userName}>Srimun S S</Text>
            <Text style={styles.userEmail}>itsmesrimun@gmail.com</Text>
          </View>

          {/* Overlapping Content Container */}
          <View style={styles.contentCard}>
            
            <View style={styles.vehicleHeader}>
               <Text style={styles.vehicleLabel}>CURRENT VEHICLE</Text>
               <View style={styles.primaryBadge}>
                 <Text style={styles.primaryBadgeText}>PRIMARY</Text>
               </View>
            </View>
            
            <TouchableOpacity style={styles.vehicleCard}>
               <View style={styles.vehicleImagePlaceholder}>
                  <Image source={require('../assets/images/hero-car.png')} style={{width: 40, height: 40}} resizeMode="contain" />
               </View>
               <View style={styles.vehicleTextCenter}>
                  <Text style={styles.vehicleName}>Tata Nexon EV</Text>
                  <Text style={styles.vehicleLicense}>License: EL-2024-EV</Text>
               </View>
               <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <ProfileOption 
               icon="account-edit-outline"
               title="Edit Profile"
               subtitle="Update your personal details"
            />
            
            <ProfileOption 
               icon="car-cog"
               title="Manage Vehicles"
               subtitle="Add or remove EV profiles"
            />
            
            <ProfileOption 
               icon="wallet-bifold-outline"
               title="Payment Methods"
               subtitle="Manage your cards and billing"
            />
            
            <ProfileOption 
               icon="history"
               title="Transaction History"
               subtitle="View all past charging sessions"
               isLast={true}
               onSelect={() => router.push('/history')}
            />

          </View>
          
        </ScrollView>
        
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
            onPress={() => router.replace('/history')}
          >
            <Ionicons name="time-outline" size={24} color="#94A3B8" />
            <Text style={styles.tabLabel}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem}>
            <Ionicons name="person" size={24} color="#0D7FF2" />
            <Text style={[styles.tabLabel, { color: '#0D7FF2' }]}>Profile</Text>
          </TouchableOpacity>
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
  topCurvedBg: {
    position: 'absolute',
    top: 0,
    width: width,
    height: 340,
    backgroundColor: '#DADBDF', // Match home top structure
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
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  scrollContent: {
    paddingBottom: 110,
  },
  userInfoSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarBorder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#0D7FF2',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0D7FF2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#DADBDF',
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  userEmail: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
    marginTop: 4,
    marginBottom: 30,
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  vehicleLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
    marginLeft: 4,
  },
  primaryBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  primaryBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0D7FF2',
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 24,
  },
  vehicleImagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleTextCenter: {
    flex: 1,
    marginLeft: 16,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  vehicleLicense: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    width: '100%',
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
  },
  optionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  optionIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionTextCenter: {
    flex: 1,
    marginLeft: 16,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
  },
  optionSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94A3B8',
    marginTop: 2,
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
});
