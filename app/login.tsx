import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Alert, Dimensions, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser } from './services/api';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

  const handleLogin = async () => {
    if (!isValidEmail(email.trim())) {
      setError('Enter a valid email');
      return;
    }

    if (!/^\d{6}$/.test(password)) {
      setError('PIN must be exactly 6 digits');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const data = await loginUser(email.trim(), password);
      if (data.token) {
        await AsyncStorage.setItem('userToken', data.token);
        router.replace('/selection');
      } else {
        setError('Login failed: No token received');
      }
    } catch (err: any) {
      console.log('Login error:', err);
      const backendError = err.response?.data?.error || err.response?.data?.message;
      const msg = backendError || (err.message || 'Invalid credentials or network error');
      setError(msg);
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
              <TouchableOpacity onPress={() => router.replace('/')} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#000000" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Login</Text>
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
              <Text style={styles.title}>Welcome to EV Charge</Text>
              <Text style={styles.subTitle}>
                Login to continue with seamless wireless charging.
              </Text>

              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

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
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.continueButtonText}>Login</Text>
                )}
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>{"Don't have an account? "}</Text>
                <TouchableOpacity onPress={() => router.push('/register')} disabled={isLoading}>
                  <Text style={styles.resendLink}>
                    Register
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
    height: 220,
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
    paddingTop: 25,
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
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 10,
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
    marginTop: 30,
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


