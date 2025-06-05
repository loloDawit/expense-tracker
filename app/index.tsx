import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

const Index = () => {
  const { colors } = useTheme();
  const router = useRouter();

  React.useEffect(() => {
    // const timer = setTimeout(() => {
    //   router.push('/(auth)/welcome');
    // }, 5000);
    // return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.neutral900 }]}>
      <Image
        style={styles.logo}
        source={require('@/assets/images/splash2.png')}
        resizeMode="contain"
      />
    </View>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    height: '20%',
    aspectRatio: 1,
  },
});
