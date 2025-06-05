import { useTheme } from '@/contexts/ThemeContext';
import { ScreenWrapperProps } from '@/types';
import React from 'react';
import {
  Dimensions,
  Platform,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';

const { height } = Dimensions.get('window');

const ScreenWrapper = ({ style, children }: ScreenWrapperProps) => {
  const { colors } = useTheme();
  let paddingTop = Platform.OS === 'ios' ? height * 0.06 : 50;
  return (
    <View
      style={[
        {
          paddingTop,
          flex: 1,
          backgroundColor: colors.background,
        },
        style,
      ]}
    >
      <StatusBar barStyle="light-content" />

      {children}
    </View>
  );
};

export default ScreenWrapper;

const styles = StyleSheet.create({});
