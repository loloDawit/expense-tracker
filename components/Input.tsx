import { useTheme } from '@/contexts/ThemeContext';
import { verticalScale } from '@/utils/styling';
import React, { forwardRef } from 'react';
import { TextInput, TextInputProps, View, ViewStyle } from 'react-native';

type Props = TextInputProps & {
  icon?: React.ReactNode;
  containerStyle?: ViewStyle;
};

const Input = forwardRef<TextInput, Props>((props, ref) => {
  const { colors, spacing, radius } = useTheme();
  const { icon, containerStyle, style, ...rest } = props;

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          height: verticalScale(54),
          alignItems: 'center',
          justifyContent: 'center',
          borderCurve: 'continuous',
          borderWidth: 1,
          borderColor: colors.neutral300,
          borderRadius: radius.md,
          paddingHorizontal: spacing.x._15,
          gap: spacing.x._10,
        },
        containerStyle,
      ]}
    >
      {icon}
      <TextInput
        ref={ref}
        style={[
          {
            flex: 1,
            fontSize: verticalScale(14),
            color: colors.text,
            textAlign: 'left',
          },
          style,
        ]}
        placeholderTextColor={colors.neutral400}
        {...rest}
      />
    </View>
  );
});

Input.displayName = 'Input';

export default Input;
