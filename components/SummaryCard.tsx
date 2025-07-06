import Typography from '@/components/Typography';
import { useTheme } from '@/contexts/ThemeContext';
import { verticalScale } from '@/utils/styling';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface SummaryCardProps {
  label: string;
  value: string | number;
  highlight?: boolean;
  onPress?: () => void;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  label,
  value,
  highlight,
  onPress,
}) => {
  const { colors, spacing, radius, fontSize } = useTheme();
  const styles = React.useMemo(() => createStyles(colors, spacing, radius, fontSize), [colors, spacing, radius, fontSize]);

  return (
    <TouchableOpacity
      style={[
        styles.cardContainer,
        highlight && styles.highlightedCard,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Typography
        size={fontSize.sm}
        color={colors.textSecondary}
        fontWeight="500"
      >
        {label}
      </Typography>
      <Typography
        size={fontSize.lg}
        color={highlight ? colors.primary : colors.text}
        fontWeight="700"
        style={{ marginTop: spacing.y._5 }}
      >
        {typeof value === 'number' ? `$${value.toFixed(2)}` : value}
      </Typography>
    </TouchableOpacity>
  );
};

const createStyles = (colors: any, spacing: any, radius: any, fontSize: any) =>
  StyleSheet.create({
    cardContainer: {
      flex: 1,
      minWidth: '48%',
      padding: verticalScale(15),
      marginBottom: verticalScale(10),
      shadowColor: colors.isDark ? colors.white : colors.black,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.22,
      shadowRadius: 2.22,
      elevation: 3,
      backgroundColor: colors.card,
      borderRadius: radius.md,
    },
    highlightedCard: {
      borderWidth: 2,
      borderColor: colors.primary, // Example highlight color
    },
  });

export default SummaryCard;