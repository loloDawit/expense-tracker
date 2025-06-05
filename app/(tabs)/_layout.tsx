import CustomTabs from '@/components/CustomTabs';
import { Tabs } from 'expo-router';
import React from 'react';

const TabsLayout = () => {
  return (
    <Tabs
      tabBar={(props) => <CustomTabs {...props} />}
      screenOptions={{ headerShown: false, tabBarShowLabel: true }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="statistics" />
      <Tabs.Screen name="wallet" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
};

export default TabsLayout;
