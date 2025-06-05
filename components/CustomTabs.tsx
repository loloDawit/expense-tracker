import { useTheme } from '@/contexts/ThemeContext';
import { scale, verticalScale } from '@/utils/styling';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Icons from 'phosphor-react-native';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

type TabNames = 'home' | 'statistics' | 'wallet' | 'settings';

const CustomTabs = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const { colors } = useTheme();

  const displayLabels: Record<TabNames, string> = {
    home: 'Home',
    statistics: 'Stats',
    wallet: 'Income',
    settings: 'Settings',
  };

  const tabbarIcons: Record<TabNames, (isFocused: boolean) => JSX.Element> = {
    home: (isFocused) => (
      <Icons.House
        size={verticalScale(30)}
        weight={isFocused ? 'fill' : 'regular'}
        color={isFocused ? colors.primary : colors.neutral400}
      />
    ),
    statistics: (isFocused) => (
      <Icons.ChartBar
        size={verticalScale(30)}
        weight={isFocused ? 'fill' : 'regular'}
        color={isFocused ? colors.primary : colors.neutral400}
      />
    ),
    wallet: (isFocused) => (
      <Icons.Wallet
        size={verticalScale(30)}
        weight={isFocused ? 'fill' : 'regular'}
        color={isFocused ? colors.primary : colors.neutral400}
      />
    ),
    settings: (isFocused) => (
      <Icons.Gear
        size={verticalScale(30)}
        weight={isFocused ? 'fill' : 'regular'}
        color={isFocused ? colors.primary : colors.neutral400}
      />
    ),
  };

  return (
    <View
      style={[
        styles.tabbar,
        {
          backgroundColor: colors.neutral800,
          shadowColor: colors.white,
          borderTopColor: colors.neutral700,
          paddingBottom: 10,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const { options } = descriptors[route.key];
        const name = route.name as TabNames;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabbarItem}
          >
            {tabbarIcons[name](isFocused)}
            <Text
              style={[
                styles.label,
                {
                  color: isFocused ? colors.primary : colors.neutral400,
                },
              ]}
            >
              {displayLabels[name]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

export default CustomTabs;

const styles = StyleSheet.create({
  tabbar: {
    flexDirection: 'row',
    width: '100%',
    height: Platform.OS === 'ios' ? verticalScale(73) : verticalScale(60),
    paddingHorizontal: scale(10),
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    borderTopWidth: 1,
  },
  tabbarItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    marginTop: verticalScale(2),
    fontSize: scale(12),
    fontWeight: '500' as const,
  },
});
