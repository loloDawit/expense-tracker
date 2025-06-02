import * as Icons from 'phosphor-react-native';
import React from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

import ModalWrapper from '@/components/ModalWrapper';
import Typography from '@/components/Typography';
import { theme } from '@/constants/theme';

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
  if (!visible) return null;

  return (
    <ModalWrapper>
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <Typography fontWeight="semibold" style={{ flex: 1 }}>
            Pick an Icon
          </Typography>
          <TouchableOpacity onPress={onClose}>
            <Icons.X size={20} color={theme.colors.neutral300} />
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
                style={styles.iconBox}
              >
                <IconComponent size={26} color={theme.colors.primary} />
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </ModalWrapper>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    padding: theme.spacing.y._10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.y._10,
  },
  grid: {
    alignItems: 'center',
    gap: 16,
  },
  iconBox: {
    width: 60,
    height: 60,
    backgroundColor: theme.colors.neutral800,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    margin: 8,
  },
});
