import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Typography from './Typography';
import { useTheme } from '@/contexts/ThemeContext';
import { verticalScale } from '@/utils/styling';

interface DatePickerInputProps {
  date: Date;
  onDateChange: (newDate: Date) => void;
}

const DatePickerInput: React.FC<DatePickerInputProps> = ({
  date,
  onDateChange,
}) => {
  const { colors, spacing, radius, isDark } = useTheme();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      onDateChange(currentDate);
    }
  };

  return (
    <View>
      {!showDatePicker && (
        <Pressable
          style={[
            styles.dateInput,
            {
              borderColor: colors.border,
              borderRadius: radius.md,
              paddingHorizontal: spacing.x._15,
            },
          ]}
          onPress={() => setShowDatePicker(true)}
        >
          <Typography size={14} color={colors.text}>
            {date?.toLocaleDateString()}
          </Typography>
        </Pressable>
      )}

      {showDatePicker && (
        <View style={Platform.OS === 'ios' && styles.iosDatePicker}>
          <DateTimePicker
            themeVariant={isDark ? 'dark' : 'light'}
            value={date}
            textColor={colors.text}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
          />

          {Platform.OS === 'ios' && (
            <TouchableOpacity
              style={[
                styles.datePickerButton,
                {
                  backgroundColor: colors.primary,
                  padding: spacing.y._7,
                  marginRight: spacing.x._7,
                  paddingHorizontal: spacing.y._15,
                  borderRadius: radius.pill,
                },
              ]}
              onPress={() => setShowDatePicker(false)}
            >
              <Typography size={15} fontWeight={'500'}>
                OK
              </Typography>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  dateInput: {
    flexDirection: 'row',
    height: verticalScale(54),
    alignItems: 'center',
    borderWidth: 1,
    borderCurve: 'continuous',
  },
  iosDatePicker: {},
  datePickerButton: {
    alignSelf: 'flex-end',
  },
});

export default DatePickerInput;
