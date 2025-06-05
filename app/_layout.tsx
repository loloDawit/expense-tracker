import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import logger from '@/utils/logger';
import * as Sentry from '@sentry/react-native';
import { useFonts } from 'expo-font';
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

  const [fontsLoaded] = useFonts({
    'Manrope-Regular': require('@/assets/fonts/Manrope/Manrope-Regular.ttf'),
    'Manrope-Bold': require('@/assets/fonts/Manrope/Manrope-Bold.ttf'),
    // add other weights as needed
  });
  if (!fontsLoaded) return null;

  return (
    <ThemeProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen
            name="(modals)/transactionModal"
            options={{
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="(modals)/profileModal"
            options={{
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="(modals)/iconPickerModal"
            options={{
              presentation: 'modal',
            }}
          />

          <Stack.Screen
            name="(modals)/categoryModal"
            options={{
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="(modals)/walletModal"
            options={{
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="(modals)/searchModal"
            options={{
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="(modals)/settingsModal"
            options={{
              presentation: 'modal',
            }}
          />
        </Stack>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default Layout;

const styles = StyleSheet.create({});
