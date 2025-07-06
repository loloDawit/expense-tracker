import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Platform, View } from 'react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { ModalWrapperProps } from '@/types';

const isIos = Platform.OS === 'ios';

const ModalWrapper = ({ style, children, bg }: ModalWrapperProps) => {
  const { colors, spacing, isDark } = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: bg || colors.background,
          paddingTop: isIos ? spacing.x._15 : 50,
          paddingBottom: isIos ? spacing.y._20 : spacing.y._10,
          flex: 1,
        },
        style,
      ]}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {children}
    </View>
  );
};

export default ModalWrapper;
