import { auth, firestore } from '@/config/firebase';
import { colors } from '@/constants/theme';
import {
  CategoryType,
  ResponseType,
  TransactionType,
  WalletType,
} from '@/types';
import { getLast12Months, getLast7Days, getYearsRange } from '@/utils/common';
import { scale } from '@/utils/styling';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

import { getCloudinaryPath, uploadFileToCloudinary } from './imageServices';
import { createOrUpdateWallet } from './walletService';

export const sendPushNotification = async (
  expoPushToken: string,
  title: string,
  body: string,
) => {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title,
    body,
    data: { someData: 'goes here' },
  };

  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });

  const data = await response.json();
  console.log('Push notification response:', data);
};

export const fetchUserCategories = async (uid: string) => {
  try {
    const snapshot = await getDocs(
      query(
        collection(firestore, `users/${uid}/categories`),
        orderBy('createdAt', 'desc'),
      ),
    );

    const categories = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, data: categories };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return { success: false, msg: 'Failed to fetch categories' };
  }
};
export const createOrUpdateCategory = async (
  uid: string,
  category: Partial<CategoryType> & { id?: string },
) => {
  try {
    if (
      !category.label ||
      !category.value ||
      !category.icon ||
      !category.bgColor
    ) {
      return { success: false, msg: 'Missing required category fields' };
    }

    const ref = category.id
      ? doc(firestore, `users/${uid}/categories`, category.id)
      : doc(collection(firestore, `users/${uid}/categories`));

    await setDoc(
      ref,
      {
        ...category,
        createdAt: Timestamp.now(),
      },
      { merge: true },
    );

    return { success: true, data: { ...category, id: ref.id } };
  } catch (error) {
    console.error('Error saving category:', error);
    return { success: false, msg: 'Failed to save category' };
  }
};
export const deleteCategory = async (uid: string, categoryId: string) => {
  try {
    const ref = doc(firestore, `users/${uid}/categories/${categoryId}`);
    await deleteDoc(ref);
    return { success: true };
  } catch (error) {
    console.error('Error deleting category:', error);
    return { success: false, msg: 'Failed to delete category' };
  }
};

export const createOrUpdateTransaction = async (
  transactionData: Partial<TransactionType>,
) => {
  try {
    const { id, type, amount, walletId, image } = transactionData;

    if (!amount || amount <= 0 || !type) {
      return {
        success: false,
        msg: 'Invalid transaction data!',
      };
    }

    // do this while updating: Fetch the original transaction if updating
    if (id) {
      // Fetch the old transaction data
      const oldTransactionSnapshot = await getDoc(
        doc(firestore, 'transactions', id),
      );
      const oldTransaction = oldTransactionSnapshot.data() as TransactionType;

      const shouldRevertOriginal =
        oldTransaction.type !== type ||
        oldTransaction.amount !== amount ||
        oldTransaction.walletId !== walletId;

      if (shouldRevertOriginal) {
        // Check if we need to revert the original transaction (type, amount, or wallet changed)
        let res = await revertAndUpdateWallets(
          oldTransaction, // Old transaction
          Number(amount!), // New transaction amount
          type, // New transaction type ('income' or 'expense')
          walletId!, // New wallet ID
        );

        if (!res.success) return res;
      }
    } else {
      // Handle wallet updates for new transactions
      let res = await updateWalletForNewTransaction(
        walletId!,
        Number(amount!),
        type,
      );
      if (!res.success) return res;
    }

    // Upload image if provided
    const folderPath = getCloudinaryPath('transactions');
    if (image) {
      const imageUploadResponse = await uploadFileToCloudinary(
        image,
        folderPath,
      );
      if (!imageUploadResponse.success) {
        return {
          success: false,
          msg: imageUploadResponse.msg || 'Failed to upload image',
        };
      }
      transactionData.image = imageUploadResponse.data;
    }

    // Create or update the transaction
    const transactionRef = id
      ? doc(firestore, 'transactions', id)
      : doc(collection(firestore, 'transactions'));
    await setDoc(
      transactionRef,
      {
        ...transactionData,
        uid: auth.currentUser?.uid,
      },
      { merge: true },
    );

    if (auth.currentUser) {
      const userDocRef = doc(firestore, 'users', auth.currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userPushToken = userData.expoPushToken;
        const notificationsEnabled = userData.notificationsEnabled;

        if (userPushToken && notificationsEnabled) {
          const notificationTitle = id
            ? 'Transaction Updated!'
            : 'New Transaction Added!';
          const notificationBody = `Amount: ${amount}, Type: ${type}`;
          await sendPushNotification(
            userPushToken,
            notificationTitle,
            notificationBody,
          );
        }
      }
    }

    return {
      success: true,
      data: { ...transactionData, id: transactionRef.id },
    };
  } catch (error: any) {
    console.error('Error creating or updating transaction:', error);
    return { success: false, msg: error.message };
  }
};

