import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import { Alert, Dimensions, Image, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');



export default function LoginScreen() {
  const router = useRouter();
  
  // Form State
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '']); 
  const [error, setError] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  // Refs for auto-focus
  const otpRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

  const createOtp = () =>
    Array.from({ length: 5 }, () => Math.floor(Math.random() * 10)).join('');

  const sendOtpToEmail = async () => {
    if (!isValidEmail(email.trim())) {
      setError('Enter a valid email');
      return;
    }

    setError('');
    setIsSendingOtp(true);
    try {
      const newOtp = createOtp();
      setGeneratedOtp(newOtp);
      setOtp(['', '', '', '', '']);
      setOtpSent(true);

      // NOTE:
      // To send a real email OTP, connect this section to your backend email API.
      // For now we keep the login protected and surface the generated OTP for testing.
      console.log(`OTP for ${email}: ${newOtp}`);
      Alert.alert('OTP Sent', `Verification code sent to ${email}`);
    } catch (e) {
      setError('Failed to send OTP');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleContinue = () => {
    const enteredOtp = otp.join('');
    const otpFilled = otp.every(digit => digit !== '');

    if (!isValidEmail(email.trim())) {
      setError('Enter a valid email');
      return;
    }

    if (!otpSent) {
      setError('Send OTP first');
      return;
    }

    if (!otpFilled) {
      setError('Enter OTP');
      return;
    }

    if (enteredOtp !== generatedOtp) {
      setError('Invalid OTP');
      return;
    }

    setError('');
    router.replace('/selection');
  };

  const handleResend = () => {
    sendOtpToEmail();
  };

  const updateOtp = (text: string, index: number) => {
    const digit = text.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setError('');

    if (digit !== '' && index < 4) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      otpRefs[index - 1].current?.focus();
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
                  source={require('../assets/images/hero-car.png')} 
                  style={styles.heroImage}
                  resizeMode="cover"
                />
              </View>
            </View>

            <View style={styles.content}>
              <Text style={styles.title}>Welcome to EV Charge</Text>
              <Text style={styles.subTitle}>
                Enter your details to continue with seamless wireless charging.
              </Text>

              <View style={styles.inputContainer}>
                <View style={styles.labelRow}>
                  <Text style={styles.inputLabel}>Email</Text>
                  {(error === 'Enter a valid email' || error === 'Failed to send OTP') && (
                    <Text style={styles.errorText}>{error}</Text>
                  )}
                </View>
                <View style={styles.emailInputWrapper}>
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
                  <TouchableOpacity
                    style={styles.inlineSendButton}
                    onPress={sendOtpToEmail}
                    disabled={isSendingOtp}
                  >
                    <Text style={styles.inlineSendButtonText}>
                      {isSendingOtp ? '...' : 'Send'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.verificationSection}>
                <View style={styles.labelRow}>
                  <Text style={styles.inputLabel}>Verification Code</Text>
                  {(error === 'Send OTP first' || error === 'Enter OTP' || error === 'Invalid OTP') && (
                    <Text style={styles.errorText}>{error}</Text>
                  )}
                </View>
                <View style={styles.codeContainer}>
                  {otp.map((digit, index) => (
                    <TextInput 
                      key={index}
                      ref={otpRefs[index]}
                      style={styles.codeInput}
                      keyboardType="number-pad"
                      maxLength={1}
                      value={digit}
                      onChangeText={(text) => updateOtp(text, index)}
                      onKeyPress={(e) => handleKeyPress(e, index)}
                    />
                  ))}
                </View>
              </View>

              <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
                <Text style={styles.continueButtonText}>Continue</Text>
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Didn't receive a code? </Text>
                <TouchableOpacity onPress={handleResend} disabled={isSendingOtp}>
                  <Text style={styles.resendLink}>
                    {isSendingOtp ? 'Sending...' : 'Resend'}
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
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  errorText: {
    fontSize: 12,
    color: '#0D7FF2', // Using brand blue for visibility
    fontWeight: '700',
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
  emailInputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  inlineSendButton: {
    position: 'absolute',
    right: 8,
    height: 38,
    minWidth: 58,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#0D7FF2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inlineSendButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  verificationSection: {
    marginBottom: 35,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  codeInput: {
    width: (width - 100) / 5,
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '800',
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
