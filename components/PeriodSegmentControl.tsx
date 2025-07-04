import { useTheme } from '@/contexts/ThemeContext';
import { scale, verticalScale } from '@/utils/styling';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import React from 'react';
import { StyleSheet } from 'react-native';

interface PeriodSegmentControlProps {
  activeIndex: number;
  onChange: (index: number) => void;
}

const PeriodSegmentControl: React.FC<PeriodSegmentControlProps> = ({
  activeIndex,
  onChange,
}) => {
  const { colors } = useTheme();

  return (
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
      onChange={(event) => onChange(event.nativeEvent.selectedSegmentIndex)}
    />
  );
};

export default PeriodSegmentControl;

const styles = StyleSheet.create({
  segmentStyle: {
    height: scale(37),
  },
  segmentFontStyle: {
    fontSize: verticalScale(13),
    fontWeight: 'bold',
  },
});
