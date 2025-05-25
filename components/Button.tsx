import { theme } from '@/constants/theme';
import { CustomButtonProps } from '@/types';
import { verticalScale } from '@/utils/styling';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Loading from './Loading';

const Button = ({
  style,
  onPress,
  loading = false,
  disabled = false,
  children,
}: CustomButtonProps) => {
  const backgroundColor = disabled
    ? theme.colors.neutral600
    : theme.colors.primary;

  if (loading) {
    return (
      <View style={[styles.button, style, { backgroundColor }]}>
        <Loading />
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        style,
        { backgroundColor },
        disabled && styles.disabled,
      ]}
    >
      {children}
    </TouchableOpacity>
  );
};

export default Button;

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    borderCurve: 'continuous',
    height: verticalScale(52),
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: {
    backgroundColor: theme.colors.neutral600,
  },
});
