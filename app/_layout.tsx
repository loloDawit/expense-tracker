import { AuthProvider } from '@/contexts/AuthContext';
import { Stack } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';

const Layout = () => {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
};

export default Layout;

const styles = StyleSheet.create({});
