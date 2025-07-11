import BackButton from '@/components/BackButton';
import Button from '@/components/Button';
import CustomDropdown from '@/components/CustomDropdown';
import DatePickerInput from '@/components/DatePickerInput';
import Header from '@/components/Header';
import Input from '@/components/Input';
import ModalWrapper from '@/components/ModalWrapper';
import SegmentedControl from '@/components/SegmentedControl';
import { scale, verticalScale } from '@/utils/styling';
import * as Icons from 'phosphor-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, View } from 'react-native';

import ImageUpload from '@/components/ImageUpload';
import Typography from '@/components/Typography';
import { expenseCategories, transactionTypes } from '@/constants/data';
import { spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import useFetchData from '@/hooks/useFetchData';
import {
  createOrUpdateTransaction,
  deleteTransaction,
  fetchUserCategories,
} from '@/services/transactionService';
import { CategoryType, TransactionType, WalletType } from '@/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, doc, getDoc, orderBy, where } from 'firebase/firestore';
import { firestore } from '@/config/firebase';
import { formatAmount } from '@/utils/helper';

const TransactionModal = () => {
  const { colors, spacing, radius } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  type paramType = {
    id: string;
    type: string;
    amount: string; // Note: Keeping it as string since query parameters are strings
    category?: string;
    date: string; // Store as string for parsing later
    description?: string;
    image?: any;
    uid?: string;
    walletId: string;
  };
  const oldTransaction: paramType = useLocalSearchParams();
  const [allCategories, setAllCategories] = useState<CategoryType[]>([]);
  const [originalWallet, setOriginalWallet] = useState<WalletType | null>(null);

  useEffect(() => {
    if (!user?.uid) return;

    const fetch = async () => {
      const res = await fetchUserCategories(user.uid!);
      const userCategories = res.success && res.data ? res.data : [];

      const defaultCategories = Object.values(expenseCategories).filter(
        (cat): cat is CategoryType =>
          typeof cat === 'object' &&
          'label' in cat &&
          'value' in cat &&
          'icon' in cat &&
          'bgColor' in cat,
      );

      // Merge & remove duplicates based on `value`
      const merged = [
        ...defaultCategories,
        ...userCategories
          .filter(
            (uc): uc is CategoryType =>
              typeof uc === 'object' &&
              'value' in uc &&
              'label' in uc &&
              'icon' in uc &&
              'bgColor' in uc,
          )
          .filter(
            (uc) => !defaultCategories.find((dc) => dc.value === uc.value),
          ),
      ];

      // Ensure all items are CategoryType by filtering out any that don't have required properties
      setAllCategories(
        merged.filter(
          (cat): cat is CategoryType =>
            typeof cat === 'object' &&
            'label' in cat &&
            'value' in cat &&
            'icon' in cat &&
            'bgColor' in cat,
        ),
      );
    };

    fetch();
  }, [user?.uid]);

  useEffect(() => {
    const fetchOriginalWallet = async () => {
      if (oldTransaction?.walletId) {
        const walletRef = doc(firestore, 'wallets', oldTransaction.walletId);
        const walletSnap = await getDoc(walletRef);
        if (walletSnap.exists()) {
          setOriginalWallet(walletSnap.data() as WalletType);
        }
      }
    };
    fetchOriginalWallet();
  }, [oldTransaction?.walletId]);
  const walletConstraints = useMemo(() => {
    if (!user?.uid) return [];
    return [where('uid', '==', user.uid), orderBy('created', 'desc')];
  }, [user?.uid]);
  const { data: wallets } = useFetchData<WalletType>(
    'wallets',
    walletConstraints,
  );

  const [loading, setLoading] = useState(false);

  const [transaction, setTransaction] = useState<TransactionType>({
    type: 'expense',
    amount: 0,
    description: '',
    category: '',
    date: new Date(),
    walletId: '',
    image: null,
  });

  const [displayAmount, setDisplayAmount] = useState('');

  useEffect(() => {
    if (oldTransaction?.id) {
      setTransaction({
        type:
          oldTransaction.type === 'income' || oldTransaction.type === 'expense'
            ? oldTransaction.type
            : 'expense',
        amount: Number(oldTransaction.amount),
        description: oldTransaction.description || '',
        category: oldTransaction.category || '',
        date: new Date(oldTransaction.date), // Convert string to Date object
        walletId: oldTransaction.walletId,
        image: oldTransaction?.image || null,
      });
      // Initialize displayAmount with formatted value for existing transaction
      setDisplayAmount(formatAmount(Number(oldTransaction.amount) || 0));
    } else {
      // Initialize displayAmount for new transaction
      setDisplayAmount(formatAmount(0));
    }
  }, [
    oldTransaction.amount,
    oldTransaction.category,
    oldTransaction.date,
    oldTransaction.description,
    oldTransaction?.id,
    oldTransaction?.image,
    oldTransaction.type,
    oldTransaction.walletId,
  ]);

  // Update displayAmount when transaction.amount changes internally
  useEffect(() => {
    if (!oldTransaction?.id) {
      setDisplayAmount(formatAmount(transaction.amount || 0));
    }
  }, [transaction.amount, oldTransaction?.id]);

  const onSelectImage = (file: any) => {
    if (file) setTransaction({ ...transaction, image: file });
  };

  const onSubmit = async () => {
    const { type, amount, description, category, date, walletId, image } =
      transaction;

    if (wallets.length === 0) {
      Alert.alert('Transaction', 'Please create a wallet first.');
      return;
    }

    if (!walletId || !date || !amount || (type === 'expense' && !category)) {
      Alert.alert('Transaction', 'Please fill all the fields');
      return;
    }

    // if (type == "expense") {
    //   let selectedWallet = wallets.find((wallet) => wallet.id == walletId);
    //   if (selectedWallet) {
    //     let remainingBalance = selectedWallet.amount! - amount;
    //     if (remainingBalance < 0) {
    //       Alert.alert(
    //         "Not Enough Balance",
    //         "The selected wallet don't have enough balance"
    //       );
    //       return;
    //     }
    //   }
    // }

    let transactionData: TransactionType = {
      type,
      amount,
      description,
      category,
      date,
      walletId,
      image,
      uid: user?.uid,
    };

    if (oldTransaction?.id) transactionData.id = oldTransaction.id;

    setLoading(true);

    const res = await createOrUpdateTransaction(transactionData);
    setLoading(false);
    if (res.success) {
      router.back();
    } else {
      Alert.alert('Transaction', res.msg);
    }
  };

  const showDeleteAlert = () => {
    Alert.alert(
      'Confirm',
      'Are you sure you want to delete this transaction?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel delete'),
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => onDeleteTransaction(),
          style: 'destructive',
        },
      ],
    );
  };

  const onDeleteTransaction = async () => {
    if (oldTransaction) {
      setLoading(true);
      let res = await deleteTransaction(
        oldTransaction?.id,
        oldTransaction?.walletId,
      );
      setLoading(false);
      if (res.success) {
        router.back();
      } else {
        Alert.alert('Transaction', res.msg);
      }
    }
  };

  return (
    <ModalWrapper>
      <View style={[styles.container, { paddingHorizontal: spacing.y._20 }]}>
        <Header
          title={oldTransaction?.id ? 'Update Transaction' : 'Add Transaction'}
          leftIcon={<BackButton />}
          style={{ marginBottom: spacing.y._10 }}
        />

        {/* form */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.form,
            {
              paddingVertical: spacing.y._15,
              paddingBottom: spacing.y._40,
            },
          ]}
        >
          {/* type */}
          <View style={[styles.inputContainer, { gap: spacing.y._10 }]}>
            <Typography
              color={colors.textSecondary}
              size={14}
              fontWeight={'500'}
            >
              Type
            </Typography>
            <SegmentedControl
              data={transactionTypes}
              value={transaction.type}
              onSelect={(value) =>
                setTransaction({
                  ...transaction,
                  type: value as 'income' | 'expense',
                })
              }
            />
          </View>

          {/* wallet */}
          <View style={[styles.inputContainer, { gap: spacing.y._10 }]}>
            <Typography
              color={colors.textSecondary}
              size={16}
              fontWeight={'500'}
            >
              Wallet
            </Typography>
            {wallets.length === 0 && !originalWallet ? (
              <Typography color={colors.textSecondary} size={14}>
                No wallets found. Please add a wallet first.
              </Typography>
            ) : (
              <CustomDropdown
                data={[
                  ...(originalWallet && originalWallet.isDeleted
                    ? [
                        {
                          label: 'Deleted Wallet',
                          value: originalWallet.id,
                          image: null,
                          isDeleted: true,
                        },
                      ]
                    : []),
                  ...wallets.map((wallet) => ({
                    label: `${wallet?.name} (${formatAmount(wallet.amount || 0)})`,
                    value: wallet?.id,
                    image: wallet?.image,
                  })),
                ]}
                labelField="label"
                valueField="value"
                value={transaction.walletId}
                onSelect={(item) =>
                  setTransaction({ ...transaction, walletId: item.value || '' })
                }
                placeholder="Select wallet"
                renderItem={(item) => (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.x._10 }}>
                    {item.isDeleted ? (
                      <Icons.Trash
                        size={verticalScale(30)}
                        weight="fill"
                        color={colors.neutral400}
                      />
                    ) : (
                      item.image && (
                        <Image
                          source={item.image}
                          style={{ width: verticalScale(30), height: verticalScale(30), borderRadius: radius.sm }}
                        />
                      )
                    )}
                    <Typography size={16} color={item.isDeleted ? colors.neutral400 : colors.text}>
                      {item.label}
                    </Typography>
                  </View>
                )}
              />
            )}
          </View>

          {/* category: show only if type is expense */}

          {transaction.type === 'expense' && (
            <View style={[styles.inputContainer, { gap: spacing.y._10 }]}>
              <Typography
                color={colors.textSecondary}
                size={16}
                fontWeight={'500'}
              >
                Expense Category
              </Typography>
              <CustomDropdown
                data={Object.values(allCategories)}
                labelField="label"
                valueField="value"
                value={transaction.category}
                onSelect={(item) =>
                  setTransaction({ ...transaction, category: item.value || '' })
                }
                placeholder="Select category"
                iconField="icon"
                bgColorField="bgColor"
              />
            </View>
          )}

          {/* date picker */}
          <View style={[styles.inputContainer, { gap: spacing.y._10 }]}>
            <Typography
              color={colors.textSecondary}
              size={16}
              fontWeight={'500'}
            >
              Date
            </Typography>
            <DatePickerInput
              date={transaction.date as Date}
              onDateChange={(newDate) =>
                setTransaction({ ...transaction, date: newDate })
              }
            />
          </View>

          {/* amount */}
          <View style={[styles.inputContainer, { gap: spacing.y._10 }]}>
            <Typography color={colors.textSecondary} size={16}>
              Amount
            </Typography>
            <Input
              keyboardType="numeric"
              value={displayAmount}
              onChangeText={(value) => {
                setDisplayAmount(value);
                const numericValue = parseFloat(value.replace(/[^0-9.]/g, ''));
                setTransaction({
                  ...transaction,
                  amount: isNaN(numericValue) ? 0 : numericValue,
                });
              }}
              onFocus={() => {
                setDisplayAmount(transaction.amount?.toString() || '');
              }}
              onBlur={() => {
                setDisplayAmount(formatAmount(transaction.amount || 0));
              }}
            />
          </View>
          {/* description */}
          <View style={[styles.inputContainer, { gap: spacing.y._10 }]}>
            <View style={[styles.flexRow, { gap: spacing.x._5 }]}>
              <Typography color={colors.textSecondary} size={16}>
                Description
              </Typography>
              <Typography color={colors.textSecondary} size={14}>
                (optional)
              </Typography>
            </View>

            <Input
              placeholder="Salary"
              value={transaction.description}
              multiline
              numberOfLines={4}
              containerStyle={{
                height: verticalScale(100),
              }}
              onChangeText={(value) =>
                setTransaction({
                  ...transaction,
                  description: value,
                })
              }
            />
          </View>
          <View style={[styles.inputContainer, { gap: spacing.y._10 }]}>
            <View style={[styles.flexRow, { gap: spacing.x._5 }]}>
              <Typography color={colors.textSecondary} size={16}>
                Receipt
              </Typography>
              <Typography color={colors.textSecondary} size={14}>
                (optional)
              </Typography>
            </View>
            <ImageUpload
              file={transaction.image}
              onSelect={onSelectImage}
              onClear={() => setTransaction({ ...transaction, image: null })}
              placeholder="Upload Image"
            />
          </View>
        </ScrollView>
      </View>

      {/* footer */}
      <View
        style={[
          styles.footer,
          {
            paddingHorizontal: spacing.x._20,
            paddingTop: spacing.y._15,
            borderTopColor: colors.border,
            marginBottom: spacing.y._5,
          },
        ]}
      >
        {oldTransaction?.id && !loading && (
          <Button
            style={{
              backgroundColor: 'transparent',
              borderColor: colors.rose,
              borderWidth: 1,
              paddingHorizontal: spacing.x._15,
            }}
            onPress={showDeleteAlert}
          >
            <Icons.Trash
              color={colors.rose}
              size={verticalScale(24)}
              weight="bold"
            />
          </Button>
        )}

        <Button loading={loading} onPress={onSubmit} style={{ flex: 1 }}>
          <Typography color={colors.white} size={20}>
            {oldTransaction?.id ? 'Update' : 'Submit'}
          </Typography>
        </Button>
      </View>
    </ModalWrapper>
  );
};

export default TransactionModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {},
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: scale(12),
    borderTopWidth: 1,
  },
  inputContainer: {
    marginBottom: spacing.y._10,
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
