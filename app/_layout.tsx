import { AuthProvider } from '@/contexts/AuthContext';
import logger from '@/utils/logger';
import * as Sentry from '@sentry/react-native';
import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,

  enableNative: true,
  debug: __DEV__,

  // Optional advanced config
  sendDefaultPii: true,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [
    Sentry.reactNativeTracingIntegration(),
    Sentry.feedbackIntegration(),
  ],
});

const Layout = () => {
  useEffect(() => {
    ErrorUtils.setGlobalHandler((error: any, isFatal?: boolean) => {
      logger.error('🔥 Global error caught:', error, `Fatal: ${isFatal}`);
      Sentry.captureException(error);
      logger.remote?.(error, { isFatal });
    });
  }, []);

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="(modals)/profileModal"
          options={{
            presentation: 'modal',
          }}
        />
      </Stack>
    </AuthProvider>
  );
};

export default Layout;

const styles = StyleSheet.create({});
