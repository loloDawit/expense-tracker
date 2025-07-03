import Header from '@/components/Header';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typography from '@/components/Typography';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getUserAvatar } from '@/services/imageServices';
import { accountOptionType } from '@/types';
import { verticalScale } from '@/utils/styling';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as Icons from 'phosphor-react-native';
import React from 'react';
import {
  ActivityIndicator,
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
        <Typography
          size={fontSize.base}
          fontWeight="600"
          color={colors.text}
        >
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

  const handlePress = (item: accountOptionType) => {
    if (item.routeName) {
      router.push(item.routeName);
    } else if (item.title === 'Logout') {
      logout();
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
          <Header title="Settings" style={{ marginVertical: spacing.y._10 }} />

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
              <AccountOptionItem
                item={accountOptions[0]}
                delay={0}
                onPress={handlePress}
                spacing={spacing}
                radius={radius}
                colors={colors}
              />
            </Section>

            <Section title="Preferences">
              <AccountOptionItem
                item={accountOptions[1]}
                delay={50}
                onPress={handlePress}
                spacing={spacing}
                radius={radius}
                colors={colors}
              />
              <AccountOptionItem
                item={accountOptions[2]}
                delay={100}
                onPress={handlePress}
                spacing={spacing}
                radius={radius}
                colors={colors}
              />
            </Section>

            <Section title="Support">
              <AccountOptionItem
                item={accountOptions[3]}
                delay={150}
                onPress={handlePress}
                spacing={spacing}
                radius={radius}
                colors={colors}
              />
            </Section>

            <View style={{ marginTop: spacing.y._15 }}>
              <AccountOptionItem
                item={accountOptions[4]}
                delay={200}
                onPress={handlePress}
                spacing={spacing}
                radius={radius}
                colors={colors}
              />
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
      <Typography size={14} style={{ flex: 1 }}>
        {item.title}
      </Typography>
      {item.details && (
        <Icons.CaretRight
          size={verticalScale(20)}
          weight="bold"
          color={colors.white}
        />
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
