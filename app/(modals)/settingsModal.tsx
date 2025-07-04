import { useTheme } from '@/contexts/ThemeContext';
import { verticalScale } from '@/utils/styling';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Bell, Moon, ShieldCheck, Sun } from 'phosphor-react-native';
import React from 'react';
import { Platform, ScrollView, StyleSheet, Switch, View } from 'react-native';

import Header from '@/components/Header';
import ModalWrapper from '@/components/ModalWrapper';
import Typography from '@/components/Typography';

const SettingsModal = () => {
  const { colors, spacing, radius, isDark, toggleTheme } = useTheme();

  const appVersion = Constants.expoConfig?.version ?? 'N/A';
  const buildVersion =
    Platform.OS === 'ios'
      ? (Constants.platform?.ios?.buildNumber ?? 'N/A')
      : (Constants.platform?.android?.versionCode?.toString() ?? 'N/A');

  const deviceInfo = {
    modelName: Device.modelName ?? 'Unknown',
    osName: Device.osName ?? 'OS',
    osVersion: Device.osVersion ?? '0',
    appVersion,
    buildVersion,
  };

  console.log(`App Version: ${appVersion} (${buildVersion})`);
  console.log('Device Info:', JSON.stringify(deviceInfo, null, 2));

  return (
    <ModalWrapper>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.x._20 }}
        showsVerticalScrollIndicator={false}
      >
        <Header title="Settings" style={{ marginVertical: spacing.y._10 }} />

        {/* Preferences */}
        <View style={styles.section}>
          <Typography
            size={14}
            fontWeight="600"
            color={colors.neutral500}
            style={{ marginBottom: spacing.y._7 }}
          >
            Preferences
          </Typography>

          <View
            style={[styles.settingItem, { borderBottomColor: colors.border }]}
          >
            <View style={styles.settingInfo}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: colors.primaryLight },
                ]}
              >
                {isDark ? (
                  <Moon size={20} color={colors.primary} />
                ) : (
                  <Sun size={20} color={colors.primary} />
                )}
              </View>
              <Typography
                size={16}
                fontWeight="500"
                color={colors.text}
                style={{ flex: 1 }}
              >
                Dark Mode
              </Typography>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.neutral300, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          <View
            style={[styles.settingItem, { borderBottomColor: colors.border }]}
          >
            <View style={styles.settingInfo}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: colors.primaryLight },
                ]}
              >
                <Bell size={20} color={colors.primary} />
              </View>
              <Typography
                size={16}
                fontWeight="500"
                color={colors.text}
                style={{ flex: 1 }}
              >
                Notifications
              </Typography>
            </View>
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Typography
            size={14}
            fontWeight="600"
            color={colors.neutral500}
            style={{ marginBottom: spacing.y._7 }}
          >
            Support
          </Typography>

          <View
            style={[styles.settingItem, { borderBottomColor: colors.border }]}
          >
            <View style={styles.settingInfo}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: colors.primaryLight },
                ]}
              >
                <ShieldCheck size={20} color={colors.primary} />
              </View>
              <Typography
                size={16}
                fontWeight="500"
                color={colors.text}
                style={{ flex: 1 }}
              >
                Privacy Policy
              </Typography>
            </View>
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Typography
            size={14}
            fontWeight="600"
            color={colors.neutral500}
            style={{ marginBottom: spacing.y._7 }}
          >
            About
          </Typography>

          <View
            style={{
              backgroundColor: isDark
                ? colors.neutral800
                : colors.textSecondary,
              padding: spacing.y._15,
              borderRadius: radius.md,
              gap: 6,
            }}
          >
            <Typography size={14} color={colors.text}>
              Device: {deviceInfo.modelName}
            </Typography>
            <Typography size={14} color={colors.text}>
              OS: {deviceInfo.osName} {deviceInfo.osVersion}
            </Typography>
            <Typography size={14} color={colors.text}>
              App Version: {deviceInfo.appVersion}
            </Typography>
            <Typography size={14} color={colors.text}>
              Build Version: {deviceInfo.buildVersion}
            </Typography>
          </View>
        </View>
      </ScrollView>
    </ModalWrapper>
  );
};

export default SettingsModal;

const styles = StyleSheet.create({
  section: {
    marginTop: verticalScale(24),
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(14),
    borderBottomWidth: 1,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: verticalScale(12),
    flex: 1,
  },
  iconContainer: {
    height: verticalScale(34),
    width: verticalScale(34),
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
