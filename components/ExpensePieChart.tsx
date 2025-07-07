import { formatAmount } from '@/utils/helper';
import { useTheme } from '@/contexts/ThemeContext';
import { verticalScale } from '@/utils/styling';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PieChart, pieDataItem } from 'react-native-gifted-charts';

type ChartData = { name: string; amount: number }[];

type Props = {
  data: ChartData;
  title?: string;
};

// ✅ Centralized category color map
const categoryColors: Record<string, string> = {
  rent: '#F44336',
  groceries: '#2196F3',
  insurance: '#FF9800',
  utilities: '#4CAF50',
  transport: '#00BCD4',
  entertainment: '#9C27B0',
  shopping: '#8BC34A',
  others: '#FFEB3B',
};

const fallbackColors = Object.values(categoryColors);

const ExpensePieChart = ({ data, title = 'Breakdown' }: Props) => {
  const { colors } = useTheme();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const total = data.reduce((sum, item) => sum + item.amount, 0);
  if (total === 0) return null;

  const pieData = data
    .filter((item) => item.amount > 0)
    .map((item, index) => {
      const categoryKey = item.name.toLowerCase();
      const color =
        categoryColors[categoryKey] ||
        fallbackColors[index % fallbackColors.length];
      const percent = Math.round((item.amount / total) * 100);
      return {
        value: item.amount,
        color,
        text: `${percent}%`,
        label: item.name,
        percent,
      };
    });

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

      <PieChart
        data={pieData}
        donut
        radius={verticalScale(100)}
        innerRadius={verticalScale(60)}
        innerCircleColor={colors.card}
        showValuesAsLabels
        labelsPosition="outward"
        textColor={colors.text}
        textSize={verticalScale(11)}
        isAnimated
        animationDuration={700}
        setSelectedIndex={setSelectedIndex}
        onPress={(item: pieDataItem, index: number) => {
          setSelectedIndex(index === selectedIndex ? null : index);
        }}
        centerLabelComponent={() => {
          const selected =
            selectedIndex !== null ? pieData[selectedIndex] : null;
          return (
            <View style={styles.centerLabel}>
              <Text style={[styles.totalText, { color: colors.text }]}>
                {selected ? `${selected.label}` : formatAmount(total)}
              </Text>
              <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>
                {selected ? `${selected.percent}%` : 'Total'}
              </Text>
            </View>
          );
        }}
      />

      <View style={styles.legend}>
        {pieData.map((item, index) => (
          <View key={index} style={styles.legendRow}>
            <View style={[styles.colorDot, { backgroundColor: item.color }]} />
            <Text style={[styles.legendText, { color: colors.text }]}>
              {item.label} - {formatAmount(item.value)} ({item.percent}%)
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: verticalScale(12),
  },
  title: {
    fontSize: verticalScale(16),
    fontWeight: '600',
  },
  centerLabel: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalText: {
    fontSize: verticalScale(16),
    fontWeight: 'bold',
  },
  totalLabel: {
    fontSize: verticalScale(12),
    marginTop: 2,
  },
  legend: {
    marginTop: verticalScale(16),
    width: '100%',
    paddingHorizontal: 20,
    gap: verticalScale(6),
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: verticalScale(13),
  },
});

export default ExpensePieChart;
