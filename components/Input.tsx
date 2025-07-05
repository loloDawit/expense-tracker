import { useTheme } from '@/contexts/ThemeContext';
import { verticalScale } from '@/utils/styling';
import React, { forwardRef } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';

type Props = TextInputProps & {
  icon?: React.ReactNode;
  containerStyle?: ViewStyle;
  error?: boolean;
  errorMessage?: string;
};

const Input = forwardRef<TextInput, Props>((props, ref) => {
  const { colors, spacing, radius } = useTheme();
  const { icon, containerStyle, style, error, errorMessage, ...rest } = props;

  return (
    <View style={containerStyle}>
      <View
        style={[
          styles.inputWrapper,
          {
            borderColor: error ? colors.error || 'red' : colors.neutral300,
            borderRadius: radius.md,
            paddingHorizontal: spacing.x._15,
            gap: spacing.x._10,
            height: verticalScale(54),
          },
        ]}
      >
        {icon}
        <TextInput
          ref={ref}
          style={[
            styles.input,
            { color: colors.text, fontSize: verticalScale(14) }, // force visible text color
            style,
          ]}
          placeholderTextColor={colors.neutral400}
          {...rest}
        />
      </View>
      {error && errorMessage && (
        <Text style={[styles.errorText, { color: colors.error || 'red' }]}>
          {errorMessage}
        </Text>
      )}
    </View>
  );
});

Input.displayName = 'Input';

export default Input;

const styles = StyleSheet.create({
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderCurve: 'continuous',
  },
  input: {
    flex: 1,
    textAlign: 'left',
  },
  errorText: {
    fontSize: verticalScale(12),
    marginTop: verticalScale(4),
  },
});
