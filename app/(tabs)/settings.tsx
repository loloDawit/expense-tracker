
import ScreenWrapper from '@/components/ScreenWrapper';
import Typography from '@/components/Typography';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getUserAvatar } from '@/services/imageServices';
import { migrateWallets } from '@/services/walletService';
import { accountOptionType } from '@/types';
import { verticalScale } from '@/utils/styling';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as Icons from 'phosphor-react-native';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  const { colors, fontSize, spacing } = useTheme();
  return (
    <View style={{ marginBottom: spacing.y._5 }}>
      <View
        style={{
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.neutral600,
          paddingBottom: spacing.y._5,
          marginBottom: spacing.y._10,
        }}
      >
        <Typography size={fontSize.base} fontWeight="600" color={colors.text}>
          {title}
        </Typography>
      </View>
      {children}
    </View>
  );
};

const Settings = () => {
  const { colors, spacing, radius, fontSize } = useTheme();
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

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

  console.log(`App Version: ${appVersion} (${buildVersion})`);
  console.log('Device Info:', JSON.stringify(deviceInfo, null, 2));

  const accountOptions: accountOptionType[] = [
    {
      title: 'Profile',
      icon: (
        <Icons.User
          size={verticalScale(26)}
          color={colors.white}
          weight="fill"
        />
      ),
      routeName: '/(modals)/profileModal',
      bgColor: '#6366f1',
      details: true,
    },
    {
      title: 'Exepnse Categories',
      icon: (
        <Icons.SquaresFour
          size={verticalScale(26)}
          color={colors.white}
          weight="fill"
        />
      ),
      routeName: '/(modals)/categoryModal',
      bgColor: '#10b981',
      details: true,
    },
    {
      title: 'Settings',
      icon: (
        <Icons.GearSix
          size={verticalScale(26)}
          color={colors.white}
          weight="fill"
        />
      ),
      routeName: '/(modals)/settingsModal',
      bgColor: '#059669',
      details: true,
    },
  ];

  const supportOptions: accountOptionType[] = [
    {
      title: 'Privacy Policy',
      icon: (
        <Icons.ShieldCheck
          size={verticalScale(26)}
          color={colors.white}
          weight="fill"
        />
      ),
      bgColor: colors.neutral600,
      details: true,
    },
    {
      title: 'Fix Old Wallets',
      icon: (
        <Icons.Wrench
          size={verticalScale(26)}
          color={colors.white}
          weight="fill"
        />
      ),
      bgColor: colors.primary,
      details: false,
    },
  ];

  const logoutOption: accountOptionType[] = [
    {
      title: 'Logout',
      icon: (
        <Icons.SignOut
          size={verticalScale(26)}
          color={colors.white}
          weight="fill"
        />
      ),
      bgColor: '#e11d48',
      details: false,
    },
  ];

  const handlePress = async (item: accountOptionType) => {
    if (item.routeName) {
      router.push(item.routeName);
    } else if (item.title === 'Logout') {
      logout();
    } else if (item.title === 'Fix Old Wallets') {
      const res = await migrateWallets();
      Alert.alert('Migration', res.msg);
    }
  };

  if (isLoading) {
    return (
      <ScreenWrapper>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.x._10,
          paddingBottom: spacing.y._35,
        }}
      >
        <View style={{ flex: 1, paddingHorizontal: spacing.x._20 }}>
          <View
            style={{
              marginTop: verticalScale(30),
              alignItems: 'center',
              gap: spacing.y._15,
            }}
          >
            <View>
              <Image
                style={{
                  height: verticalScale(135),
                  width: verticalScale(135),
                  borderRadius: 200,
                  backgroundColor: colors.neutral300,
                }}
                source={getUserAvatar(
                  typeof user?.photoURL === 'string' ? user.photoURL : null,
                )}
                contentFit="cover"
                transition={100}
              />
            </View>
            <View style={{ gap: verticalScale(4), alignItems: 'center' }}>
              <Typography
                size={fontSize['2xl']}
                fontWeight="600"
                color={colors.textSecondary}
              >
                {user?.displayName}
              </Typography>
              <Typography
                size={fontSize.base}
                fontWeight="400"
                color={colors.neutral400}
              >
                {user?.email}
              </Typography>
            </View>
          </View>

          <View style={{ marginTop: spacing.y._35 }}>
            <Section title="Account">
              {accountOptions.map((item, index) => (
                <AccountOptionItem
                  key={item.title}
                  item={item}
                  delay={index * 50}
                  onPress={handlePress}
                  spacing={spacing}
                  radius={radius}
                  colors={colors}
                />
              ))}
            </Section>

            <Section title="Support">
              {supportOptions.map((item, index) => (
                <AccountOptionItem
                  key={item.title}
                  item={item}
                  delay={index * 50}
                  onPress={handlePress}
                  spacing={spacing}
                  radius={radius}
                  colors={colors}
                />
              ))}
            </Section>

            <View style={{ marginTop: spacing.y._15 }}>
              {logoutOption.map((item, index) => (
                <AccountOptionItem
                  key={item.title}
                  item={item}
                  delay={index * 50}
                  onPress={handlePress}
                  spacing={spacing}
                  radius={radius}
                  colors={colors}
                />
              ))}
            </View>
            <View style={{ marginTop: spacing.y._15, alignItems: 'center' }}>
              <View style={{ marginTop: spacing.y._5 }}>
                <Typography size={12} color={colors.neutral400}>
                  v{deviceInfo.appVersion} ({deviceInfo.buildVersion})
                </Typography>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default Settings;

const AccountOptionItem = ({
  item,
  delay,
  onPress,
  spacing,
  radius,
  colors,
}: {
  item: accountOptionType;
  delay: number;
  onPress: (item: accountOptionType) => void;
  spacing: any;
  radius: any;
  colors: any;
}) => (
  <Animated.View
    entering={FadeInDown.delay(delay).springify().damping(14)}
    style={{ marginBottom: verticalScale(17) }}
  >
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.x._10,
      }}
      accessibilityRole="button"
      onPress={() => onPress(item)}
      disabled={item.value !== undefined}
    >
      <View
        style={{
          height: verticalScale(44),
          width: verticalScale(44),
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: radius.md,
          backgroundColor: item.bgColor,
        }}
      >
        {item.icon}
      </View>
      <Typography size={14} style={{ flex: 1 }} color={item.bgColor === colors.primary ? colors.white : colors.text}>
        {item.title}
      </Typography>
      {item.value !== undefined ? (
        <Typography size={14} color={colors.textSecondary}>
          {item.value}
        </Typography>
      ) : (
        item.details && (
          <Icons.CaretRight
            size={verticalScale(20)}
            weight="bold"
            color={colors.white}
          />
        )
      )}
    </TouchableOpacity>
  </Animated.View>
);

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
