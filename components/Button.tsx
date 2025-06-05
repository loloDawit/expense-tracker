import { useTheme } from '@/contexts/ThemeContext';
import { CustomButtonProps } from '@/types';
import { verticalScale } from '@/utils/styling';
import React from 'react';
import { TouchableOpacity, View, ViewStyle } from 'react-native';
import Loading from './Loading';

const Button = ({
  style,
  onPress,
  loading = false,
  disabled = false,
  children,
}: CustomButtonProps) => {
  const { colors, radius } = useTheme();
  const backgroundColor = disabled ? colors.neutral600 : colors.primary;

  const baseStyle: ViewStyle = {
    backgroundColor,
    borderRadius: radius.md,
    borderCurve: 'continuous',
    height: verticalScale(52),
    justifyContent: 'center',
    alignItems: 'center',
  };

  if (loading) {
    return (
      <View style={[baseStyle, style]}>
        <Loading color={colors.black} />
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[baseStyle, style]}
    >
      {children}
    </TouchableOpacity>
  );
};

export default Button;
