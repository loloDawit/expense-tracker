import ScreenWrapper from '@/components/ScreenWrapper';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, View } from 'react-native';

import Header from '@/components/Header';
import Loading from '@/components/Loading';
import TransactionList from '@/components/TransactionList';
import { theme } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import {
  fetchMonthlyStats,
  fetchWeeklyStats,
  fetchYearlyStats,
} from '@/services/transactionService';
import { scale, verticalScale } from '@/utils/styling';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { BarChart } from 'react-native-gifted-charts';

const { width: screenWidth } = Dimensions.get('window');

const barData = [
  {
    value: 40,
    label: 'Mon',
    spacing: scale(4),
    labelWidth: scale(30),
    frontColor: theme.colors.primary,
    // topLabelComponent: () => (
    //   <Typo size={10} style={{ marginBottom: 4 }} fontWeight={"bold"}>
    //     50
    //   </Typo>
    // ),
  },
  {
    value: 20,
    frontColor: theme.colors.rose,
  },

  {
    value: 50,
    label: 'Tue',
    spacing: scale(4),
    labelWidth: scale(30),
    frontColor: theme.colors.primary,
  },
  { value: 40, frontColor: theme.colors.rose },
  {
    value: 75,
    label: 'Wed',
    spacing: scale(4),
    labelWidth: scale(30),
    frontColor: theme.colors.primary,
  },
  { value: 25, frontColor: theme.colors.rose },
  {
    value: 30,
    label: 'Thu',
    spacing: scale(4),
    labelWidth: scale(30),
    frontColor: theme.colors.primary,
  },
  { value: 20, frontColor: theme.colors.rose },
  {
    value: 60,
    label: 'Fri',
    spacing: scale(4),
    labelWidth: scale(30),
    frontColor: theme.colors.primary,
  },
  { value: 40, frontColor: theme.colors.rose },
  {
    value: 65,
    label: 'Sat',
    spacing: scale(4),
    labelWidth: scale(30),
    frontColor: theme.colors.primary,
  },
  { value: 30, frontColor: theme.colors.rose },
  {
    value: 65,
    label: 'Sun',
    spacing: scale(4),
    labelWidth: scale(30),
    frontColor: theme.colors.primary,
  },
  { value: 30, frontColor: theme.colors.rose },
  // {
  //   value: 65,
  //   label: "Sun",
  //   spacing: scale(4),
  //   labelWidth: scale(30),
  //   frontColor: theme.colors.primary,
  // },
  // { value: 30, frontColor: theme.colors.rose },
];

const Analytics = () => {
  const [chartLoading, setChartLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (activeIndex == 0) {
      getWeeklyStats();
    }
    if (activeIndex == 1) {
      getMonthlyStats();
    }
    if (activeIndex == 2) {
      getYearlyStats();
    }
  }, [activeIndex]);

  const getWeeklyStats = async () => {
    setChartLoading(true);
    let res = await fetchWeeklyStats(user?.uid as string);
    setChartLoading(false);
    if (res.success) {
      setChartData(res.data.stats);
      setTransactions(res.data.transactions);
    } else {
      Alert.alert('Error', res.msg);
    }
  };

  const getMonthlyStats = async () => {
    setChartLoading(true);
    let res = await fetchMonthlyStats(user?.uid as string);
    setChartLoading(false);
    if (res.success) {
      setChartData(res.data.stats);
      setTransactions(res.data.transactions);
    } else {
      Alert.alert('Error', res.msg);
    }
  };

  const getYearlyStats = async () => {
    setChartLoading(true);
    let res = await fetchYearlyStats(user?.uid as string);
    setChartLoading(false);
    if (res.success) {
      setChartData(res.data.stats);
      setTransactions(res.data.transactions);
    } else {
      Alert.alert('Error', res.msg);
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* segments */}
        <View style={styles.header}>
          <Header
            title="Statistics"
            // rightIcon={
            //   <TouchableOpacity style={styles.searchIcon}>
            //     <Icons.MagnifyingGlass
            //       size={verticalScale(22)}
            //       color={theme.colors.white}
            //     />
            //   </TouchableOpacity>
            // }
          />
        </View>
        <ScrollView
          contentContainerStyle={{
            gap: theme.spacing.y._20,
            paddingTop: theme.spacing.y._5,
            paddingBottom: verticalScale(100),
          }}
          showsVerticalScrollIndicator={false}
        >
          <SegmentedControl
            values={['Weekly', 'Monthly', 'Yearly']}
            selectedIndex={activeIndex}
            tintColor={theme.colors.neutral200}
            backgroundColor={theme.colors.neutral800}
            appearance="dark"
            activeFontStyle={styles.segmentFontStyle}
            fontStyle={{
              ...styles.segmentFontStyle,
              color: theme.colors.white,
            }}
            style={styles.segmentStyle}
            onChange={(event) =>
              setActiveIndex(event.nativeEvent.selectedSegmentIndex)
            }
          />

          <View style={styles.chartContainer}>
            {chartData.length > 0 ? (
              <BarChart
                data={chartData}
                barWidth={scale(12)}
                spacing={[1, 2].includes(activeIndex) ? scale(25) : scale(16)}
                // width={screenWidth - theme.spacing.x._30}
                roundedTop
                roundedBottom
                hideRules
                yAxisLabelPrefix="$"
                xAxisThickness={0}
                yAxisThickness={0}
                yAxisLabelWidth={
                  [1, 2].includes(activeIndex) ? scale(38) : scale(35)
                }
                // hideYAxisText
                yAxisTextStyle={{ color: theme.colors.neutral350 }}
                xAxisLabelTextStyle={{
                  color: theme.colors.neutral350,
                  fontSize: verticalScale(12),
                }}
                noOfSections={3}
                minHeight={5}
                // maxValue={100}
                // animationDuration={500}
                // isAnimated={true}
              />
            ) : (
              <View style={styles.noChart} />
            )}

            {chartLoading && (
              <View style={styles.chartLoadingContainer}>
                <Loading color="white" />
              </View>
            )}
          </View>

          {/* transactions */}
          <View>
            <TransactionList
              title="Transactions"
              emptyListMessage="No transactions found"
              data={transactions}
            />
          </View>
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
    borderRadius: theme.radius.sm,
    backgroundColor: 'rgba(0,0,0, 0.6)',
  },
  header: {},
  noChart: {
    backgroundColor: 'rgba(0,0,0, 0.6)',
    height: verticalScale(210),
  },
  searchIcon: {
    backgroundColor: theme.colors.neutral700,
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
    color: theme.colors.black,
  },
  container: {
    paddingHorizontal: theme.spacing.x._20,
    paddingVertical: theme.spacing.y._5,
    gap: theme.spacing.y._10,
  },
});
