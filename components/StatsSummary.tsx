import { useTheme } from '@/contexts/ThemeContext';
import { verticalScale } from '@/utils/styling';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import StatsCard from './StatsCard';

type MetricsType = {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  avgTransactionAmount: number;
  highestExpense: number;
  avgDailySpending: number;
  mostActiveDay: string;
  topSpendingCategory: string;
  topIncomeSource: string;
  expenseToIncomeRatio: number;
};

type Props = {
  metrics: MetricsType;
};

const StatsSummary: React.FC<Props> = ({ metrics }) => {
  const { colors, spacing } = useTheme();

  return (
    <View style={[styles.container, { gap: spacing.y._10 }]}>
      <StatsCard label="Total Income" value={metrics.totalIncome} highlight />
      <StatsCard label="Total Expenses" value={metrics.totalExpenses} />
      <StatsCard label="Net Balance" value={metrics.netBalance} />
      <StatsCard label="Avg Transaction" value={metrics.avgTransactionAmount} />
      <StatsCard label="Highest Expense" value={metrics.highestExpense} />
      <StatsCard label="Avg Daily Spending" value={metrics.avgDailySpending} />
      <StatsCard label="Top Category" value={metrics.topSpendingCategory} />
      <StatsCard label="Top Income Source" value={metrics.topIncomeSource} />
      <StatsCard label="Most Active Day" value={metrics.mostActiveDay ?? '—'} />
      <StatsCard
        label="Expense to Income"
        value={`${metrics.expenseToIncomeRatio.toFixed(1)}%`}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: verticalScale(10),
  },
});

export default StatsSummary;
