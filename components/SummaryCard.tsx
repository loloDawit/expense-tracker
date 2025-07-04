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

  return (
    <TouchableOpacity
      style={[
        styles.cardContainer,
        { backgroundColor: colors.card, borderRadius: radius.md },
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

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    minWidth: '48%',
    padding: verticalScale(15),
    marginBottom: verticalScale(10),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  highlightedCard: {
    borderWidth: 2,
    borderColor: '#6366f1', // Example highlight color
  },
});

export default SummaryCard;