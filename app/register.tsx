import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Alert, Dimensions, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerUser, verifyOTP } from './services/api';

const { width } = Dimensions.get('window');

export default function RegisterScreen() {
  const router = useRouter();
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

  const handleRegister = async () => {
    if (!name.trim()) {
      setError('Enter your name');
      return;
    }

    if (!isValidEmail(email.trim())) {
      setError('Enter a valid email');
      return;
    }

    if (!mobile.trim() || mobile.length < 10) {
      setError('Enter a valid mobile number');
      return;
    }

    if (!/^\d{6}$/.test(password)) {
      setError('PIN must be exactly 6 digits');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await registerUser(name.trim(), email.trim(), password, mobile.trim());
      setIsOtpSent(true);
      Alert.alert('OTP Sent', 'Check your messages for the OTP (Mocked: 123456).');
    } catch (err: any) {
      console.log('Register error:', err);
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      setError('Enter the OTP');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const data = await verifyOTP(email.trim(), otp.trim());
      if (data.token) {
        await AsyncStorage.setItem('userToken', data.token);
        router.replace('/selection');
      } else {
        setError('Verification failed');
      }
    } catch (err: any) {
      console.log('OTP error:', err);
      setError(err.message || 'OTP Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#000000" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Register</Text>
            </View>

            <View style={styles.heroSection}>
              <View style={styles.imageWrapper}>
                <Image 
                  source={require('../assets/images/nexon.png')} 
                  style={styles.heroImage}
                  resizeMode="cover"
                />
              </View>
            </View>

            <View style={styles.content}>
              <Text style={styles.title}>{isOtpSent ? 'Verify OTP' : 'Create Account'}</Text>
              <Text style={styles.subTitle}>
                {isOtpSent ? 'Enter the OTP sent to your mobile.' : 'Join EV Charge for seamless wireless charging.'}
              </Text>

              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {isOtpSent ? (
                <View>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Enter OTP</Text>
                    <TextInput 
                      style={styles.textInput}
                      placeholder="123456"
                      placeholderTextColor="#94A3B8"
                      value={otp}
                      onChangeText={(text) => {
                        setOtp(text);
                        if (error) setError('');
                      }}
                      keyboardType="number-pad"
                    />
                  </View>
                  <TouchableOpacity 
                    style={[styles.continueButton, isLoading && styles.disabledButton]} 
                    onPress={handleVerifyOTP}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.continueButtonText}>Verify OTP</Text>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput 
                  style={styles.textInput}
                  placeholder="John Doe"
                  placeholderTextColor="#94A3B8"
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (error) setError('');
                  }}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput 
                  style={styles.textInput}
                  placeholder="example@email.com"
                  placeholderTextColor="#94A3B8"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (error) setError('');
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Mobile Number</Text>
                <TextInput 
                  style={styles.textInput}
                  placeholder="Enter 10-digit mobile number"
                  placeholderTextColor="#94A3B8"
                  value={mobile}
                  onChangeText={(text) => {
                    setMobile(text);
                    if (error) setError('');
                  }}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>6-Digit PIN</Text>
                <TextInput 
                  style={styles.textInput}
                  placeholder="123456"
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={(text) => {
                    // Only allow numeric input up to 6 digits
                    const cleaned = text.replace(/[^\d]/g, '');
                    setPassword(cleaned);
                    if (error) setError('');
                  }}
                  secureTextEntry
                  autoCapitalize="none"
                  keyboardType="numeric"
                  maxLength={6}
                />
              </View>

              <TouchableOpacity 
                style={[styles.continueButton, isLoading && styles.disabledButton]} 
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.continueButtonText}>Register</Text>
                )}
              </TouchableOpacity>
              </View>
              )}

              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.replace('/login')} disabled={isLoading}>
                  <Text style={styles.resendLink}>
                    Login
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DADBDF',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 5,
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000000',
    marginLeft: 10,
  },
  heroSection: {
    alignItems: 'center',
    marginTop: 5,
  },
  imageWrapper: {
    width: width * 0.9,
    height: 180,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 8,
  },
  subTitle: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
    marginBottom: 20,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '700',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  textInput: {
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#000000',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  continueButton: {
    height: 56,
    backgroundColor: '#0D7FF2',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0D7FF2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#475569',
  },
  resendLink: {
    fontSize: 14,
    color: '#0D7FF2',
    fontWeight: '800',
  },
});

