import { useTheme } from '@/contexts/ThemeContext';
import { InputProps } from '@/types';
import { verticalScale } from '@/utils/styling';
import React from 'react';
import { TextInput, View } from 'react-native';
import Typography from './Typography';

const FormInput = (props: InputProps) => {
  const { colors, spacing, radius } = useTheme();

  return (
    <View style={props.containerStyle}>
      {/* Input Row */}
      <View
        style={{
          flexDirection: 'row',
          height: verticalScale(55),
          borderRadius: radius.sm,
          borderCurve: 'continuous',
          borderColor: colors.neutral300,
          borderWidth: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: spacing.y._15,
          gap: spacing.x._10,
        }}
      >
        {props.icon && props.icon}
        <TextInput
          style={[
            {
              flex: 1,
              fontSize: verticalScale(14),
              color: colors.text,
            },
            props.inputStyle,
          ]}
          placeholderTextColor={colors.neutral400}
          ref={props.inputRef}
          {...props}
        />
      </View>

      {/* Error message below input */}
      {props.error && (
        <Typography
          size={12}
          color="red"
          style={{ marginTop: 4, marginLeft: 4 }}
        >
          {props.error}
        </Typography>
      )}
    </View>
  );
};

export default FormInput;
