import { theme } from '@/constants/theme';
import { scale, verticalScale } from '@/utils/styling';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Icons from 'phosphor-react-native';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

const CustomTabs = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const tabbarIcons: any = {
    home: (isFocused: boolean) => (
      <Icons.House
        size={verticalScale(30)}
        weight={isFocused ? 'fill' : 'regular'}
        color={isFocused ? theme.colors.primary : theme.colors.neutral400}
      />
    ),
    statistics: (isFocused: boolean) => (
      <Icons.ChartBar
        size={verticalScale(30)}
        weight={isFocused ? 'fill' : 'regular'}
        color={isFocused ? theme.colors.primary : theme.colors.neutral400}
      />
    ),
    wallet: (isFocused: boolean) => (
      <Icons.Wallet
        size={verticalScale(30)}
        weight={isFocused ? 'fill' : 'regular'}
        color={isFocused ? theme.colors.primary : theme.colors.neutral400}
      />
    ),
    profile: (isFocused: boolean) => (
      <Icons.User
        size={verticalScale(30)}
        weight={isFocused ? 'fill' : 'regular'}
        color={isFocused ? theme.colors.primary : theme.colors.neutral400}
      />
    ),
  };

  return (
    <View style={styles.tabbar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];

        const isFocused = state.index === index;

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
          <TouchableOpacity
            key={route.name}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabbarItem}
          >
            {tabbarIcons[route.name] && tabbarIcons[route.name](isFocused)}
          </TouchableOpacity>
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
    height: Platform.OS == 'ios' ? verticalScale(73) : verticalScale(55),
    paddingHorizontal: scale(10),
    backgroundColor: theme.colors.neutral800,
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: theme.colors.white,
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    borderTopColor: theme.colors.neutral700,
    borderTopWidth: 1,
  },
  tabbarItem: {
    marginBottom:
      Platform.OS == 'ios' ? theme.spacing.y._10 : theme.spacing.y._5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
