import { useTheme } from '@/contexts/ThemeContext';
import { BackButtonProps } from '@/types';
import { verticalScale } from '@/utils/styling';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { CaretLeft } from 'phosphor-react-native';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

const createStyles = (colors: any, radius: any) =>
  StyleSheet.create({
    button: {
      backgroundColor: colors.neutral600,
      borderRadius: radius.sm,
      borderCurve: 'continuous',
      alignSelf: 'flex-start',
      padding: 5,
    },
  });

const BackButton = ({ style, iconSize = 26 }: BackButtonProps) => {
  const navigation = useNavigation();
  const { colors, radius } = useTheme();
  const styles = createStyles(colors, radius);
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => {
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          console.warn('No back history available');
          router.push('/(auth)/welcome');
        }
      }}
      style={[styles.button, style]}
    >
      <CaretLeft
        size={verticalScale(iconSize)}
        color={colors.white}
        weight="bold"
      />
    </TouchableOpacity>
  );
};

export default BackButton;
