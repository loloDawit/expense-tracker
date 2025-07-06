import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import Typography from './Typography';
import { verticalScale } from '@/utils/styling';

interface SegmentedControlProps {
  data: { label: string; value: string }[];
  value: string;
  onSelect: (value: string) => void;
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({
  data,
  value,
  onSelect,
}) => {
  const { colors, radius, spacing } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderRadius: radius.md,
          padding: spacing.x._5,
        },
      ]}
    >
      {data.map((item) => (
        <TouchableOpacity
          key={item.value}
          style={[
            styles.button,
            {
              borderRadius: radius.sm,
              backgroundColor:
                value === item.value ? colors.background : 'transparent',
            },
          ]}
          onPress={() => onSelect(item.value)}
        >
          <Typography
            size={14}
            fontWeight={'500'}
            color={value === item.value ? colors.text : colors.textSecondary}
          >
            {item.label}
          </Typography>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  button: {
    flex: 1,
    paddingVertical: verticalScale(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SegmentedControl;
