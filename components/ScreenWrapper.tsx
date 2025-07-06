import { useTheme } from '@/contexts/ThemeContext';
import { ScreenWrapperProps } from '@/types';
import React from 'react';
import {
  Dimensions,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  View,
} from 'react-native';

const { height } = Dimensions.get('window');

interface ExtendedScreenWrapperProps extends ScreenWrapperProps {
  refreshing?: boolean;
  onRefresh?: () => void;
  scrollable?: boolean; // Optional: allow both scroll & non-scroll screens
}

const ScreenWrapper = ({
  style,
  children,
  refreshing = false,
  onRefresh,
  scrollable = false,
}: ExtendedScreenWrapperProps) => {
  console.log('onRefresh', onRefresh);
  console.log('[ScreenWrapper] refreshing:', refreshing);

  const { colors, isDark } = useTheme();
  const paddingTop = Platform.OS === 'ios' ? height * 0.06 : 50;

  const content = (
    <View
      style={[
        { paddingTop, flex: 1, backgroundColor: colors.background },
        style,
      ]}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      {children}
    </View>
  );

  // If scrollable is true, wrap inside ScrollView with RefreshControl
  if (scrollable) {
    return (
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          ) : undefined
        }
        style={{ backgroundColor: colors.background }}
      >
        {content}
      </ScrollView>
    );
  }

  return content;
};

export default ScreenWrapper;
