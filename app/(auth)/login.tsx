import BackButton from '@/components/BackButton';
import Button from '@/components/Button';
import FormInput from '@/components/FormInput';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typography from '@/components/Typography';
import { colors, spacingX, spacingY } from '@/constants/theme';
import { useLoginForm } from '@/hooks/useLoginForm';
import { verticalScale } from '@/utils/styling';
import { useRouter } from 'expo-router';
import * as Icons from 'phosphor-react-native';
import React from 'react';
import { Controller } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';

const Login = () => {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useLoginForm();

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <BackButton />
        <View style={{ gap: 5, marginTop: spacingY._20 }}>
          <Typography size={30} fontWeight={'800'}>
            Hey,
          </Typography>
          <Typography size={30} fontWeight={'800'}>
            Welcome back!
          </Typography>
        </View>
        {/* From  */}
        <View style={styles.form}>
          <Typography size={16} color={colors.textLight}>
            Login to your account
          </Typography>
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
                    color={colors.neutral300}
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
                    color={colors.neutral300}
                    weight="fill"
                  />
                }
                error={errors.password?.message}
              />
            )}
          />
          {/* todo: add forgot password functionality */}
          <Typography
            size={14}
            color={colors.text}
            style={styles.forgotPassword}
          >
            Forgot Password?
          </Typography>
          <Button
            loading={isSubmitting}
            onPress={handleSubmit}
            style={{
              backgroundColor: colors.primary,
              borderRadius: 17,
              height: verticalScale(52),
            }}
          >
            <Typography size={16} color={colors.white}>
              Login
            </Typography>
          </Button>
        </View>
        {/* footer */}
        <View style={styles.footer}>
          <Typography size={15}>Don’t have an account?</Typography>
          <Pressable onPress={() => router.navigate('/(auth)/signup')}>
            <Typography size={15} color={colors.primary} fontWeight={'600'}>
              Sign Up
            </Typography>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacingY._30,
    paddingHorizontal: spacingX._20,
  },
  WelcomeText: {
    fontSize: verticalScale(20),
    fontWeight: 'bold',
    color: colors.text,
  },
  form: {
    gap: spacingY._20,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    textAlign: 'right',
    fontWeight: '500',
    color: colors.text,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  footerText: {
    fontSize: verticalScale(15),
    color: colors.text,
    textAlign: 'center',
  },
});
