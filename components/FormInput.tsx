import { colors, radius, spacingX } from '@/constants/theme';
import { InputProps } from '@/types';
import { verticalScale } from '@/utils/styling';
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import Typography from './Typography';

const FormInput = (props: InputProps) => {
  return (
    <View style={props.containerStyle}>
      {/* Input Row */}
      <View style={styles.inputWrapper}>
        {props.icon && props.icon}
        <TextInput
          style={[styles.input, props.inputStyle]}
          placeholderTextColor={colors.neutral400}
          ref={props.inputRef}
          {...props}
        />
      </View>

      {/* Error message below input */}
      {props.error && (
        <Typography size={12} color="red" style={styles.errorText}>
          {props.error}
        </Typography>
      )}
    </View>
  );
};

export default FormInput;

const styles = StyleSheet.create({
  inputWrapper: {
    flexDirection: 'row',
    height: verticalScale(55),
    borderRadius: radius._17,
    borderCurve: 'continuous',
    borderColor: colors.neutral300,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacingX._15,
    gap: spacingX._10,
  },
  input: {
    flex: 1,
    fontSize: verticalScale(14),
    color: colors.white,
  },
  errorText: {
    marginTop: 4,
    marginLeft: 4,
  },
});
