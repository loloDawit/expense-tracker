import BackButton from '@/components/BackButton';
import Button from '@/components/Button';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typography from '@/components/Typography';
import { auth } from '@/config/firebase';
import { theme } from '@/constants/theme';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

const VerifyEmail = () => {
  const [isChecking, setIsChecking] = React.useState(false);
  const email = auth.currentUser?.email;
  const router = useRouter();

  const checkVerification = async () => {
    if (!email) return;

    setIsChecking(true);
    try {
      await auth.currentUser?.reload();
      if (auth.currentUser?.emailVerified) {
        // Navigate to the next screen or show success message
        console.log('Email verified successfully!');
        router.replace('/(tabs)');
      } else {
        console.log('Email not verified yet.');
      }
    } catch (error) {
      console.error('Error checking email verification:', error);
    } finally {
      setIsChecking(false);
    }
  };
  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <BackButton />
        <View style={styles.container2}>
          <Typography style={styles.header}>Verify Your Email</Typography>
          <Typography style={styles.description}>
            A verification link has been sent to{' '}
          </Typography>
          <Typography style={styles.email}>{email}</Typography>
          <Typography style={styles.description}>
            Please check your inbox and click the link to verify your email.
          </Typography>
          <Button
            loading={isChecking}
            onPress={checkVerification}
            disabled={isChecking}
          >
            <Typography size={16} color={theme.colors.text}>
              {isChecking ? 'Checking...' : 'I have verified'}
            </Typography>
          </Button>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default VerifyEmail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: theme.spacing.y._30,
    paddingHorizontal: theme.spacing.x._20,
  },
  container2: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    color: theme.colors.text,
    fontSize: theme.fontSize['2xl'],
    fontWeight: '700',
    marginBottom: 16,
  },
  description: {
    color: theme.colors.textLight,
    fontSize: theme.fontSize['md'],
    marginBottom: 32,
  },
  email: {
    color: theme.colors.text,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});
