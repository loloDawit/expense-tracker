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
import { useAuth } from '@/contexts/AuthContext';
import { Icons } from '@/constants/icons';

import {
  createOrUpdateCategory,
  deleteCategory,
  fetchUserCategories,
} from '@/services/transactionService';

import { useTheme } from '@/contexts/ThemeContext';
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
  const { colors, spacing } = useTheme();
  const { user } = useAuth();
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [newLabel, setNewLabel] = useState('');
  const [newIcon, setNewIcon] = useState<keyof typeof Icons>('Tag');
  const [newColor, setNewColor] = useState<string>('#4B5563');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryType | null>(null);

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

    const categoryToSave: CategoryType = {
      id: editingCategory?.id || '',
      label: newLabel,
      value: newLabel.toLowerCase().replace(/\s+/g, '_'),
      icon: newIcon,
      bgColor: newColor,
      type: 'expense',
    };

    const res = await createOrUpdateCategory(user.uid, categoryToSave);
    if (res.success && res.data) {
      if (editingCategory) {
        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === res.data?.id ? { ...categoryToSave, id: res.data.id } : cat,
          ),
        );
        setEditingCategory(null);
      } else {
        setCategories((prev) => [...prev, { ...categoryToSave, id: res.data.id }]);
      }
      setNewLabel('');
      setNewIcon('Tag');
      setNewColor('#4B5563');
    } else {
      Alert.alert('Error', res.msg || 'Failed to save category');
    }
  };

  const handleEdit = (category: CategoryType) => {
    setEditingCategory(category);
    setNewLabel(category.label);
    setNewIcon(category.icon as keyof typeof Icons);
    setNewColor(category.bgColor);
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setNewLabel('');
    setNewIcon('Tag');
    setNewColor('#4B5563');
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
      <View style={[styles.container, { paddingHorizontal: spacing.y._20 }]}>
        <Header
          title="Expense Categories"
          leftIcon={<BackButton />}
          style={{ marginBottom: spacing.y._10 }}
        />

        <ScrollView
          contentContainerStyle={{
            gap: spacing.y._10, paddingBottom: spacing.y._20
          }}
        >
          {categories.map((item) => {
            const iconKey = item.icon as keyof typeof Icons;
            const IconComponent = (typeof Icons[iconKey] === 'function'
              ? Icons[iconKey]
              : Icons.Tag) as React.ComponentType<{ size: number; color: string }>;
            return (
              <View
                key={item.id || `${item.label}-${item.icon}`}
                style={[styles.row, { borderBottomColor: colors.border, marginBottom: spacing.y._10 }]}
              >
                <View
                  style={[
                    styles.iconWrapper,
                    {
                      backgroundColor: item.bgColor,
                      marginRight: spacing.x._10,
                    },
                  ]}
                >
                  <IconComponent size={20} color={colors.text} />
                </View>
                <Typography style={[styles.label, { color: colors.text }]}>
                  {item.label}
                </Typography>
                <View style={styles.actions}>
                  <TouchableOpacity onPress={() => handleEdit(item)}>
                    <Icons.PencilSimple size={18} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item.id!)}>
                    <Icons.TrashSimple size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          <View
            style={[
              styles.addSection,
              { marginTop: spacing.y._20, gap: spacing.y._10 },
            ]}
          >
            <Typography color={colors.textSecondary}>
              {editingCategory ? 'Edit Category' : 'Add New Category'}
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
              <Typography color={colors.textSecondary}>Icon</Typography>
              {(() => {
                const IconComponent =
                  typeof Icons[newIcon] === 'function'
                    ? Icons[newIcon]
                    : Icons.Tag;
                return <IconComponent size={20} color={colors.primary} />;
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
                      borderColor: colors.text,
                    },
                  ]}
                />
              ))}
            </View>

            <View style={styles.buttonContainer}>
              {editingCategory && (
                <Button
                  onPress={handleCancelEdit}
                  style={{ ...styles.button, backgroundColor: colors.neutral400 }}
                >
                  <Typography color={colors.white}>Cancel</Typography>
                </Button>
              )}
              <Button onPress={handleAddCategory} style={styles.button}>
                <Typography color={colors.white}>
                  {editingCategory ? 'Save Category' : 'Add Category'}
                </Typography>
              </Button>
            </View>
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
  },
  form: {},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingVertical: 12,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  addSection: {},
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
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  button: {
    flex: 1,
  },
});
