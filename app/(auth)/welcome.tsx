import Button from '@/components/Button';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typography from '@/components/Typography';
import { theme } from '@/constants/theme';
import { verticalScale } from '@/utils/styling';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

const Welcome = () => {
  const router = useRouter();
  const handleLogin = () => {
    router.push('/(auth)/login');
  };

  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(auth)/signup');
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/*Login with image */}
        <View>
          <TouchableOpacity onPress={handleLogin} style={styles.loginButton}>
            <Typography fontWeight={'500'}>Sign In</Typography>
          </TouchableOpacity>

          <Animated.Image
            entering={FadeIn.duration(1000)}
            style={styles.WelcomeImage}
            source={require('@/assets/images/welcome2.png')}
            resizeMode="contain"
          />
        </View>

        {/*Footer */}
        <Animated.View style={styles.footer}>
          <Animated.View
            entering={FadeInDown.duration(1000).springify().damping(12)}
            style={{ alignItems: 'center' }}
          >
            <Typography size={30} fontWeight={'800'}>
              Always take control
            </Typography>
            <Typography size={30} fontWeight={'800'}>
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
            <Typography size={17} color={theme.colors.textLight}>
              Organize your finances today for a better
            </Typography>
            <Typography size={17} color={theme.colors.textLight}>
              lifestyle tomorrow.
            </Typography>
          </Animated.View>
          <Animated.View
            entering={FadeInDown.duration(1000)
              .delay(200)
              .springify()
              .damping(12)}
            style={styles.buttonContainer}
          >
            <Button onPress={handleGetStarted}>
              <Typography
                size={16}
                color={theme.colors.neutral900}
                fontWeight={'600'}
              >
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
    paddingTop: theme.spacing.y._7,
  },
  WelcomeImage: {
    width: '100%',
    height: verticalScale(300),
    alignSelf: 'center',
    marginTop: verticalScale(100),
  },
  loginButton: {
    alignSelf: 'flex-end',
    marginRight: theme.spacing.x._20,
  },
  footer: {
    backgroundColor: theme.colors.neutral900,
    alignItems: 'center',
    paddingTop: verticalScale(30),
    paddingBottom: verticalScale(45),
    gap: theme.spacing.y._20,
    shadowColor: 'white',
    shadowOffset: {
      width: 0,
      height: -10,
    },
    elevation: 10,
    shadowOpacity: 0.15,
    shadowRadius: 25,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: theme.spacing.x._25,
  },
});
