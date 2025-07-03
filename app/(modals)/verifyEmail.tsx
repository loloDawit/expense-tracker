import ModalWrapper from '@/components/ModalWrapper';
import { auth } from '@/config/firebase';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import { sendEmailVerification } from 'firebase/auth';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const POLL_INTERVAL_MS = 5000;

const VerifyEmailScreen = () => {
  const [checking, setChecking] = useState(false);
  const [lastSentAt, setLastSentAt] = useState<number | null>(null);
  const [resending, setResending] = useState(false);
  const [polling, setPolling] = useState(true);
  const navigation = useRouter();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { isDark, colors } = useTheme();

  const checkEmailVerified = useCallback(async (showAlert = true) => {
    try {
      setChecking(true);
      await auth.currentUser?.reload();

      if (auth.currentUser?.emailVerified) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        Alert.alert('✅ Success', 'Your email is verified!');
        navigation.replace('/(modals)/verifyEmail');
      } else if (showAlert) {
        Alert.alert('⏳ Still Waiting', 'Your email is not verified yet.');
      }
    } catch (err) {
      console.error('Verification check failed:', err);
      Alert.alert('❌ Error', 'Something went wrong checking verification.');
    } finally {
      setChecking(false);
    }
  }, [navigation]);

  const resendVerification = async () => {
    const now = Date.now();

    if (lastSentAt && now - lastSentAt < 60 * 1000) {
      Alert.alert('Please wait', 'You can resend the email once per minute.');
      return;
    }
    try {
      setResending(true);
      const user = auth.currentUser;
      if (user) {
        await sendEmailVerification(user);
        setLastSentAt(now);
        Alert.alert('📨 Email Sent', 'Verification email resent!');
      }
    } catch (err) {
      console.error('Resend failed:', err);
      Alert.alert('❌ Error', 'Could not resend verification email.');
    } finally {
      setResending(false);
    }
  };

  useEffect(() => {
    if (polling) {
      intervalRef.current = setInterval(
        () => checkEmailVerified(false),
        POLL_INTERVAL_MS,
      );
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [polling, checkEmailVerified]);

  return (
    <ModalWrapper>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          Verify Your Email
        </Text>

        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          We’ve sent a verification link to your email address. Please check
          your inbox and click the link to verify.
        </Text>

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: colors.primary },
            checking && styles.disabledButton,
          ]}
          onPress={() => checkEmailVerified()}
          disabled={checking}
        >
          {checking ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={[styles.buttonText, { color: colors.white }]}>
              I've Verified My Email
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, resending && styles.disabledButton]}
          onPress={resendVerification}
          disabled={resending}
        >
          {resending ? (
            <ActivityIndicator color={isDark ? colors.white : colors.black} />
          ) : (
            <Text
              style={[
                styles.secondaryButtonText,
                { color: colors.primaryLight },
              ]}
            >
              Resend Verification Email
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setPolling(false);
            Alert.alert('Auto Check Disabled', 'You can still check manually.');
          }}
        >
          <Text
            style={[styles.stopPollingText, { color: colors.textSecondary }]}
          >
            Stop auto-checking
          </Text>
        </TouchableOpacity>
      </View>
    </ModalWrapper>
  );
};

export default VerifyEmailScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    marginTop: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  stopPollingText: {
    marginTop: 12,
    fontSize: 13,
    textAlign: 'center',
  },
});
