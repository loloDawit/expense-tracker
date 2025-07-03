import { Icons } from '@/constants/icons';
import React from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

import ModalWrapper from '@/components/ModalWrapper';
import Typography from '@/components/Typography';
import { useTheme } from '@/contexts/ThemeContext';

const iconList = Object.entries(Icons)
  .filter(
    ([key, value]) => typeof value === 'function' && !key.endsWith('Context'),
  )
  .map(([name]) => name) as (keyof typeof Icons)[];

type IconPickerModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (icon: keyof typeof Icons) => void;
};

export default function IconPickerModal({
  visible,
  onClose,
  onSelect,
}: IconPickerModalProps) {
  const { colors, spacing } = useTheme();
  if (!visible) return null;

  return (
    <ModalWrapper>
      <View style={[styles.wrapper, { padding: spacing.y._10 }]}>
        <View style={[styles.header, { marginBottom: spacing.y._10 }]}>
          <Typography fontWeight="semibold" style={{ flex: 1 }}>
            Pick an Icon
          </Typography>
          <TouchableOpacity onPress={onClose}>
            <Icons.X size={20} color={colors.neutral300} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={iconList}
          numColumns={5}
          contentContainerStyle={styles.grid}
          keyExtractor={(item) => item}
          renderItem={({ item }) => {
            const IconComponent = Icons[item] as React.ElementType;
            return (
              <TouchableOpacity
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
                style={[styles.iconBox, { backgroundColor: colors.neutral800 }]}
              >
                <IconComponent size={26} color={colors.primary} />
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </ModalWrapper>
  );
}

const styles = StyleSheet.create({
  wrapper: {},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  grid: {
    alignItems: 'center',
    gap: 16,
  },
  iconBox: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    margin: 8,
  },
});
