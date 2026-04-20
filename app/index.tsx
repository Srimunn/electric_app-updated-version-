import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const AnimatedView = Animated.View;

export default function ChargingScreen() {
  const router = useRouter();
  const [percent, setPercent] = useState(1);
  const [complete, setComplete] = useState(false);

  const progress = useSharedValue(0.01);
  const opacityAnim = useSharedValue(0);

  // Function to trigger navigation on the JS thread
  const navigateToLogin = () => {
    setComplete(true);
    // Give the user a moment (800ms) to see the 100% "Initialized" state
    setTimeout(() => {
      router.replace('/login');
    }, 800);
  };

  useEffect(() => {
    opacityAnim.value = withTiming(1, { duration: 800 });

    const totalDuration = 6000; // User set duration to 6000ms

    const delayTimer = setTimeout(() => {
      // 1. Animate the progress bar
      progress.value = withTiming(1, { duration: totalDuration }, (isFinished) => {
        if (isFinished) {
          runOnJS(navigateToLogin)();
        }
      });

      // 2. Animate the percentage text
      let startTimestamp: number | null = null;
      const startPercent = 1;
      const endPercent = 100;

      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progressRatio = Math.min((timestamp - startTimestamp) / totalDuration, 1);
        const currentPercent = Math.floor(progressRatio * (endPercent - startPercent) + startPercent);

        setPercent(currentPercent);

        if (progressRatio < 1) {
          requestAnimationFrame(step);
        }
      };

      requestAnimationFrame(step);
    }, 1000);

    return () => clearTimeout(delayTimer);
  }, []);

  const progressBarStyle = useAnimatedStyle(() => {
    return { width: `${progress.value * 100}%` };
  });

  const contentAnimatedStyle = useAnimatedStyle(() => {
    return { opacity: opacityAnim.value };
  });

  return (
    <LinearGradient
      colors={['#DADBDF', '#DADBDF', '#DADBDF']}
      style={styles.container}
    >
      <StatusBar style="dark" />
      <SafeAreaView style={styles.content}>

        <AnimatedView style={[styles.mainWrapper, contentAnimatedStyle]}>
          {/* Header - Image Logo Placeholder */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../assets/images/logo.png')}
                style={styles.brandLogoImage}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.imageWrapper}>
              <Image
                source={require('../assets/images/hero-car.png')}
                style={styles.heroImage}
                resizeMode="cover"
              />
            </View>
          </View>

          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.titleMain}>Autonomous</Text>
            <View style={styles.titleRow}>
              <Text style={styles.titleHighlight}>Wireless</Text>
              <Text style={[styles.titleMain, { marginLeft: 12 }]}>EV</Text>
            </View>
            <Text style={styles.titleMain}>Charging</Text>
            <Text style={styles.subTitle}>Park and charge automatically</Text>
          </View>

          {/* Progress Section */}
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>
                {complete ? 'SYSTEM INITIALIZED' : 'INITIALIZING SYSTEM'}
              </Text>
              <Text style={styles.progressPercent}>{percent}%</Text>
            </View>

            <View style={styles.progressBarTrack}>
              <AnimatedView style={[styles.progressBarFill, progressBarStyle]} />
            </View>

            <View style={styles.securityRow}>
              <MaterialCommunityIcons
                name={complete ? "shield-check" : "shield-sync"}
                size={16}
                color="#0D7FF2"
              />
              <Text style={styles.securityText}>Secure Handshake Established</Text>
            </View>
          </View>

          
        </AnimatedView>

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  mainWrapper: {
    flex: 1,
    paddingHorizontal: 25,
  },
  header: {
    marginTop: 15,
    marginBottom: 5,
    height: 60,
    justifyContent: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandLogoImage: {
    width: 60,
    height: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 25,
  },
  imageWrapper: {
    width: width * 0.88,
    height: width * 0.88,
    borderRadius: 45,
    overflow: 'hidden',
    backgroundColor: '#DADBDF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 35,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleMain: {
    fontSize: 40,
    fontWeight: '800',
    color: 'black',
    textAlign: 'center',
    lineHeight: 46,
    letterSpacing: -1,
  },
  titleHighlight: {
    fontSize: 40,
    fontWeight: '800',
    color: '#0D7FF2',
    textAlign: 'center',
    lineHeight: 46,
    letterSpacing: -1,
  },
  subTitle: {
    fontSize: 17,
    color: '#64748B',
    marginTop: 15,
    fontWeight: '500',
  },
  progressContainer: {
    width: '100%',
    paddingHorizontal: 5,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: 'black',
    letterSpacing: 1,
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0D7FF2',
  },
  progressBarTrack: {
    height: 8,
    width: '100%',
    backgroundColor: '#DADBDF',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 15,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0D7FF2',
    borderRadius: 4,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.7,
  },
  securityText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 8,
    fontWeight: '500',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
    marginBottom: 30,
    paddingHorizontal: 35,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 6,
    letterSpacing: 1.5,
  },
});
