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
      <View style={[styles.container, { paddingTop: spacing.y._7 }]}>
        {/* Top: Sign In and Image */}
        <View>
          <TouchableOpacity
            onPress={handleLogin}
            style={{ alignSelf: 'flex-end', marginRight: spacing.x._20 }}
          >
            <Typography fontWeight="500">Sign In</Typography>
          </TouchableOpacity>

          <Animated.Image
            entering={FadeIn.duration(1000)}
            style={styles.WelcomeImage}
            source={require('@/assets/images/welcome2.png')}
            resizeMode="contain"
          />
        </View>

        {/* Footer */}
        <Animated.View
          style={[styles.footer, { backgroundColor: colors.background }]}
        >
          <Animated.View
            entering={FadeInDown.duration(1000).springify().damping(12)}
            style={{ alignItems: 'center' }}
          >
            <Typography size={30} fontWeight="800">
              Always take control
            </Typography>
            <Typography size={30} fontWeight="800">
              of your finances
            </Typography>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(1000)
              .delay(100)
              .springify()
              .damping(12)}
            style={{ alignItems: 'center', gap: 2 }}
          >
            <Typography size={17} color={colors.textLight}>
              Organize your finances today for a better
            </Typography>
            <Typography size={17} color={colors.textLight}>
              lifestyle tomorrow.
            </Typography>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(1000)
              .delay(200)
              .springify()
              .damping(12)}
            style={{ width: '100%', paddingHorizontal: spacing.x._25 }}
          >
            <Button onPress={handleGetStarted}>
              <Typography size={16} color={colors.white}>
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
  },
  WelcomeImage: {
    width: '100%',
    height: verticalScale(300),
    alignSelf: 'center',
    marginTop: verticalScale(100),
  },
  footer: {
    alignItems: 'center',
    paddingTop: verticalScale(30),
    paddingBottom: verticalScale(45),
    gap: verticalScale(20), // fallback if theme.spacing.y._20 isn’t dynamic
    shadowColor: 'white',
    shadowOffset: {
      width: 0,
      height: -10,
    },
    elevation: 10,
    shadowOpacity: 0.15,
    shadowRadius: 25,
  },
});
