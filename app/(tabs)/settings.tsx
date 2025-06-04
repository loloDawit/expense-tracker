import Header from '@/components/Header';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typography from '@/components/Typography';
import { theme } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { getUserAvatar } from '@/services/imageServices';
import { accountOptionType } from '@/types';
import { verticalScale } from '@/utils/styling';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as Icons from 'phosphor-react-native';
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const rawOptions: Partial<accountOptionType>[] = [
  {
    title: 'Edit Profile',
    icon: (
      <Icons.User
        size={verticalScale(26)}
        color={theme.colors.white}
        weight="fill"
      />
    ),
    routeName: '/(modals)/profileModal',
    bgColor: '#6366f1',
  },
  {
    title: 'Exepnse Categories',
    icon: (
      <Icons.SquaresFour
        size={verticalScale(26)}
        color={theme.colors.white}
        weight="fill"
      />
    ),
    routeName: '/(modals)/categoryModal',
    bgColor: '#10b981',
  },
  {
    title: 'Settings',
    icon: (
      <Icons.GearSix
        size={verticalScale(26)}
        color={theme.colors.white}
        weight="fill"
      />
    ),
    routeName: '/(modals)/settingsModal',
    bgColor: '#059669',
  },
  {
    title: 'Privacy Policy',
    icon: (
      <Icons.Lock
        size={verticalScale(26)}
        color={theme.colors.white}
        weight="fill"
      />
    ),
    bgColor: theme.colors.neutral600,
  },
  {
    title: 'Logout',
    icon: (
      <Icons.SignOut
        size={verticalScale(26)}
        color={theme.colors.white}
        weight="fill"
      />
    ),
    bgColor: '#e11d48',
    details: false,
  },
];

const accountOptions: accountOptionType[] = rawOptions.map((opt) => ({
  details: true,
  ...opt,
})) as accountOptionType[];

const Profile = () => {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

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
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Header
          title="Profile"
          style={{ marginVertical: theme.spacing.y._10 }}
        />

        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            <Image
              style={styles.avatar}
              source={getUserAvatar(
                typeof user?.photoURL === 'string' ? user.photoURL : null,
              )}
              contentFit="cover"
              transition={100}
            />
          </View>
          <View style={styles.nameContainer}>
            <Typography
              size={theme.fontSize['2xl']}
              fontWeight="600"
              color={theme.colors.neutral100}
            >
              {user?.displayName}
            </Typography>
            <Typography
              size={theme.fontSize.base}
              fontWeight="400"
              color={theme.colors.neutral400}
            >
              {user?.email}
            </Typography>
          </View>
        </View>

        <View style={styles.accountOptions}>
          {accountOptions.map((item, index) => (
            <AccountOptionItem
              key={item.title}
              item={item}
              delay={index * 50}
              onPress={handlePress}
            />
          ))}
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Profile;

const AccountOptionItem = ({
  item,
  delay,
  onPress,
}: {
  item: accountOptionType;
  delay: number;
  onPress: (item: accountOptionType) => void;
}) => (
  <Animated.View
    entering={FadeInDown.delay(delay).springify().damping(14)}
    style={styles.listItem}
  >
    <TouchableOpacity
      style={styles.flexRow}
      accessibilityRole="button"
      onPress={() => onPress(item)}
    >
      <View style={[styles.listIcon, { backgroundColor: item.bgColor }]}>
        {item.icon}
      </View>
      <Typography size={16} style={{ flex: 1 }} fontWeight="500">
        {item.title}
      </Typography>
      {item.details && (
        <Icons.CaretRight
          size={verticalScale(20)}
          weight="bold"
          color={theme.colors.white}
        />
      )}
    </TouchableOpacity>
  </Animated.View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.x._20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    marginTop: verticalScale(30),
    alignItems: 'center',
    gap: theme.spacing.y._15,
  },
  avatarContainer: {
    alignSelf: 'center',
  },
  avatar: {
    alignSelf: 'center',
    backgroundColor: theme.colors.neutral300,
    height: verticalScale(135),
    width: verticalScale(135),
    borderRadius: 200,
  },
  nameContainer: {
    gap: verticalScale(4),
    alignItems: 'center',
  },
  listIcon: {
    height: verticalScale(44),
    width: verticalScale(44),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.md,
    borderCurve: 'continuous',
  },
  listItem: {
    marginBottom: verticalScale(17),
  },
  accountOptions: {
    marginTop: theme.spacing.y._35,
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.x._10,
  },
});
