// components/StatsCard.tsx
import { useTheme } from '@/contexts/ThemeContext';
import { verticalScale } from '@/utils/styling';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type StatsCardProps = {
  label: string;
  value: string | number;
  highlight?: boolean;
};

const StatsCard: React.FC<StatsCardProps> = ({ label, value, highlight }) => {
  const { colors, radius, spacing } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: highlight ? colors.primary : colors.border,
          borderWidth: highlight ? 2 : 1,
          borderRadius: radius.sm,
          padding: spacing.x._10,
        },
      ]}
    >
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        {label}
      </Text>
      <Text style={[styles.value, { color: colors.text }]}>
        {typeof value === 'number' ? `$${value.toFixed(2)}` : value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '45%',
    marginBottom: verticalScale(10),
  },
  label: {
    fontSize: verticalScale(12),
    marginBottom: 4,
  },
  value: {
    fontSize: verticalScale(16),
    fontWeight: '600',
  },
});

export default StatsCard;
