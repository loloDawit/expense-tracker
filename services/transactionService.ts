import { auth, firestore } from '@/config/firebase';
import { colors } from '@/constants/theme';
import {
  CategoryType,
  ResponseType,
  TransactionType,
  WalletType,
} from '@/types';
import { getLast12Months, getLast7Days, getYearsRange } from '@/utils/common';
import logger from '@/utils/logger';
import { scale } from '@/utils/styling';
import { normalizeDate } from '@/utils/helper';
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
  writeBatch,
} from 'firebase/firestore';

import { getCloudinaryPath, uploadFileToCloudinary } from './imageServices';
import { createOrUpdateWallet, permanentlyDeleteWallet } from './walletService';

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

  try {
    logger.info('[sendPushNotification] Sending push notification...');
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
    logger.info('[sendPushNotification] Push notification response:', data);
  } catch (error) {
    logger.error('[sendPushNotification] Failed to send push notification', {
      error,
      expoPushToken,
    });
  }
};

export const fetchUserCategories = async (
  uid: string,
): Promise<ResponseType> => {
  logger.info(`[fetchUserCategories] Fetching categories for uid: ${uid}`);
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

    logger.info(
      `[fetchUserCategories] Found ${categories.length} categories.`,
    );
    return { success: true, data: categories };
  } catch (error) {
    logger.error('[fetchUserCategories] Error fetching categories:', {
      error,
      uid,
    });
    return { success: false, msg: 'Failed to fetch categories' };
  }
};

