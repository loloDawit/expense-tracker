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
  renderItem?: (item: any) => React.ReactNode;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  data,
  labelField,
  valueField,
  value,
  onSelect,
  placeholder,
  renderItem,
}) => {
  const { colors, spacing, radius } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  

  const _renderItem = (item: any) => {
    if (renderItem) {
      return renderItem(item);
    }
    return (
      <View style={styles.itemContainer}>
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
        return renderItem(selectedItem);
      }
      return (
        <Typography
          size={14}
          color={colors.text}
        >
          {selectedItem[labelField]}
        </Typography>
      );
    }
    return (
      <Typography
        size={14}
        color={colors.neutral500}
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
            borderColor: colors.neutral300,
            borderRadius: radius.sm,
            paddingHorizontal: spacing.x._15,
          },
        ]}
        onPress={() => setModalVisible(true)}
      >
        {_renderSelected()}
        <Icons.CaretDown
          size={verticalScale(20)}
          color={colors.neutral500}
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
                borderColor: colors.neutral500,
                shadowColor: colors.black,
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
                        ? colors.neutral700
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
  },
});

export default CustomDropdown;
