import { useTheme } from '@/contexts/ThemeContext';
import { MetricsType } from '@/types';
import { verticalScale } from '@/utils/styling';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import SummaryCard from './SummaryCard';

type Props = {
  metrics: MetricsType;
};

const StatsSummary: React.FC<Props> = ({ metrics }) => {
  const { spacing } = useTheme();
  const [selectedCard, setSelectedCard] = useState<string | null>('Total Income');

  console.log('StatsSummary metrics:', metrics);

  const handleCardPress = (label: string) => {
    setSelectedCard(label);
  };

  return (
    <View style={[styles.container, { gap: spacing.y._10 }]}>
      <SummaryCard
        label="Total Income"
        value={metrics.totalIncome}
        highlight={selectedCard === 'Total Income'}
        onPress={() => handleCardPress('Total Income')}
      />
      <SummaryCard
        label="Total Expenses"
        value={metrics.totalExpenses}
        highlight={selectedCard === 'Total Expenses'}
        onPress={() => handleCardPress('Total Expenses')}
      />
      <SummaryCard
        label="Net Balance"
        value={metrics.netBalance}
        highlight={selectedCard === 'Net Balance'}
        onPress={() => handleCardPress('Net Balance')}
      />
      <SummaryCard
        label="Avg Transaction"
        value={metrics.avgTransactionAmount}
        highlight={selectedCard === 'Avg Transaction'}
        onPress={() => handleCardPress('Avg Transaction')}
      />
      <SummaryCard
        label="Highest Expense"
        value={metrics.highestExpense}
        highlight={selectedCard === 'Highest Expense'}
        onPress={() => handleCardPress('Highest Expense')}
      />
      <SummaryCard
        label="Avg Daily Spending"
        value={metrics.avgDailySpending}
        highlight={selectedCard === 'Avg Daily Spending'}
        onPress={() => handleCardPress('Avg Daily Spending')}
      />
      <SummaryCard
        label="Top Category"
        value={metrics.topSpendingCategory}
        highlight={selectedCard === 'Top Category'}
        onPress={() => handleCardPress('Top Category')}
      />
      <SummaryCard
        label="Top Income Source"
        value={metrics.topIncomeSource}
        highlight={selectedCard === 'Top Income Source'}
        onPress={() => handleCardPress('Top Income Source')}
      />
      <SummaryCard
        label="Most Active Day"
        value={metrics.mostActiveDay ?? '—'}
        highlight={selectedCard === 'Most Active Day'}
        onPress={() => handleCardPress('Most Active Day')}
      />
      <SummaryCard
        label="Expense to Income"
        value={`${metrics.expenseToIncomeRatio.toFixed(1)}%`}
        highlight={selectedCard === 'Expense to Income'}
        onPress={() => handleCardPress('Expense to Income')}
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