export const createOrUpdateCategory = async (
  uid: string,
  category: Partial<CategoryType> & { id?: string },
): Promise<ResponseType> => {
  logger.info(
    `[createOrUpdateCategory] Attempting to save category for uid: ${uid}`,
    { categoryId: category.id },
  );
  try {
    if (
      !category.label ||
      !category.value ||
      !category.icon ||
      !category.bgColor
    ) {
      logger.warn('[createOrUpdateCategory] Missing required category fields', {
        category,
      });
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

    logger.info(
      `[createOrUpdateCategory] Successfully saved category: ${ref.id}`,
    );
    return { success: true, data: { ...category, id: ref.id } };
  } catch (error) {
    logger.error('[createOrUpdateCategory] Error saving category:', {
      error,
      uid,
      categoryId: category.id,
    });
    return { success: false, msg: 'Failed to save category' };
  }
};

export const deleteCategory = async (
  uid: string,
  categoryId: string,
): Promise<ResponseType> => {
  logger.info(
    `[deleteCategory] Attempting to delete category: ${categoryId} for uid: ${uid}`,
  );
  try {
    const ref = doc(firestore, `users/${uid}/categories/${categoryId}`);
    await deleteDoc(ref);
    logger.info(`[deleteCategory] Successfully deleted category: ${categoryId}`);
    return { success: true };
  } catch (error) {
    logger.error('[deleteCategory] Error deleting category:', {
      error,
      uid,
      categoryId,
    });
    return { success: false, msg: 'Failed to delete category' };
  }
};

export const createOrUpdateTransaction = async (
  transactionData: Partial<TransactionType>,
): Promise<ResponseType> => {
  const { id, type, amount, walletId, image } = transactionData;
  const uid = auth.currentUser?.uid;

  logger.info(
    `[createOrUpdateTransaction] Starting transaction save for user: ${uid}`,
    { transactionId: id, type, amount, walletId },
  );

  if (!uid) {
    logger.error('[createOrUpdateTransaction] User not authenticated.');
    return { success: false, msg: 'User not authenticated' };
  }

  if (!amount || amount <= 0 || !type || !walletId) {
    logger.warn('[createOrUpdateTransaction] Invalid transaction data.', {
      transactionData,
    });
    return { success: false, msg: 'Invalid transaction data!' };
  }

  const batch = writeBatch(firestore);

  try {
    const walletRef = doc(firestore, 'wallets', walletId);
    let originalTransaction: TransactionType | null = null;

    // Handle updates
    if (id) {
      const oldTransactionRef = doc(firestore, 'transactions', id);
      const oldTransactionSnap = await getDoc(oldTransactionRef);
      if (oldTransactionSnap.exists()) {
        originalTransaction =
          oldTransactionSnap.data() as TransactionType;
        logger.info('[createOrUpdateTransaction] Found existing transaction.', {
          originalTransaction,
        });
      }
    }

    // Revert old transaction amount if wallet, type or amount changed
    if (
      originalTransaction &&
      (originalTransaction.walletId !== walletId ||
        originalTransaction.type !== type ||
        originalTransaction.amount !== amount)
    ) {
      logger.info(
        '[createOrUpdateTransaction] Reverting old transaction values from original wallet.',
      );
      const originalWalletRef = doc(
        firestore,
        'wallets',
        originalTransaction.walletId,
      );
      const originalWalletSnap = await getDoc(originalWalletRef);

      if (originalWalletSnap.exists()) {
        const originalWalletData = originalWalletSnap.data() as WalletType;
        const amountToRevert =
          originalTransaction.type === 'income'
            ? -originalTransaction.amount
            : originalTransaction.amount;
        const incomeToRevert =
          originalTransaction.type === 'income'
            ? -originalTransaction.amount
            : 0;
        const expenseToRevert =
          originalTransaction.type === 'expense'
            ? -originalTransaction.amount
            : 0;

        batch.update(originalWalletRef, {
          amount: (originalWalletData.amount ?? 0) + amountToRevert,
          totalIncome: (originalWalletData.totalIncome || 0) + incomeToRevert,
          totalExpenses:
            (originalWalletData.totalExpenses || 0) + expenseToRevert,
        });
        logger.info(
          '[createOrUpdateTransaction] Batched revert on original wallet.',
          { walletId: originalTransaction.walletId, amountToRevert },
        );
      } else {
        logger.warn(
          '[createOrUpdateTransaction] Original wallet not found for revert.',
          { walletId: originalTransaction.walletId },
        );
      }
    }

    // Apply new transaction amount
    const newWalletSnap = await getDoc(walletRef);
    if (!newWalletSnap.exists()) {
      logger.error('[createOrUpdateTransaction] Target wallet not found.', {
        walletId,
      });
      return { success: false, msg: 'Wallet not found!' };
    }

    const newWalletData = newWalletSnap.data() as WalletType;
    if (newWalletData.isDeleted) {
      logger.warn(
        '[createOrUpdateTransaction] Attempted to add transaction to a soft-deleted wallet.',
        { walletId },
      );
      return {
        success: false,
        msg: 'This wallet has been deleted and cannot accept new transactions.',
      };
    }
    const amountToAdd = type === 'income' ? amount : -amount;
    const incomeToAdd = type === 'income' ? amount : 0;
    const expenseToAdd = type === 'expense' ? amount : 0;

    if (type === 'expense' && ((newWalletData.amount ?? 0) - amount < 0)) {
      logger.warn(
        "[createOrUpdateTransaction] Insufficient funds for expense.",
        {
          walletAmount: newWalletData.amount ?? 0,
          expenseAmount: amount,
        },
      );
      return {
        success: false,
        msg: "Selected wallet doesn't have enough balance",
      };
    }

    batch.update(walletRef, {
      amount: (newWalletData.amount ?? 0) + amountToAdd,
      totalIncome: (newWalletData.totalIncome || 0) + incomeToAdd,
      totalExpenses: (newWalletData.totalExpenses || 0) + expenseToAdd,
    });
    logger.info('[createOrUpdateTransaction] Batched update on new wallet.', {
      walletId,
      amountToAdd,
    });

    // Upload image if provided
    if (image) {
      logger.info('[createOrUpdateTransaction] Uploading image.');
      const folderPath = getCloudinaryPath('transactions');
      const imageUploadResponse = await uploadFileToCloudinary(
        image,
        folderPath,
      );
      if (!imageUploadResponse.success) {
        logger.error('[createOrUpdateTransaction] Image upload failed.', {
          msg: imageUploadResponse.msg,
        });
        return {
          success: false,
          msg: imageUploadResponse.msg || 'Failed to upload image',
        };
      }
      transactionData.image = imageUploadResponse.data;
      logger.info('[createOrUpdateTransaction] Image uploaded successfully.');
    }

    // Create or update the transaction
    const transactionRef = id
      ? doc(firestore, 'transactions', id)
      : doc(collection(firestore, 'transactions'));
    batch.set(
      transactionRef,
      {
        ...transactionData,
        uid,
        updatedAt: Timestamp.now(),
        ...(id ? {} : { createdAt: Timestamp.now() }),
      },
      { merge: true },
    );
    logger.info('[createOrUpdateTransaction] Batched transaction save.');

    // Commit all batched writes
    await batch.commit();
    logger.info(
      '[createOrUpdateTransaction] Batch commit successful. Transaction saved.',
    );

    // Send push notification
    const userDocRef = doc(firestore, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const { expoPushToken, notificationsEnabled } = userDoc.data();
      if (expoPushToken && notificationsEnabled) {
        const notificationTitle = id
          ? 'Transaction Updated!'
          : 'New Transaction Added!';
        const notificationBody = `Amount: ${amount}, Type: ${type}`;
        await sendPushNotification(
          expoPushToken,
          notificationTitle,
          notificationBody,
        );
      }
    }

    return {
      success: true,
      data: { ...transactionData, id: transactionRef.id },
    };
  } catch (error: any) {
    logger.error('[createOrUpdateTransaction] Error saving transaction:', {
      error,
      errorMessage: error.message,
    });
    return { success: false, msg: error.message };
  }
};

export const deleteTransaction = async (
  transactionId: string,
): Promise<ResponseType> => {
  const uid = auth.currentUser?.uid;
  logger.info(
    `[deleteTransaction] Start — User: ${uid}, Transaction: ${transactionId}`,
  );

  if (!uid) {
    logger.error('[deleteTransaction] User not authenticated.');
    return { success: false, msg: 'User not authenticated' };
  }

  const transactionRef = doc(firestore, 'transactions', transactionId);

  try {
    // Step 1: Fetch transaction to be deleted
    const transactionSnap = await getDoc(transactionRef);
    if (!transactionSnap.exists()) {
      logger.warn(`[deleteTransaction] Transaction not found: ${transactionId}`);
      return { success: false, msg: 'Transaction not found' };
    }
    const transaction = transactionSnap.data() as TransactionType;
    logger.info('[deleteTransaction] Fetched transaction:', { transaction });

    if (transaction.uid !== uid) {
      logger.error(
        `[deleteTransaction] User ${uid} does not have permission to delete transaction ${transactionId} owned by ${transaction.uid}.`,
      );
      return {
        success: false,
        msg: 'You do not have permission to delete this transaction.',
      };
    }

    // Step 2: Fetch associated wallet
    const walletRef = doc(firestore, 'wallets', transaction.walletId);
    const walletSnap = await getDoc(walletRef);

    if (!walletSnap.exists()) {
      logger.warn(
        `[deleteTransaction] Wallet not found: ${transaction.walletId}. Deleting transaction anyway.`,
      );
      await deleteDoc(transactionRef);
      return { success: true, msg: 'Transaction deleted, wallet not found' };
    }

    const wallet = walletSnap.data() as WalletType;
    logger.info('[deleteTransaction] Fetched wallet:', { wallet });

    // Step 3: Handle wallet update and transaction deletion
    if (wallet.isDeleted) {
      // If wallet is already soft-deleted, just delete the transaction
      logger.warn(
        `[deleteTransaction] Wallet ${transaction.walletId} is soft-deleted. Deleting transaction only.`,
      );
      await deleteDoc(transactionRef);
    } else {
      // Otherwise, update wallet balance and delete transaction in a batch
      const batch = writeBatch(firestore);
      const amountToRevert =
        transaction.type === 'income'
          ? -transaction.amount
          : transaction.amount;
      const incomeToRevert =
        transaction.type === 'income' ? -transaction.amount : 0;
      const expenseToRevert =
        transaction.type === 'expense' ? -transaction.amount : 0;

      batch.update(walletRef, {
        amount: (wallet.amount ?? 0) + amountToRevert,
        totalIncome: (wallet.totalIncome || 0) + incomeToRevert,
        totalExpenses: (wallet.totalExpenses || 0) + expenseToRevert,
      });
      logger.info('[deleteTransaction] Batched wallet update.', {
        walletId: transaction.walletId,
        amountToRevert,
      });

      batch.delete(transactionRef);
      logger.info(
        `[deleteTransaction] Batched transaction deletion: ${transactionId}`,
      );

      await batch.commit();
    }

    logger.info('[deleteTransaction] Deletion process completed successfully.');

    // Step 4: Post-delete orphan check
    const remainingTransactionsQuery = query(
      collection(firestore, 'transactions'),
      where('walletId', '==', transaction.walletId),
      where('uid', '==', uid), // Ensure we only query the user's transactions
    );
    const remainingTransactionsSnap = await getDocs(remainingTransactionsQuery);

    logger.info(
      `[deleteTransaction] Found ${remainingTransactionsSnap.size} remaining transactions for wallet ${transaction.walletId}.`,
    );

    if (remainingTransactionsSnap.empty) {
      const refreshedWalletSnap = await getDoc(walletRef);
      if (
        refreshedWalletSnap.exists() &&
        refreshedWalletSnap.data()?.isDeleted
      ) {
        logger.info(
          `[deleteTransaction] Wallet ${transaction.walletId} is orphaned and soft-deleted. Permanently deleting.`,
        );
        await permanentlyDeleteWallet(transaction.walletId);
      } else {
        logger.info(
          `[deleteTransaction] Wallet ${transaction.walletId} is orphaned but not soft-deleted. Keeping.`,
        );
      }
    }

    return { success: true, msg: 'Transaction deleted and wallet updated' };
  } catch (error: any) {
    logger.error('[deleteTransaction] Error during transaction deletion:', {
      error,
      errorMessage: error.message,
      transactionId,
    });
    return {
      success: false,
      msg: 'Failed to delete transaction or update wallet',
    };
  }
};

/// statistics

export const fetchWeeklyStats = async (uid: string): Promise<ResponseType> => {
  logger.info(`[fetchWeeklyStats] Fetching for user: ${uid}`);
  try {
    const db = firestore;
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

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

    querySnapshot.forEach((doc) => {
      const transaction = { id: doc.id, ...doc.data() } as TransactionType;
      transactions.push(transaction);

      const transactionDate = normalizeDate(transaction.date)
        .toISOString()
        .split('T')[0];
      const dayData = weeklyData.find((day) => day.date === transactionDate);

      if (dayData) {
        if (transaction.type === 'income') dayData.income += transaction.amount;
        else if (transaction.type === 'expense')
          dayData.expense += transaction.amount;
      }
    });

    const stats = weeklyData.flatMap((day) => [
      {
        value: day.income,
        label: day.day,
        spacing: scale(4),
        labelWidth: scale(30),
        frontColor: colors.primary,
      },
      { value: day.expense, frontColor: colors.rose },
    ]);

    logger.info(
      `[fetchWeeklyStats] Successfully fetched ${transactions.length} transactions.`,
    );
    return { success: true, data: { stats, transactions } };
  } catch (error) {
    logger.error('[fetchWeeklyStats] Error fetching weekly transactions:', {
      error,
      uid,
    });
    return { success: false, msg: 'Failed to fetch weekly transactions' };
  }
};

export const fetchMonthlyStats = async (uid: string): Promise<ResponseType> => {
  logger.info(`[fetchMonthlyStats] Fetching for user: ${uid}`);
  try {
    const db = firestore;
    const today = new Date();
    const twelveMonthsAgo = new Date(today);
    twelveMonthsAgo.setMonth(today.getMonth() - 12);

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

    querySnapshot.forEach((doc) => {
      const transaction = { id: doc.id, ...doc.data() } as TransactionType;
      transactions.push(transaction);

      const transactionDate = normalizeDate(transaction.date);
      const monthName = transactionDate.toLocaleString('default', {
        month: 'short',
      });
      const shortYear = transactionDate.getFullYear().toString().slice(-2);
      const monthData = monthlyData.find(
        (month) => month.month === `${monthName} ${shortYear}`,
      );

      if (monthData) {
        if (transaction.type === 'income')
          monthData.income += transaction.amount;
        else if (transaction.type === 'expense')
          monthData.expense += transaction.amount;
      }
    });

    const stats = monthlyData.flatMap((month) => [
      {
        value: month.income,
        label: month.month,
        spacing: scale(4),
        labelWidth: scale(46),
        frontColor: colors.primary,
      },
      { value: month.expense, frontColor: colors.rose },
    ]);

    logger.info(
      `[fetchMonthlyStats] Successfully fetched ${transactions.length} transactions.`,
    );
    return { success: true, data: { stats, transactions } };
  } catch (error) {
    logger.error('[fetchMonthlyStats] Error fetching monthly transactions:', {
      error,
      uid,
    });
    return { success: false, msg: 'Failed to fetch monthly transactions' };
  }
};

export const fetchYearlyStats = async (uid: string): Promise<ResponseType> => {
  logger.info(`[fetchYearlyStats] Fetching for user: ${uid}`);
  try {
    const db = firestore;
    const transactionsQuery = query(
      collection(db, 'transactions'),
      orderBy('date', 'desc'),
      where('uid', '==', uid),
    );

    const querySnapshot = await getDocs(transactionsQuery);
    const transactions: TransactionType[] = [];

    if (querySnapshot.empty) {
      logger.info('[fetchYearlyStats] No transactions found for user.');
      return {
        success: true,
        data: { stats: [], transactions: [] },
      };
    }

    const firstTransactionDate = querySnapshot.docs[
      querySnapshot.docs.length - 1
    ]
      .data()
      .date.toDate();
    const firstYear = firstTransactionDate.getFullYear();
    const currentYear = new Date().getFullYear();
    const yearlyData = getYearsRange(firstYear, currentYear);

    querySnapshot.forEach((doc) => {
      const transaction = { id: doc.id, ...doc.data() } as TransactionType;
      transactions.push(transaction);

      const transactionYear = normalizeDate(transaction.date).getFullYear();
      const yearData = yearlyData.find(
        (item: any) => item.year === transactionYear.toString(),
      );

      if (yearData) {
        if (transaction.type === 'income')
          yearData.income += transaction.amount;
        else if (transaction.type === 'expense')
          yearData.expense += transaction.amount;
      }
    });

    const stats = yearlyData.flatMap((year: any) => [
      {
        value: year.income,
        label: year.year,
        spacing: scale(4),
        labelWidth: scale(35),
        frontColor: colors.primary,
      },
      { value: year.expense, frontColor: colors.rose },
    ]);

    logger.info(
      `[fetchYearlyStats] Successfully fetched ${transactions.length} transactions.`,
    );
    return { success: true, data: { stats, transactions } };
  } catch (error) {
    logger.error('[fetchYearlyStats] Error fetching yearly transactions:', {
      error,
      uid,
    });
    return { success: false, msg: 'Failed to fetch yearly transactions' };
  }
};