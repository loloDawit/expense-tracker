import BackButton from '@/components/BackButton';
import Header from '@/components/Header';
import ModalWrapper from '@/components/ModalWrapper';
import Typography from '@/components/Typography';
import { auth, firestore } from '@/config/firebase';
import { useTheme } from '@/contexts/ThemeContext';
import { verticalScale } from '@/utils/styling';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Bell, Moon, Palette, ShieldCheck, Sun } from 'phosphor-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from 'react-native';

async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      Alert.alert('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);
  } else {
    Alert.alert('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

interface SettingItemProps {
  icon: React.ReactNode;
  label: string;
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  onPress?: () => void;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  label,
  value,
  onValueChange,
  onPress,
}) => {
  const { colors } = useTheme();
  const styles = useStyles();

  return (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingInfo}>
        <View style={styles.iconContainer}>{icon}</View>
        <Typography size={16} fontWeight="500" color={colors.text}>
          {label}
        </Typography>
      </View>
      {value !== undefined && onValueChange && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.neutral300, true: colors.primary }}
          thumbColor={colors.white}
        />
      )}
    </TouchableOpacity>
  );
};

type SectionHeaderProps = {
  title: string;
};

const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => {
  const styles = useStyles();
  return <Typography style={styles.sectionHeader}>{title}</Typography>;
};

const AboutSection = () => {
  const styles = useStyles();
  const appVersion = Constants.expoConfig?.version ?? 'N/A';
  const buildVersion =
    Platform.OS === 'ios'
      ? (Constants.platform?.ios?.buildNumber ?? 'N/A')
      : (Constants.platform?.android?.versionCode?.toString() ?? 'N/A');

  const deviceInfo = {
    modelName: Device.modelName ?? 'Unknown',
    osName: Device.osName ?? 'OS',
    osVersion: Device.osVersion ?? '0',
    appVersion,
    buildVersion,
  };

  return (
    <View style={styles.aboutContainer}>
      <Typography>Device: {deviceInfo.modelName}</Typography>
      <Typography>
        OS: {deviceInfo.osName} {deviceInfo.osVersion}
      </Typography>
      <Typography>App Version: {deviceInfo.appVersion}</Typography>
      <Typography>Build Version: {deviceInfo.buildVersion}</Typography>
    </View>
  );
};

const SettingsModal = () => {
  const { colors, isDark, toggleTheme } = useTheme();
  const styles = useStyles();
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    const setupNotifications = async () => {
      if (auth.currentUser) {
        const userRef = doc(firestore, 'users', auth.currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setNotificationsEnabled(userData.notificationsEnabled || false);
          setExpoPushToken(userData.expoPushToken || '');
        }
      }
    };

    setupNotifications();

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log({ notification });
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log({ response });
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current,
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const handleNotificationsChange = async () => {
    const newNotificationsEnabled = !notificationsEnabled;
    setNotificationsEnabled(newNotificationsEnabled);

    if (auth.currentUser) {
      const userRef = doc(firestore, 'users', auth.currentUser.uid);
      let token = expoPushToken;

      if (newNotificationsEnabled && !token) {
        token = (await registerForPushNotificationsAsync()) as string;
        setExpoPushToken(token);
      }

      await updateDoc(userRef, {
        notificationsEnabled: newNotificationsEnabled,
        expoPushToken: newNotificationsEnabled ? token : '',
      });
    }
  };

  return (
    <ModalWrapper>
      <View style={styles.container}>
        <Header title="Settings" leftIcon={<BackButton />} />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <SectionHeader title="Preferences" />
            <SettingItem
              icon={
                isDark ? (
                  <Moon size={20} color={colors.primary} />
                ) : (
                  <Sun size={20} color={colors.primary} />
                )
              }
              label="Dark Mode"
              value={isDark}
              onValueChange={toggleTheme}
            />
            <SettingItem
              icon={<Bell size={20} color={colors.primary} />}
              label="Notifications"
              value={notificationsEnabled}
              onValueChange={handleNotificationsChange}
            />
            <SettingItem
              icon={<Palette size={20} color={colors.primary} />}
              label="Appearance"
            />
          </View>

          <View style={styles.section}>
            <SectionHeader title="Support" />
            <SettingItem
              icon={<ShieldCheck size={20} color={colors.primary} />}
              label="Privacy Policy"
            />
          </View>

          <View style={styles.section}>
            <SectionHeader title="About" />
            <AboutSection />
          </View>
        </ScrollView>
      </View>
    </ModalWrapper>
  );
};

const useStyles = () => {
  const { colors, spacing, radius, isDark } = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: spacing.x._20,
    },
    scrollContent: {
      paddingBottom: spacing.y._20,
    },
    section: {
      marginTop: verticalScale(24),
    },
    sectionHeader: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.neutral500,
      marginBottom: spacing.y._7,
    },
    settingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: verticalScale(14),
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    settingInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: verticalScale(12),
    },
    iconContainer: {
      height: verticalScale(34),
      width: verticalScale(34),
      borderRadius: 100,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.primaryLight,
    },
    aboutContainer: {
      backgroundColor: isDark ? colors.neutral800 : colors.textSecondary,
      padding: spacing.y._15,
      borderRadius: radius.md,
      gap: 6,
    },
  });
};

export default SettingsModal;
