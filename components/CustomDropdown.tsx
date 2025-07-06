import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import Typography from './Typography';
import { verticalScale } from '@/utils/styling';
import * as Icons from 'phosphor-react-native';

interface CustomDropdownProps {
  data: any[];
  labelField: string;
  valueField: string;
  value: any;
  onSelect: (item: any) => void;
  placeholder?: string;
  renderItem?: (item: any, isSelected?: boolean) => React.ReactNode;
  iconField?: string;
  bgColorField?: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  data,
  labelField,
  valueField,
  value,
  onSelect,
  placeholder,
  renderItem,
  iconField,
  bgColorField,
}) => {
  const { colors, spacing, radius, isDark } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const getIconComponent = (iconName: string) => {
    // eslint-disable-next-line import/namespace
    return Icons[iconName as keyof typeof Icons] || Icons.Question; // Fallback to Question icon
  };

  const _renderItem = (item: any, isSelected?: boolean) => {
    if (renderItem) {
      return renderItem(item, isSelected);
    }

    const IconComponent = iconField && item[iconField] ? getIconComponent(item[iconField]) : null;
    const bgColor = bgColorField && item[bgColorField] ? item[bgColorField] : null;

    return (
      <View style={styles.itemContainer}>
        {IconComponent && typeof IconComponent === 'function' && bgColor && (
          <View
            style={{
              backgroundColor: bgColor,
              padding: spacing.x._5,
              borderRadius: 999,
            }}
          >
            <IconComponent
              size={verticalScale(20)}
              color={colors.white}
              weight="bold"
            />
          </View>
        )}
        <Typography size={16} color={colors.text}>
          {item[labelField]}
        </Typography>
      </View>
    );
  };

  const selectedItem = data.find((item) => item[valueField] === value);

  const _renderSelected = () => {
    if (selectedItem) {
      if (renderItem) {
        return renderItem(selectedItem, true);
      }
      const IconComponent = iconField && selectedItem[iconField] ? getIconComponent(selectedItem[iconField]) : null;
      const bgColor = bgColorField && selectedItem[bgColorField] ? selectedItem[bgColorField] : null;

      return (
        <View style={styles.itemContainer}>
          {IconComponent && typeof IconComponent === 'function' && bgColor && (
            <View
              style={{
                backgroundColor: bgColor,
                padding: spacing.x._5,
                borderRadius: 999,
              }}
            >
              <IconComponent
              size={verticalScale(20)}
              color={colors.white}
              weight="bold"
            />
            </View>
          )}
          <Typography
            size={14}
            color={colors.text}
          >
            {selectedItem[labelField]}
          </Typography>
        </View>
      );
    }
    return (
      <Typography
          size={14}
          color={colors.textSecondary}
        >
        {placeholder || 'Select an item'}
      </Typography>
    );
  };

  return (
    <View>
      <Pressable
        style={[
          styles.dropdownButton,
          {
            borderColor: colors.border,
            borderRadius: radius.sm,
            paddingHorizontal: spacing.x._15,
          },
        ]}
        onPress={() => setModalVisible(true)}
      >
        {_renderSelected()}
        <Icons.CaretDown
          size={verticalScale(20)}
          color={colors.textSecondary}
        />
      </Pressable>

      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.background,
                borderRadius: radius.md,
                borderColor: colors.border,
                shadowColor: isDark ? colors.white : colors.black,
              },
            ]}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              {data.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    onSelect(item);
                    setModalVisible(false);
                  }}
                  style={[
                    styles.modalItem,
                    {
                      backgroundColor: item[valueField] === value
                        ? (isDark ? colors.neutral800 : colors.neutral100)
                        : 'transparent',
                    },
                  ]}
                >
                  {_renderItem(item)}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownButton: {
    flexDirection: 'row',
    height: verticalScale(54),
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderCurve: 'continuous',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    maxHeight: '60%',
    borderWidth: 1,
    elevation: 5,
    paddingVertical: 10,
  },
  modalItem: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});

export default CustomDropdown;
