import ExpensePieChart from '@/components/ExpensePieChart';
import Header from '@/components/Header';
import Loading from '@/components/Loading';
import ScreenWrapper from '@/components/ScreenWrapper';
import StatsSummary from '@/components/StatsSummary';
import TransactionList from '@/components/TransactionList';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAnalyticsStore } from '@/store/analyticsStore';
import { scale, verticalScale } from '@/utils/styling';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import * as Icons from 'phosphor-react-native';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

const Analytics = () => {
  const { colors, spacing, radius } = useTheme();
  const { user } = useAuth();
  const { chartState, chartLoading, fetchAnalytics } = useAnalyticsStore();

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!user?.uid) return;
    const period =
      activeIndex === 0 ? 'weekly' : activeIndex === 1 ? 'monthly' : 'yearly';
    fetchAnalytics(user.uid, period);
  }, [activeIndex]);

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
        <Header
          title="Statistics"
          rightIcon={
            <TouchableOpacity
              onPress={() => {
                const period =
                  activeIndex === 0
                    ? 'weekly'
                    : activeIndex === 1
                      ? 'monthly'
                      : 'yearly';
                fetchAnalytics(user?.uid, period);
              }}
            >
              <Icons.ArrowsClockwise size={22} color={colors.text} />
            </TouchableOpacity>
          }
        />
        <ScrollView
          contentContainerStyle={{
            gap: spacing.y._20,
            paddingTop: spacing.y._5,
            paddingBottom: verticalScale(100),
          }}
          showsVerticalScrollIndicator={false}
        >
          {chartState.summary && <StatsSummary metrics={chartState.summary} />}
          {chartState.expenseByCategory.length > 0 && (
            <ExpensePieChart data={chartState.expenseByCategory} />
          )}

          <SegmentedControl
            values={['Weekly', 'Monthly', 'Yearly']}
            selectedIndex={activeIndex}
            tintColor={colors.neutral200}
            backgroundColor={colors.card}
            appearance="dark"
            activeFontStyle={{
              ...styles.segmentFontStyle,
              color: colors.black,
            }}
            fontStyle={{ ...styles.segmentFontStyle, color: colors.white }}
            style={styles.segmentStyle}
            onChange={(event) =>
              setActiveIndex(event.nativeEvent.selectedSegmentIndex)
            }
          />

          <View style={styles.chartContainer}>
            {chartState.chartData.length > 0 ? (
              <BarChart
                data={chartState.chartData}
                barWidth={scale(12)}
                spacing={[1, 2].includes(activeIndex) ? scale(25) : scale(16)}
                roundedTop
                roundedBottom
                hideRules
                yAxisLabelPrefix="$"
                xAxisThickness={0}
                yAxisThickness={0}
                yAxisLabelWidth={
                  [1, 2].includes(activeIndex) ? scale(38) : scale(35)
                }
                yAxisTextStyle={{ color: colors.neutral350 }}
                xAxisLabelTextStyle={{
                  color: colors.neutral350,
                  fontSize: verticalScale(12),
                }}
                noOfSections={3}
                minHeight={5}
              />
            ) : (
              <View style={styles.noChart} />
            )}

            {chartLoading && (
              <View
                style={[
                  styles.chartLoadingContainer,
                  { borderRadius: radius.sm },
                ]}
              >
                <Loading color="white" />
              </View>
            )}
          </View>

          <TransactionList
            title="Transactions"
            emptyListMessage="No transactions found"
            data={chartState.transactions}
          />
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

export default Analytics;

const styles = StyleSheet.create({
  chartContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartLoadingContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0, 0.6)',
  },
  header: {},
  noChart: {
    backgroundColor: 'rgba(0,0,0, 0.6)',
    height: verticalScale(210),
  },
  searchIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    height: verticalScale(35),
    width: verticalScale(35),
    borderCurve: 'continuous',
  },
  segmentStyle: {
    height: scale(37),
  },
  segmentFontStyle: {
    fontSize: verticalScale(13),
    fontWeight: 'bold',
  },
  container: {},
});
