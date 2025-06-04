import { theme } from '@/constants/theme';
import { verticalScale } from '@/utils/styling';
import React, { forwardRef } from 'react';
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';

type Props = TextInputProps & {
  icon?: React.ReactNode;
  containerStyle?: ViewStyle;
};

const Input = forwardRef<TextInput, Props>((props, ref) => {
  const { icon, containerStyle, style, ...rest } = props;

  return (
    <View style={[styles.container, containerStyle]}>
      {icon}
      <TextInput
        ref={ref}
        style={[
          styles.input,
          style, // ✅ allow custom input styles
        ]}
        placeholderTextColor={theme.colors.neutral400}
        {...rest}
      />
    </View>
  );
});

export default Input;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: verticalScale(54),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.neutral300,
    borderRadius: theme.radius.md,
    borderCurve: 'continuous',
    paddingHorizontal: theme.spacing.x._15,
    gap: theme.spacing.x._10,
  },
  input: {
    flex: 1,
    fontSize: verticalScale(14),
    color: theme.colors.white,
    textAlign: 'left',
  },
});
