import { auth } from '@/config/firebase';
import * as LocalAuthentication from 'expo-local-authentication';

export const requireAuth = () => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  return user.uid;
};

import { Alert } from 'react-native';

export const authenticateBiometric = async ({
  reason = 'Authenticate to proceed',
  fallbackLabel = 'Enter device passcode',
  cancelLabel = 'Cancel',
  requireBiometricOnly = false, // ⬅️ control fallback behavior
  showAlertOnFailure = false,
}: {
  reason?: string;
  fallbackLabel?: string;
  cancelLabel?: string;
  requireBiometricOnly?: boolean;
  showAlertOnFailure?: boolean;
} = {}): Promise<boolean> => {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();

  console.log('[Biometric] Hardware available:', hasHardware);
  console.log('[Biometric] Biometric enrolled:', isEnrolled);

  if (!hasHardware || !isEnrolled) {
    console.warn('[Biometric] Unsupported device or no biometrics enrolled.');
    return false;
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: reason,
    fallbackLabel,
    cancelLabel,
    disableDeviceFallback: requireBiometricOnly,
  });

  console.log('[Biometric] Auth result:', result);

  if (!result.success && showAlertOnFailure) {
    let message = 'Authentication failed.';
    switch (result.error) {
      case 'user_cancel':
        message = 'Authentication was cancelled.';
        break;
      case 'user_fallback':
        message = 'Fallback to passcode was requested.';
        break;
      case 'system_cancel':
        message = 'System cancelled the authentication.';
        break;
      case 'biometry_lockout':
        message = 'Too many failed attempts. Please use device passcode.';
        break;
      case 'app_cancel':
        message = 'Authentication cancelled by the app.';
        break;
      case 'not_enrolled':
        message = 'No biometrics are enrolled on this device.';
        break;
    }

    Alert.alert('Biometric Error', message);
  }

  return result.success;
};
