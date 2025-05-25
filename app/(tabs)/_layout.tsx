import CustomTabs from '@/components/CustomTabs';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs } from 'expo-router';
import React from 'react';

const Home = () => {
  const { user } = useAuth();
  console.log('user', user);
  return (
    <Tabs tabBar={CustomTabs} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="statistics" />
      <Tabs.Screen name="wallet" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
};

export default Home;
