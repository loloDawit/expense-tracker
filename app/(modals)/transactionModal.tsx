import BackButton from '@/components/BackButton';
import Button from '@/components/Button';
import Header from '@/components/Header';
import Input from '@/components/Input';
import ModalWrapper from '@/components/ModalWrapper';
import { theme } from '@/constants/theme';
import { scale, verticalScale } from '@/utils/styling';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Icons from 'phosphor-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import ImageUpload from '@/components/ImageUpload';
import Typography from '@/components/Typography';
import { expenseCategories, transactionTypes } from '@/constants/data';
import { useAuth } from '@/contexts/AuthContext';
import useFetchData from '@/hooks/useFetchData';
import {
  createOrUpdateTransaction,
  deleteTransaction,
  fetchUserCategories,
} from '@/services/transactionService';
import { CategoryType, TransactionType, WalletType } from '@/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { orderBy, where } from 'firebase/firestore';
import { Dropdown } from 'react-native-element-dropdown';

const TransactionModal = () => {
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
  // console.log("old transaction: ", oldTransaction);
  const [allCategories, setAllCategories] = useState<CategoryType[]>([]);

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
          'bgColor' in cat
      );

      // Merge & remove duplicates based on `value`
      const merged = [
        ...defaultCategories,
        ...userCategories.filter(
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
            'bgColor' in cat
        )
      );
    };

    fetch();
  }, [user?.uid]);

  console.log('all categories: ', allCategories);

  const {
    data: wallets,
    loading: walletLoading,
    error,
  } = useFetchData<WalletType>('wallets', [
    where('uid', '==', user?.uid),
    orderBy('created', 'desc'),
  ]);

  const [loading, setLoading] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);

  const [transaction, setTransaction] = useState<TransactionType>({
    type: 'expense',
    amount: 0,
    description: '',
    category: '',
    date: new Date(),
    walletId: '',
    image: null,
  });

  useEffect(() => {
    if (oldTransaction?.id) {
      // console.log("old tr: ", oldTransaction);
      setTransaction({
        type: oldTransaction.type,
        amount: Number(oldTransaction.amount),
        description: oldTransaction.description || '',
        category: oldTransaction.category || '',
        date: new Date(oldTransaction.date), // Convert string to Date object
        walletId: oldTransaction.walletId,
        image: oldTransaction?.image || null,
      });
    }
  }, []);

  const onDateChange = (event: any, selectedDate: any) => {
    const currentDate = selectedDate || transaction.date;
    setTransaction({ ...transaction, date: currentDate }); // Update the date state
    setShowDatePicker(Platform.OS == 'android' ? false : true); // will be false on android, but will stay open on ios
  };

  const onSelectImage = (file: any) => {
    // console.log("file: ", file);
    if (file) setTransaction({ ...transaction, image: file });
  };

  const onSubmit = async () => {
    const { type, amount, description, category, date, walletId, image } =
      transaction;

    if (!walletId || !date || !amount || (type == 'expense' && !category)) {
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
    // console.log("transaction: ", res);
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
    console.log('deleting the tr: ', oldTransaction);
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

  // console.log("got item: ", transaction.type);

  return (
    <ModalWrapper>
      <View style={styles.container}>
        <Header
          title={oldTransaction?.id ? 'Update Transaction' : 'Add Transaction'}
          leftIcon={<BackButton />}
          style={{ marginBottom: theme.spacing.y._10 }}
        />

        {/* form */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.form}
        >
          {/* type */}
          <View style={styles.inputContainer}>
            <Typography
              color={theme.colors.neutral200}
              size={16}
              fontWeight={'500'}
            >
              Type
            </Typography>
            <Dropdown
              style={styles.dropdownContainer}
              activeColor={theme.colors.neutral700}
              itemTextStyle={styles.dropdownItemText}
              selectedTextStyle={styles.dropdownSelectedText}
              itemContainerStyle={styles.dropdownItemContainer}
              iconStyle={styles.dropdownIcon}
              data={transactionTypes}
              maxHeight={300}
              labelField="label"
              valueField="value"
              // placeholder={!isFocus ? "Select item" : "..."}
              // searchPlaceholder="Search..."
              placeholderStyle={styles.dropdownPlaceholder}
              value={transaction.type}
              containerStyle={styles.dropdownListContainer}
              onChange={(item) => {
                setTransaction({ ...transaction, type: item.value });
              }}
            />
          </View>

          {/* wallet */}
          <View style={styles.inputContainer}>
            <Typography
              color={theme.colors.neutral200}
              size={16}
              fontWeight={'500'}
            >
              Wallet
            </Typography>
            <Dropdown
              style={styles.dropdownContainer}
              activeColor={theme.colors.neutral700}
              itemTextStyle={styles.dropdownItemText}
              selectedTextStyle={styles.dropdownSelectedText}
              itemContainerStyle={styles.dropdownItemContainer}
              iconStyle={styles.dropdownIcon}
              data={wallets.map((wallet) => ({
                label: `${wallet?.name} ($${wallet.amount})`,
                value: wallet?.id,
              }))}
              maxHeight={300}
              labelField="label"
              valueField="value"
              // placeholder={!isFocus ? "Select item" : "..."}
              // searchPlaceholder="Search..."
              placeholderStyle={styles.dropdownPlaceholder}
              value={transaction.walletId}
              containerStyle={styles.dropdownListContainer}
              onChange={(item) => {
                setTransaction({ ...transaction, walletId: item.value || '' });
              }}
            />
          </View>

          {/* category: show only if type is expense */}

          {transaction.type == 'expense' && (
            <View style={styles.inputContainer}>
              <Typography
                color={theme.colors.neutral200}
                size={16}
                fontWeight={'500'}
              >
                Expense Cateogry
              </Typography>
              <Dropdown
                style={styles.dropdownContainer}
                activeColor={theme.colors.neutral700}
                itemTextStyle={styles.dropdownItemText}
                selectedTextStyle={styles.dropdownSelectedText}
                itemContainerStyle={styles.dropdownItemContainer}
                iconStyle={styles.dropdownIcon}
                data={Object.values(allCategories)}
                maxHeight={300}
                labelField="label"
                valueField="value"
                // placeholder={!isFocus ? "Select item" : "..."}
                // searchPlaceholder="Search..."
                placeholderStyle={styles.dropdownPlaceholder}
                value={transaction.category}
                containerStyle={styles.dropdownListContainer}
                onChange={(item) => {
                  setTransaction({
                    ...transaction,
                    category: item.value || '',
                  });
                }}
              />
            </View>
          )}

          {/* date picker */}
          <View style={styles.inputContainer}>
            <Typography
              color={theme.colors.neutral200}
              size={16}
              fontWeight={'500'}
            >
              Date
            </Typography>
            {!showDatePicker && (
              <Pressable
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Typography size={14}>
                  {(transaction?.date as Date)?.toLocaleDateString()}
                </Typography>
              </Pressable>
            )}

            {showDatePicker && (
              <View style={Platform.OS == 'ios' && styles.iosDatePicker}>
                <DateTimePicker
                  themeVariant="dark"
                  value={transaction.date as Date}
                  textColor={theme.colors.white}
                  mode="date"
                  display={Platform.OS == 'ios' ? 'spinner' : 'default'}
                  onChange={onDateChange}
                />

                {Platform.OS == 'ios' && (
                  <TouchableOpacity
                    style={styles.datePickerButton}
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

          {/* amount */}
          <View style={styles.inputContainer}>
            <Typography color={theme.colors.neutral200} size={16}>
              Amount
            </Typography>
            <Input
              keyboardType="numeric"
              // placeholder="Salary"
              value={transaction.amount?.toString()}
              onChangeText={(value) =>
                setTransaction({
                  ...transaction,
                  amount: Number(value.replace(/[^0-9]/g, '')),
                })
              }
            />
          </View>
          {/* description */}
          <View style={styles.inputContainer}>
            <View style={styles.flexRow}>
              <Typography color={theme.colors.neutral200} size={16}>
                Description
              </Typography>
              <Typography color={theme.colors.neutral500} size={14}>
                (optional)
              </Typography>
            </View>

            <Input
              // placeholder="Salary"
              value={transaction.description}
              multiline
              numberOfLines={2}
              containerStyle={{
                flexDirection: 'row',
                height: verticalScale(100),
                alignItems: 'flex-start',
                paddingVertical: 15,
              }}
              onChangeText={(value) =>
                setTransaction({
                  ...transaction,
                  description: value,
                })
              }
            />
          </View>
          <View style={styles.inputContainer}>
            <View style={styles.flexRow}>
              <Typography color={theme.colors.neutral200} size={16}>
                Receipt
              </Typography>
              <Typography color={theme.colors.neutral500} size={14}>
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
      <View style={styles.footer}>
        {oldTransaction?.id && !loading && (
          <Button
            style={{
              backgroundColor: theme.colors.rose,
              paddingHorizontal: theme.spacing.x._15,
            }}
            onPress={showDeleteAlert}
          >
            <Icons.Trash
              color={theme.colors.white}
              size={verticalScale(24)}
              weight="bold"
            />
          </Button>
        )}

        <Button loading={loading} onPress={onSubmit} style={{ flex: 1 }}>
          <Typography color={theme.colors.black} size={20} fontWeight={'bold'}>
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
    paddingHorizontal: theme.spacing.y._20,
  },
  form: {
    gap: theme.spacing.y._20,
    paddingVertical: theme.spacing.y._15,
    paddingBottom: theme.spacing.y._40,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.x._20,
    gap: scale(12),
    paddingTop: theme.spacing.y._15,
    borderTopColor: theme.colors.neutral700,
    marginBottom: theme.spacing.y._5,
    borderTopWidth: 1,
  },
  inputContainer: {
    gap: theme.spacing.y._10,
  },
  iosDropDown: {
    flexDirection: 'row',
    height: verticalScale(54),
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: verticalScale(14),
    borderWidth: 1,
    color: theme.colors.white,
    borderColor: theme.colors.neutral300,
    borderRadius: theme.radius.md,
    borderCurve: 'continuous',
    paddingHorizontal: theme.spacing.x._15,
  },
  androidDropDown: {
    // flexDirection: "row",
    height: verticalScale(54),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    fontSize: verticalScale(14),
    color: theme.colors.white,
    borderColor: theme.colors.neutral300,
    borderRadius: theme.radius.md,
    borderCurve: 'continuous',
    // paddingHorizontal: theme.spacing.x._15,
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.x._5,
  },
  dateInput: {
    flexDirection: 'row',
    height: verticalScale(54),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.neutral300,
    borderRadius: theme.radius.md,
    borderCurve: 'continuous',
    paddingHorizontal: theme.spacing.x._15,
  },

  iosDatePicker: {
    // backgroundColor: "red",
  },
  datePickerButton: {
    backgroundColor: theme.colors.neutral700,
    alignSelf: 'flex-end',
    padding: theme.spacing.y._7,
    marginRight: theme.spacing.x._7,
    paddingHorizontal: theme.spacing.y._15,
    borderRadius: theme.radius.pill,
  },
  dropdownContainer: {
    height: verticalScale(54),
    borderWidth: 1,
    borderColor: theme.colors.neutral300,
    paddingHorizontal: theme.spacing.x._15,
    borderRadius: theme.radius.sm,
    borderCurve: 'continuous',
  },
  dropdownItemText: { color: theme.colors.white },
  dropdownSelectedText: {
    color: theme.colors.white,
    fontSize: verticalScale(14),
  },
  dropdownListContainer: {
    backgroundColor: theme.colors.neutral900,
    borderRadius: theme.radius.sm,
    borderCurve: 'continuous',
    paddingVertical: theme.spacing.y._7,
    top: 5,
    borderColor: theme.colors.neutral500,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 5,
  },
  dropdownPlaceholder: {
    color: theme.colors.white,
  },
  dropdownItemContainer: {
    borderRadius: theme.radius.sm,
    marginHorizontal: theme.spacing.x._7,
  },
  dropdownIcon: {
    height: verticalScale(30),
    tintColor: theme.colors.neutral300,
  },
});
