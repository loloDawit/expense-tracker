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
  const { colors, isDark } = useTheme();

  return (
    <SegmentedControl
      values={['Weekly', 'Monthly', 'Yearly']}
      selectedIndex={activeIndex}
      tintColor={colors.primary}
      backgroundColor={colors.card}
      appearance={isDark ? 'dark' : 'light'}
      activeFontStyle={{
        ...styles.segmentFontStyle,
        color: colors.text,
      }}
      fontStyle={{ ...styles.segmentFontStyle, color: colors.textSecondary }}
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
