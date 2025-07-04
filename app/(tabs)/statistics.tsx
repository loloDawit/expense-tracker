import AnalyticsHeader from '@/components/AnalyticsHeader';
import ChartSection from '@/components/ChartSection';
import PieChartSection from '@/components/PieChartSection';
import PeriodSegmentControl from '@/components/PeriodSegmentControl';
import ScreenWrapper from '@/components/ScreenWrapper';
import SummarySection from '@/components/SummarySection';
import TransactionListSection from '@/components/TransactionListSection';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAnalyticsStore } from '@/store/analyticsStore';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

const Analytics = () => {
  const { spacing } = useTheme();
  const { user } = useAuth();
  const { chartState, chartLoading, fetchAnalytics } = useAnalyticsStore();

  const [activeIndex, setActiveIndex] = useState(0);

  const getPeriod = (index: number) => {
    switch (index) {
      case 0:
        return 'weekly';
      case 1:
        return 'monthly';
      case 2:
        return 'yearly';
      default:
        return 'weekly';
    }
  };

  const handleRefresh = () => {
    if (user?.uid) {
      fetchAnalytics(user.uid, getPeriod(activeIndex));
    }
  };

  useEffect(() => {
    if (!user?.uid) return;
    fetchAnalytics(user.uid, getPeriod(activeIndex));
  }, [activeIndex, fetchAnalytics, user?.uid]);

  return (
    <ScreenWrapper>
      <View
        style={[
          styles.container,
          {
            paddingHorizontal: spacing.x._20,
            paddingVertical: spacing.y._5,
            gap: spacing.y._10,
          },
        ]}
      >
        <AnalyticsHeader onRefresh={handleRefresh} />
        <ScrollView
          contentContainerStyle={{
            gap: spacing.y._20,
            paddingTop: spacing.y._5,
            paddingBottom: spacing.y._35,
          }}
          showsVerticalScrollIndicator={false}
        >
          <SummarySection summary={chartState.summary} />
          <PieChartSection data={chartState.expenseByCategory} />
          <PeriodSegmentControl
            activeIndex={activeIndex}
            onChange={setActiveIndex}
          />
          <ChartSection
            chartData={chartState.chartData}
            chartLoading={chartLoading}
            activeIndex={activeIndex}
          />
          <TransactionListSection transactions={chartState.transactions} />
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

export default Analytics;

const styles = StyleSheet.create({
  container: {},
});