import BackButton from '@/components/BackButton';
import Button from '@/components/Button';
import FormInput from '@/components/FormInput';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typography from '@/components/Typography';
import { useTheme } from '@/contexts/ThemeContext';
import { useSignupForm } from '@/hooks/useSignupForm';
import { verticalScale } from '@/utils/styling';
import { useRouter } from 'expo-router';
import * as Icons from 'phosphor-react-native';
import React from 'react';
import { Controller } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

const Signup = () => {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useSignupForm();

  return (
    <ScreenWrapper>
      <View style={[styles.container, { paddingHorizontal: spacing.x._20 }]}>
        <Animated.View entering={FadeIn.duration(500)} style={styles.backButtonContainer}>
          <BackButton />
        </Animated.View>

        <View style={styles.contentContainer}>
          <Animated.View entering={FadeInDown.duration(500).delay(200)} style={[styles.header, { marginBottom: spacing.y._40 }]}>
            <Typography size={32} fontWeight={'800'}>
              Let&apos;s Get Started!
            </Typography>
            <Typography size={16} color={colors.textSecondary}>
              Create an account to start tracking your expenses.
            </Typography>
          </Animated.View>

          {/* Form */}
          <Animated.View entering={FadeInDown.duration(500).delay(400)} style={[styles.form, { gap: spacing.y._20 }]}>
            <Controller
              control={control}
              name="username"
              render={({ field: { onChange, value } }) => (
                <FormInput
                  placeholder="Enter your username"
                  value={value}
                  onChangeText={onChange}
                  icon={<Icons.User size={verticalScale(26)} color={colors.textSecondary} weight="fill" />}
                  error={errors.username?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <FormInput
                  placeholder="Enter your email"
                  value={value}
                  onChangeText={onChange}
                  icon={<Icons.At size={verticalScale(26)} color={colors.textSecondary} weight="fill" />}
                  error={errors.email?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <FormInput
                  placeholder="Enter your password"
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry
                  icon={<Icons.Lock size={verticalScale(26)} color={colors.textSecondary} weight="fill" />}
                  error={errors.password?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, value } }) => (
                <FormInput
                  placeholder="Confirm your password"
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry
                  icon={<Icons.Lock size={verticalScale(26)} color={colors.textSecondary} weight="fill" />}
                  error={errors.confirmPassword?.message}
                />
              )}
            />
            <Button
              loading={isSubmitting}
              onPress={handleSubmit}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 25,
                height: verticalScale(52),
              }}
            >
              <Typography size={18} fontWeight="600" color={colors.text}>
                Sign Up
              </Typography>
            </Button>
          </Animated.View>

          {/* Footer */}
          <Animated.View entering={FadeInDown.duration(500).delay(600)} style={styles.footer}>
            <Typography size={15} color={colors.textSecondary}>
              Already have an account?
            </Typography>
            <Pressable onPress={() => router.navigate('/(auth)/login')}>
              <Typography size={15} color={colors.primary} fontWeight={'600'}>
                Login
              </Typography>
            </Pressable>
          </Animated.View>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Signup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButtonContainer: {
    position: 'absolute',
    top: verticalScale(20),
    left: 20,
    zIndex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    gap: 5,
  },
  form: {},
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    marginTop: verticalScale(30),
  },
});