export const updateWalletForNewTransaction = async (
  walletId: string,
  amount: number,
  type: string,
) => {
  try {
    // Fetch the wallet
    const walletRef = doc(firestore, 'wallets', walletId);
    const walletSnapshot = await getDoc(walletRef);

    if (!walletSnapshot.exists()) {
      console.error('Wallet not found');
      return { success: false, msg: 'Wallet not found!' };
    }

    const walletData = walletSnapshot.data() as WalletType;

    if (type === 'expense' && walletData.amount! - amount < 0) {
      return {
        success: false,
        msg: "Selected wallet don't have enough balance",
      };
    }

    // Adjust wallet balance and totals based on the transaction type
    const updatedWalletAmount =
      type === 'income'
        ? Number(walletData.amount!) + amount // Add income to wallet balance
        : Number(walletData.amount!) - amount; // Subtract expense from wallet balance

    const updateType = type === 'income' ? 'totalIncome' : 'totalExpenses';
    const updatedTotals =
      type === 'income'
        ? Number(walletData.totalIncome!) + amount
        : Number(walletData.totalExpenses!) + amount;

    // Update the wallet
    await updateDoc(walletRef, {
      amount: updatedWalletAmount,
      [updateType]: updatedTotals,
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating wallet for new transaction:', error);
    return { success: false, msg: 'Could not update the wallet!' };
  }
};

export const revertAndUpdateWallets = async (
  oldTransaction: TransactionType,
  newTransactionAmount: number,
  newTransactionType: string,
  newWalletId: string,
) => {
  try {
    // Revert original wallet values
    const originalWalletSnapshot = await getDoc(
      doc(firestore, 'wallets', oldTransaction.walletId),
    );
    const originalWallet = originalWalletSnapshot.data() as WalletType;

    const revertType =
      oldTransaction.type === 'income' ? 'totalIncome' : 'totalExpenses';

    const revertIncomeExpense =
      oldTransaction.type === 'income'
        ? -Number(oldTransaction.amount!)
        : Number(oldTransaction.amount!);

    const revertedWalletAmount =
      Number(originalWallet.amount!) + revertIncomeExpense;
    const revertedIncomeExpenseAmount =
      Number(originalWallet[revertType]!) - Number(oldTransaction.amount!);

    await createOrUpdateWallet({
      id: oldTransaction.walletId,
      amount: revertedWalletAmount,
      [revertType]: revertedIncomeExpenseAmount,
    });

    // Fetch new wallet again (in case it's the same as old one)
    const newWalletSnapshot = await getDoc(
      doc(firestore, 'wallets', newWalletId),
    );
    const newWallet = newWalletSnapshot.data() as WalletType;

    const updateType =
      newTransactionType === 'income' ? 'totalIncome' : 'totalExpenses';
    const updateWalletAmount =
      newTransactionType === 'income'
        ? Number(newTransactionAmount)
        : -Number(newTransactionAmount);

    const newWalletAmount = Number(newWallet.amount!) + updateWalletAmount;
    const newIncomeExpenseAmount =
      Number(newWallet[updateType]!) + Number(newTransactionAmount);

    await createOrUpdateWallet({
      id: newWalletId,
      amount: newWalletAmount,
      [updateType]: newIncomeExpenseAmount,
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating wallets:', error);
    return { success: false, msg: 'Could not update the wallet!' };
  }
};

export const deleteTransaction = async (
  transactionId: string,
  walletId: string,
) => {
  try {
    // Step 1: Fetch the transaction to retrieve its details
    const transactionRef = doc(firestore, 'transactions', transactionId);
    const transactionSnapshot = await getDoc(transactionRef);

    if (!transactionSnapshot.exists()) {
      return { success: false, msg: 'Transaction not found' };
    }

    const transactionData = transactionSnapshot.data();
    const transactionType = transactionData?.type;
    const transactionAmount = Number(transactionData?.amount);

    // Step 2: Fetch the wallet data to update the totalIncome or totalExpenses
    const walletRef = doc(firestore, 'wallets', walletId);
    const walletSnapshot = await getDoc(walletRef);

    if (!walletSnapshot.exists()) {
      return { success: false, msg: 'Wallet not found' };
    }

    const walletData = walletSnapshot.data();

    // Determine the field to update based on transaction type
    const updateType =
      transactionType === 'income' ? 'totalIncome' : 'totalExpenses';
    const newWalletAmount =
      walletData?.amount! -
      (transactionType === 'income' ? transactionAmount : -transactionAmount);
    const updatedTotals = walletData[updateType] - transactionAmount;

    // if its income and the wallet amount can go below zero
    if (transactionType === 'income' && newWalletAmount < 0) {
      return { success: false, msg: 'You cannot delete this transaction' };
    }

    // Step 3: Update the wallet with the new totals
    await createOrUpdateWallet({
      id: walletId,
      amount: newWalletAmount,
      [updateType]: updatedTotals,
    });

    // Step 4: Delete the transaction from Firestore
    await deleteDoc(transactionRef);

    return { success: true, msg: 'Transaction deleted and wallet updated' };
  } catch (error) {
    console.error('Error deleting transaction and updating wallet:', error);
    return {
      success: false,
      msg: 'Failed to delete transaction or update wallet',
    };
  }
};

/// statistics

export const fetchWeeklyStats = async (uid: string): Promise<ResponseType> => {
  try {
    const db = firestore;
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    // Fetch transactions within the last 7 days for the specified user
    const transactionsQuery = query(
      collection(db, 'transactions'),
      where('date', '>=', Timestamp.fromDate(sevenDaysAgo)),
      where('date', '<=', Timestamp.fromDate(today)),
      orderBy('date', 'desc'),
      where('uid', '==', uid),
    );

    const querySnapshot = await getDocs(transactionsQuery);
    const weeklyData = getLast7Days();
    const transactions: TransactionType[] = [];

    // Map transactions to the correct day in weeklyData and build the transactions array
    querySnapshot.forEach((doc) => {
      const transaction = doc.data() as TransactionType;
      transaction.id = doc.id; // Include document ID in the transaction data
      transactions.push(transaction);

      const transactionDate = (transaction.date as Timestamp)
        .toDate()
        .toISOString()
        .split('T')[0]; // as Mon, Tue
      const dayData = weeklyData.find((day) => day.date === transactionDate);

      if (dayData) {
        if (transaction.type === 'income') dayData.income += transaction.amount;
        else if (transaction.type === 'expense')
          dayData.expense += transaction.amount;
      }
    });

    // flatMap takes each day’s data and creates two entries
    // — one for income and one for expense
    // — then flattens these entries into a single array
    const stats = weeklyData.flatMap((day) => [
      {
        value: day.income,
        label: day.day,
        spacing: scale(4),
        labelWidth: scale(30),
        frontColor: colors.primary,
      },
      {
        value: day.expense,
        frontColor: colors.rose,
      },
    ]);

    return {
      success: true,
      data: {
        stats,
        transactions, // Include all transaction details
      },
    };
  } catch (error) {
    console.error('Error fetching weekly transactions:', error);
    return {
      success: false,
      msg: 'Failed to fetch weekly transactions',
    };
  }
};

export const fetchMonthlyStats = async (uid: string): Promise<ResponseType> => {
  try {
    const db = firestore;
    const today = new Date();
    const twelveMonthsAgo = new Date(today);
    twelveMonthsAgo.setMonth(today.getMonth() - 12);

    // Define query to fetch transactions in the last 12 months
    const transactionsQuery = query(
      collection(db, 'transactions'),
      where('date', '>=', Timestamp.fromDate(twelveMonthsAgo)),
      where('date', '<=', Timestamp.fromDate(today)),
      orderBy('date', 'desc'),
      where('uid', '==', uid),
    );

    const querySnapshot = await getDocs(transactionsQuery);
    const monthlyData = getLast12Months();
    const transactions: TransactionType[] = [];

    // Process transactions to calculate income and expense for each month
    querySnapshot.forEach((doc) => {
      const transaction = doc.data() as TransactionType;
      transaction.id = doc.id; // Include document ID in transaction data
      transactions.push(transaction);

      const transactionDate = (transaction.date as Timestamp).toDate();
      const monthName = transactionDate.toLocaleString('default', {
        month: 'short',
      });
      const shortYear = transactionDate.getFullYear().toString().slice(-2);
      const monthData = monthlyData.find(
        (month) => month.month === `${monthName} ${shortYear}`,
      );

      if (monthData) {
        if (transaction.type === 'income') {
          monthData.income += transaction.amount;
        } else if (transaction.type === 'expense') {
          monthData.expense += transaction.amount;
        }
      }
    });

    // Reformat monthlyData for the bar chart with income and expense entries for each month
    const stats = monthlyData.flatMap((month) => [
      {
        value: month.income,
        label: month.month,
        spacing: scale(4),
        labelWidth: scale(46),
        frontColor: colors.primary, // Income bar color
      },
      {
        value: month.expense,
        frontColor: colors.rose, // Expense bar color
      },
    ]);

    return {
      success: true,
      data: {
        stats,
        transactions, // Include all transaction details
      },
    };
  } catch (error) {
    console.error('Error fetching monthly transactions:', error);
    return {
      success: false,
      msg: 'Failed to fetch monthly transactions',
    };
  }
};

export const fetchYearlyStats = async (uid: string): Promise<ResponseType> => {
  try {
    const db = firestore;

    // Fetch all transactions for the specified user
    const transactionsQuery = query(
      collection(db, 'transactions'),
      orderBy('date', 'desc'),
      where('uid', '==', uid),
    );

    const querySnapshot = await getDocs(transactionsQuery);
    const transactions: TransactionType[] = [];

    // Find the first and last year from transactions
    const firstTransaction = querySnapshot.docs.reduce((earliest, doc) => {
      const transactionDate = doc.data().date.toDate();
      return transactionDate < earliest ? transactionDate : earliest;
    }, new Date());

    const firstYear = firstTransaction.getFullYear();
    const currentYear = new Date().getFullYear();

    // Initialize yearly data range
    const yearlyData = getYearsRange(firstYear, currentYear);

    // Process transactions to calculate income and expense for each year
    querySnapshot.forEach((doc) => {
      const transaction = doc.data() as TransactionType;
      transaction.id = doc.id; // Include document ID in transaction data
      transactions.push(transaction);

      const transactionYear = (transaction.date as Timestamp)
        .toDate()
        .getFullYear();
      const yearData = yearlyData.find(
        (item: any) => item.year === transactionYear.toString(),
      );

      if (yearData) {
        if (transaction.type === 'income') {
          yearData.income += transaction.amount;
        } else if (transaction.type === 'expense') {
          yearData.expense += transaction.amount;
        }
      }
    });

    // Reformat yearlyData for the bar chart with income and expense entries for each year
    const stats = yearlyData.flatMap((year: any) => [
      {
        value: year.income,
        label: year.year,
        spacing: scale(4),
        labelWidth: scale(35),
        frontColor: colors.primary, // Income bar color
      },
      {
        value: year.expense,
        frontColor: colors.rose, // Expense bar color
      },
    ]);

    return {
      success: true,
      data: {
        stats,
        transactions, // Include all transaction details
      },
    };
  } catch (error) {
    console.error('Error fetching yearly transactions:', error);
    return {
      success: false,
      msg: 'Failed to fetch yearly transactions',
    };
  }
};
