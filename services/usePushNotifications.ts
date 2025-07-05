import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { getExpoPushTokenAsync, requestPermissionsAsync, getPermissionsAsync } from 'expo-notifications';
import Constants from 'expo-constants';
import { saveExpoPushToken } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContext';

export const usePushNotifications = () => {
  const { user } = useAuth();

  useEffect(() => {
    registerForPushNotifications();
  }, []);

  const registerForPushNotifications = async () => {
    if (!Device.isDevice || !user?.uid) return;

    const { status: existingStatus } = await getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Notification permissions not granted');
      return;
    }

    const tokenData = await getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas.projectId,
    });
    const token = tokenData.data;
    console.log('✅ Push Token:', token);

    try {
      await saveExpoPushToken(user.uid, token);
    } catch (error) {
      console.error('Failed to save Expo push token:', error);
    }
  };
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});
