import Loading from '@/components/Loading';
import { useTheme } from '@/contexts/ThemeContext';
import { scale, verticalScale } from '@/utils/styling';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

interface ChartSectionProps {
  chartData: any[];
  chartLoading: boolean;
  activeIndex: number;
}

const ChartSection: React.FC<ChartSectionProps> = ({
  chartData,
  chartLoading,
  activeIndex,
}) => {
  const { colors, radius } = useTheme();

  return (
    <View style={styles.chartContainer}>
      {chartData.length > 0 ? (
        <BarChart
          data={chartData}
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
          yAxisTextStyle={{ color: colors.textSecondary }}
          xAxisLabelTextStyle={{
            color: colors.textSecondary,
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
  );
};

export default ChartSection;

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
  noChart: {
    backgroundColor: 'rgba(0,0,0, 0.6)',
    height: verticalScale(210),
  },
});
