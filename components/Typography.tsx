import { useTheme } from '@/contexts/ThemeContext';
import { TypoProps } from '@/types';
import { verticalScale } from '@/utils/styling';
import { Text, TextStyle } from 'react-native';
import React from 'react';


const Typography = ({
  size,
  color,
  fontWeight = '400',
  children,
  style,
  textProps = {},
}: TypoProps) => {
  const { colors } = useTheme();

  const textStyle: TextStyle = {
    fontSize: size ? verticalScale(size) : verticalScale(18),
    color: color || colors.text,
    fontWeight,
  };

  return (
    <Text style={[textStyle, style]} {...textProps}>
      {children}
    </Text>
  );
};

export default Typography;


