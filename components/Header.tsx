import { HeaderProps } from '@/types';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Typography from './Typography';

const Header = ({ title = '', leftIcon, rightIcon, style }: HeaderProps) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.sideIcon}>{leftIcon}</View>

      <View style={styles.titleContainer}>
        <Typography size={22} fontWeight={'600'} style={styles.titleText}>
          {title}
        </Typography>
      </View>

      <View style={styles.sideIcon}>{rightIcon}</View>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sideIcon: {
    width: 40, // Fixed width to reserve space for icons
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  titleText: {
    textAlign: 'center',
  },
});
