import Button from '@/components/Button';
import Typo from '@/components/Typo';
import { colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const Home = () => {
  const { logout } = useAuth();
  return (
    <View>
      <Text>Home</Text>
      <Button
        onPress={async () => {
          await logout();
        }}
        style={{
          marginTop: 20,
          marginBottom: 20,
          marginLeft: 20,
          marginRight: 20,
        }}
      >
        <Typo size={16} color={colors.white}>
          Logout
        </Typo>
      </Button>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({});
