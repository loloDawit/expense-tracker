import { theme } from '@/constants/theme';
import { ModalWrapperProps } from '@/types';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

const isIos = Platform.OS == 'ios';

const ModalWrapper = ({
  style,
  children,
  bg = theme.colors.neutral800,
}: ModalWrapperProps) => {
  return (
    <View style={[styles.container, { backgroundColor: bg }, style && style]}>
      <StatusBar style="light" />
      {children}
    </View>
  );
};

export default ModalWrapper;

const styles = StyleSheet.create({
  container: {
    paddingTop: isIos ? theme.spacing.x._15 : 50,
    paddingBottom: isIos ? theme.spacing.y._20 : theme.spacing.y._10,
    flex: 1,
  },
});
