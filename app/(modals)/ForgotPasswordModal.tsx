import BackButton from '@/components/BackButton';
import Button from '@/components/Button';
import FormInput from '@/components/FormInput';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typography from '@/components/Typography';
import { useTheme } from '@/contexts/ThemeContext';
import { useForgotPasswordForm } from '@/hooks/useForgotPasswordForm';
import { verticalScale } from '@/utils/styling';
import { useRouter } from 'expo-router';
import * as Icons from 'phosphor-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

const ForgotPasswordModal = () => {
  const { colors, spacing } = useTheme();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForgotPasswordForm(() => router.back());

  return (
    <ScreenWrapper>
      <View style={[styles.container, { padding: spacing.x._20 }]}>
        <Animated.View
          entering={FadeIn.duration(500)}
          style={styles.backButtonContainer}
        >
          <BackButton />
        </Animated.View>

        <Typography
          size={24}
          fontWeight="700"
          style={{ marginBottom: spacing.y._10 }}
        >
          Forgot Password?
        </Typography>
        <Typography
          color={colors.textLight}
          style={{ marginBottom: spacing.y._20 }}
        >
          Enter your email address to receive a password reset link.
        </Typography>

        <FormInput
          name="email"
          control={control}
          placeholder="Enter your email"
          icon={
            <Icons.At
              size={verticalScale(26)}
              color={colors.primary}
              weight="fill"
            />
          }
          errors={errors}
        />

        <Button
          loading={isSubmitting}
          onPress={handleSubmit}
          style={{
            backgroundColor: colors.primary,
            borderRadius: 25,
            height: verticalScale(52),
            marginTop: spacing.y._20,
          }}
        >
          <Typography size={18} fontWeight="600" color={colors.white}>
            Send Reset Link
          </Typography>
        </Button>
      </View>
    </ScreenWrapper>
  );
};

export default ForgotPasswordModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  backButtonContainer: {
    position: 'absolute',
    top: verticalScale(20),
    left: 20,
    zIndex: 1,
  },
});
