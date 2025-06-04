import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import BackButton from '@/components/BackButton';
import Button from '@/components/Button';
import Header from '@/components/Header';
import Input from '@/components/Input';
import ModalWrapper from '@/components/ModalWrapper';
import Typography from '@/components/Typography';
import { theme } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import * as Icons from 'phosphor-react-native';

import {
  createOrUpdateCategory,
  deleteCategory,
  fetchUserCategories,
} from '@/services/transactionService';

import { CategoryType } from '@/types';
import IconPickerModal from './iconPickerModal'; // 👈 make sure path matches

const colorOptions = [
  '#4B5563',
  '#075985',
  '#ca8a04',
  '#b45309',
  '#0f766e',
  '#be185d',
  '#e11d48',
  '#404040',
  '#065F46',
  '#7c3aed',
  '#a21caf',
  '#525252',
];

const CategoryModal = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [newLabel, setNewLabel] = useState('');
  const [newIcon, setNewIcon] = useState<keyof typeof Icons>('Tag');
  const [newColor, setNewColor] = useState<string>('#4B5563');
  const [showIconPicker, setShowIconPicker] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    const fetch = async () => {
      const res = await fetchUserCategories(user.uid!);
      if (res.success && res.data) {
        // Ensure each item matches CategoryType shape
        setCategories(
          res.data.map((item: any) => ({
            id: item.id,
            label: item.label,
            value: item.value,
            icon: item.icon,
            bgColor: item.bgColor,
            type: item.type,
          })),
        );
      }
    };
    fetch();
  }, [user?.uid]);

  const handleAddCategory = async () => {
    if (!user?.uid || !newLabel.trim()) return;

    // Store icon as icon (string), matching CategoryType, and include type
    const newCategory: CategoryType = {
      id: '', // Temporary, will be replaced after creation
      label: newLabel,
      value: newLabel.toLowerCase().replace(/\s+/g, '_'),
      icon: newIcon,
      bgColor: newColor,
      type: 'expense',
    };

    const res = await createOrUpdateCategory(user.uid, newCategory);
    if (res.success && res.data) {
      setCategories((prev) => [...prev, { ...newCategory, id: res.data.id }]);
      setNewLabel('');
      setNewIcon('Tag');
      setNewColor('#4B5563');
    } else {
      Alert.alert('Error', res.msg || 'Failed to create category');
    }
  };

  const handleDelete = async (id: string) => {
    if (!user?.uid) return;

    const res = await deleteCategory(user.uid, id);
    if (res.success) {
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
    } else {
      Alert.alert('Error', res.msg || 'Failed to delete category');
    }
  };

  return (
    <ModalWrapper>
      <View style={styles.container}>
        <Header
          title="Expense Categories"
          leftIcon={<BackButton />}
          style={{ marginBottom: theme.spacing.y._10 }}
        />

        <ScrollView contentContainerStyle={styles.form}>
          {categories.map((item) => {
            const IconComponent =
              typeof Icons[item.icon] === 'function'
                ? Icons[item.icon]
                : Icons.Tag;
            return (
              <View
                key={item.id || `${item.label}-${item.icon}`}
                style={styles.row}
              >
                <View
                  style={[
                    styles.iconWrapper,
                    { backgroundColor: item.bgColor },
                  ]}
                >
                  <IconComponent size={20} color={theme.colors.white} />
                </View>
                <Typography style={styles.label}>{item.label}</Typography>
                <View style={styles.actions}>
                  <TouchableOpacity>
                    <Icons.PencilSimple
                      size={18}
                      color={theme.colors.primary}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item.id!)}>
                    <Icons.TrashSimple size={18} color={theme.colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          <View style={styles.addSection}>
            <Typography color={theme.colors.neutral200}>
              Add New Category
            </Typography>

            <Input
              placeholder="Category Label"
              value={newLabel}
              onChangeText={setNewLabel}
            />

            <TouchableOpacity
              onPress={() => setShowIconPicker(true)}
              style={styles.selectRow}
            >
              <Typography color={theme.colors.neutral300}>Icon</Typography>
              {(() => {
                const IconComponent =
                  typeof Icons[newIcon] === 'function'
                    ? Icons[newIcon]
                    : Icons.Tag;
                return <IconComponent size={20} color={theme.colors.primary} />;
              })()}
            </TouchableOpacity>

            <View style={styles.colorPicker}>
              {colorOptions.map((color) => (
                <TouchableOpacity
                  key={color}
                  onPress={() => setNewColor(color)}
                  style={[
                    styles.colorDot,
                    {
                      backgroundColor: color,
                      borderWidth: newColor === color ? 2 : 0,
                      borderColor: theme.colors.white,
                    },
                  ]}
                />
              ))}
            </View>

            <Button
              onPress={handleAddCategory}
              style={{ marginTop: theme.spacing.y._10 }}
            >
              <Typography color={theme.colors.black}>Add Category</Typography>
            </Button>
          </View>
        </ScrollView>
      </View>

      <IconPickerModal
        visible={showIconPicker}
        onClose={() => setShowIconPicker(false)}
        onSelect={(icon) => setNewIcon(icon)}
      />
    </ModalWrapper>
  );
};

export default CategoryModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.y._20,
  },
  form: {
    gap: theme.spacing.y._10,
    paddingBottom: theme.spacing.y._20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral700,
    paddingVertical: theme.spacing.y._10,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.x._10,
  },
  label: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.white,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  addSection: {
    marginTop: theme.spacing.y._20,
    gap: theme.spacing.y._10,
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  colorDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  selectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
});
