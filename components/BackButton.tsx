import { theme } from '@/constants/theme';
import { BackButtonProps } from '@/types';
import { verticalScale } from '@/utils/styling';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { CaretLeft } from 'phosphor-react-native';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

const BackButton = ({ style, iconSize = 26 }: BackButtonProps) => {
  const navigation = useNavigation();
  const router = useRouter();
  return (
    <TouchableOpacity
      onPress={() => {
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          // fallback: maybe navigate home or show toast
          console.warn('No back history available');
          router.push('/(auth)/welcome');
        }
      }}
      style={[styles.button, style]}
    >
      <CaretLeft
        size={verticalScale(iconSize)}
        color={theme.colors.white}
        weight="bold"
      />
    </TouchableOpacity>
  );
};

export default BackButton;

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.neutral600,
    borderRadius: theme.radius.sm,
    borderCurve: 'continuous',
    alignSelf: 'flex-start',
    padding: 5,
  },
});
