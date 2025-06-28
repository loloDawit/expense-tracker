import { MetricsType, TransactionType } from '@/types';
import { Timestamp } from 'firebase/firestore';

/**
 * Compute all analytics metrics from raw transactions.
 */
export const computeSummaryMetrics = (
  transactions: TransactionType[],
): MetricsType => {
  const income = transactions.filter((t) => t.type === 'income');
  const expenses = transactions.filter((t) => t.type === 'expense');

  const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpenses;

  const avgTransactionAmount =
    transactions.length > 0
      ? (totalIncome + totalExpenses) / transactions.length
      : 0;

  const highestExpense =
    expenses.length > 0 ? Math.max(...expenses.map((t) => t.amount)) : 0;

  const dailySpendMap = new Map<string, number>();
  expenses.forEach((t) => {
    const date = (t.date as Timestamp).toDate().toISOString().split('T')[0];
    dailySpendMap.set(date, (dailySpendMap.get(date) || 0) + t.amount);
  });

  const avgDailySpending =
    dailySpendMap.size > 0
      ? [...dailySpendMap.values()].reduce((a, b) => a + b, 0) /
        dailySpendMap.size
      : 0;

  const mostActiveDay =
    [
      ...transactions.reduce((map, t) => {
        const date = (t.date as Timestamp).toDate().toISOString().split('T')[0];
        map.set(date, (map.get(date) || 0) + 1);
        return map;
      }, new Map<string, number>()),
    ].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';

  const topSpendingCategory =
    [
      ...expenses.reduce((map, t) => {
        const cat = t.category || 'Uncategorized';
        map.set(cat, (map.get(cat) || 0) + t.amount);
        return map;
      }, new Map<string, number>()),
    ].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';

  const topIncomeSource =
    [
      ...income.reduce((map, t) => {
        const src = t.category || 'Other';
        map.set(src, (map.get(src) || 0) + t.amount);
        return map;
      }, new Map<string, number>()),
    ].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';

  return {
    totalIncome,
    totalExpenses,
    netBalance,
    avgTransactionAmount,
    highestExpense,
    avgDailySpending,
    mostActiveDay,
    topSpendingCategory,
    topIncomeSource,
    expenseToIncomeRatio:
      totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0,
  };
};

/**
 * Group transactions into category buckets.
 */
export const groupByCategory = (
  transactions: TransactionType[],
  type: 'income' | 'expense',
): { name: string; amount: number }[] => {
  const grouped = transactions
    .filter((t) => t.type === type)
    .reduce(
      (acc, curr) => {
        const key = curr.category || 'Uncategorized';
        acc[key] = (acc[key] || 0) + curr.amount;
        return acc;
      },
      {} as Record<string, number>,
    );

  return Object.entries(grouped).map(([name, amount]) => ({ name, amount }));
};
