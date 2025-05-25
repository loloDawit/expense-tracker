import BackButton from '@/components/BackButton';
import Button from '@/components/Button';
import FormInput from '@/components/FormInput';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typography from '@/components/Typography';
import { theme } from '@/constants/theme';
import { useSignupForm } from '@/hooks/useSignupForm';
import { verticalScale } from '@/utils/styling';
import { useRouter } from 'expo-router';
import * as Icons from 'phosphor-react-native';
import React from 'react';
import { Controller } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';

const Signup = () => {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useSignupForm();

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <BackButton />
        <View style={{ gap: 5, marginTop: theme.spacing.y._20 }}>
          <Typography size={30} fontWeight={'800'}>
            Let&apos;s
          </Typography>
          <Typography size={30} fontWeight={'800'}>
            Get Started!
          </Typography>
        </View>
        {/* From  */}
        <View style={styles.form}>
          <Typography size={16} color={theme.colors.textLight}>
            Create an account
          </Typography>
          <Controller
            control={control}
            name="username"
            render={({ field: { onChange, value } }) => (
              <FormInput
                placeholder="Enter your username"
                value={value}
                onChangeText={onChange}
                icon={
                  <Icons.User
                    size={verticalScale(26)}
                    color={theme.colors.neutral300}
                    weight="fill"
                  />
                }
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
                icon={
                  <Icons.At
                    size={verticalScale(26)}
                    color={theme.colors.neutral300}
                    weight="fill"
                  />
                }
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
                icon={
                  <Icons.Lock
                    size={verticalScale(26)}
                    color={theme.colors.neutral300}
                    weight="fill"
                  />
                }
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
                icon={
                  <Icons.Lock
                    size={verticalScale(26)}
                    color={theme.colors.neutral300}
                    weight="fill"
                  />
                }
                error={errors.password?.message}
              />
            )}
          />

          <Button
            loading={isSubmitting}
            onPress={handleSubmit}
            style={{
              backgroundColor: theme.colors.primary,
              borderRadius: 17,
              height: verticalScale(52),
            }}
          >
            <Typography size={16} color={theme.colors.white}>
              Sign Up
            </Typography>
          </Button>
        </View>
        {/* footer */}
        <View style={styles.footer}>
          <Typography size={15}>Already have an account?</Typography>
          <Pressable onPress={() => router.navigate('/(auth)/login')}>
            <Typography
              size={15}
              color={theme.colors.primary}
              fontWeight={'600'}
            >
              Login
            </Typography>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Signup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: theme.spacing.y._30,
    paddingHorizontal: theme.spacing.x._20,
  },
  WelcomeText: {
    fontSize: verticalScale(20),
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  form: {
    gap: theme.spacing.y._20,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    textAlign: 'right',
    fontWeight: '500',
    color: theme.colors.text,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  footerText: {
    fontSize: verticalScale(15),
    color: theme.colors.text,
    textAlign: 'center',
  },
});
