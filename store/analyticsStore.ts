import {
  fetchMonthlyStats,
  fetchWeeklyStats,
  fetchYearlyStats,
} from '@/services/transactionService';
import { ChartState } from '@/types';
import {
  computeSummaryMetrics,
  groupByCategory,
} from '@/utils/statisticsHelpers';
import { create } from 'zustand';

interface AnalyticsStore {
  chartState: ChartState;
  chartLoading: boolean;
  fetchAnalytics: (
    uid: string,
    period: 'weekly' | 'monthly' | 'yearly',
  ) => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsStore>((set) => ({
  chartState: {
    chartData: [],
    transactions: [],
    summary: null,
    expenseByCategory: [],
  },
  chartLoading: false,

  fetchAnalytics: async (uid, period) => {
    set({ chartLoading: true });

    let res;
    if (period === 'weekly') res = await fetchWeeklyStats(uid);
    if (period === 'monthly') res = await fetchMonthlyStats(uid);
    if (period === 'yearly') res = await fetchYearlyStats(uid);

    set({ chartLoading: false });

    if (res?.success) {
      const summary = computeSummaryMetrics(res.data.transactions);
      const expenseByCategory = groupByCategory(
        res.data.transactions,
        'expense',
      );

      set({
        chartState: {
          chartData: res.data.stats,
          transactions: res.data.transactions,
          summary,
          expenseByCategory,
        },
      });
    }
  },
}));
