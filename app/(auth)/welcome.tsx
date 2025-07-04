import Button from '@/components/Button';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typography from '@/components/Typography';
import { useTheme } from '@/contexts/ThemeContext';
import { verticalScale } from '@/utils/styling';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

const Welcome = () => {
  const { colors, spacing } = useTheme();
  const router = useRouter();

  const handleLogin = () => router.push('/(auth)/login');
  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(auth)/signup');
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* Top: Sign In and Image */}
        <Animated.View entering={FadeIn.duration(1000)} style={styles.topSection}>
          <TouchableOpacity onPress={handleLogin} style={{ alignSelf: 'flex-end', marginRight: spacing.x._20 }}>
            <Typography fontWeight="600" size={16} color={colors.primary}>
              Sign In
            </Typography>
          </TouchableOpacity>
          <Animated.Image
            style={styles.welcomeImage}
            source={require('@/assets/images/welcome.png')}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Footer */}
        <Animated.View style={[styles.footer, { backgroundColor: colors.card, borderTopLeftRadius: 40, borderTopRightRadius: 40 }]}>
          <Animated.View entering={FadeInDown.duration(1000).springify().damping(12)} style={styles.textContainer}>
            <Typography size={32} fontWeight="800" style={styles.title}>
              Take Control of Your Finances
            </Typography>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(1000).delay(100).springify().damping(12)}
            style={styles.textContainer}
          >
            <Typography size={16} color={colors.textLight} style={styles.subtitle}>
              Organize your finances today for a better lifestyle tomorrow.
            </Typography>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(1000).delay(200).springify().damping(12)}
            style={{ width: '100%', paddingHorizontal: spacing.x._25 }}
          >
            <Button onPress={handleGetStarted} style={{ borderRadius: 25 }}>
              <Typography size={18} fontWeight="600" color={colors.white}>
                Get Started
              </Typography>
            </Button>
          </Animated.View>
        </Animated.View>
      </View>
    </ScreenWrapper>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: '#FDFDFF', // A light, clean background
  },
  topSection: {
    paddingTop: verticalScale(50),
  },
  welcomeImage: {
    width: '100%',
    height: verticalScale(320),
    alignSelf: 'center',
    marginTop: verticalScale(40),
  },
  footer: {
    alignItems: 'center',
    paddingTop: verticalScale(40),
    paddingBottom: verticalScale(50),
    gap: verticalScale(25),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -5,
    },
    elevation: 20,
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: verticalScale(20),
  },
  title: {
    textAlign: 'center',
    lineHeight: 40,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 24,
  },
});
