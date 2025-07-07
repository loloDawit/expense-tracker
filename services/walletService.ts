import { auth, firestore } from '@/config/firebase';
import { ResponseType, WalletType } from '@/types';
import logger from '@/utils/logger';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore';

import { getCloudinaryPath, uploadFileToCloudinary } from './imageServices';
import { createOrUpdateTransaction } from './transactionService';

export const migrateWallets = async (): Promise<ResponseType> => {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    return { success: false, msg: 'User not authenticated' };
  }

  logger.info(`[migrateWallets] Starting migration for user: ${uid}`);
  const batch = writeBatch(firestore);
  let migratedCount = 0;

  try {
    const walletsQuery = query(
      collection(firestore, 'wallets'),
      where('uid', '==', uid),
    );
    const snapshot = await getDocs(walletsQuery);

    snapshot.forEach((document) => {
      const wallet = document.data() as WalletType;
      if (wallet.isDeleted === undefined) {
        const docRef = doc(firestore, 'wallets', document.id);
        batch.update(docRef, { isDeleted: false });
        migratedCount++;
        logger.info(`[migrateWallets] Staged wallet for migration: ${document.id}`);
      }
    });

    if (migratedCount > 0) {
      await batch.commit();
      logger.info(`[migrateWallets] Successfully migrated ${migratedCount} wallets.`);
      return { success: true, msg: `Migrated ${migratedCount} wallets.` };
    } else {
      logger.info('[migrateWallets] No wallets needed migration.');
      return { success: true, msg: 'No wallets needed migration.' };
    }
  } catch (error: any) {
    logger.error('[migrateWallets] Error during migration:', { error });
    return { success: false, msg: error.message };
  }
};

export const createOrUpdateWallet = async (
  walletData: Partial<WalletType>,
  initialAmount?: number,
  initialDate?: Date,
  initialDescription?: string,
): Promise<ResponseType> => {
  const uid = auth.currentUser?.uid;
  logger.info(`[createOrUpdateWallet] Starting wallet save for user: ${uid}`, {
    walletId: walletData.id,
  });

  if (!uid) {
    logger.error('[createOrUpdateWallet] User not authenticated.');
    return { success: false, msg: 'User not authenticated' };
  }

  try {
    let walletToSave = { ...walletData };

    // On update, check if wallet is soft-deleted
    if (walletData.id) {
      const existingRef = doc(firestore, 'wallets', walletData.id);
      const existingSnap = await getDoc(existingRef);

      if (!existingSnap.exists()) {
        logger.warn(
          `[createOrUpdateWallet] Wallet with id ${walletData.id} does not exist.`,
        );
        return { success: false, msg: 'Wallet does not exist' };
      }

      const existingData = existingSnap.data() as WalletType;
      if (existingData.isDeleted) {
        logger.warn(
          `[createOrUpdateWallet] Attempted to update soft-deleted wallet ${walletData.id}`,
        );
        return {
          success: false,
          msg: 'Cannot update a deleted wallet. Please restore it first.',
        };
      }
    }

    // Upload image if a new one is provided
    if (walletData.image && typeof walletData.image !== 'string') {
      logger.info('[createOrUpdateWallet] New image provided, starting upload.');
      const folderPath = getCloudinaryPath('wallets');
      const imageUploadResponse = await uploadFileToCloudinary(
        walletData.image,
        folderPath,
      );

      if (!imageUploadResponse.success) {
        logger.error('[createOrUpdateWallet] Image upload failed.', {
          msg: imageUploadResponse.msg,
        });
        return {
          success: false,
          msg: imageUploadResponse.msg || 'Failed to upload image',
        };
      }
      walletToSave.image = imageUploadResponse.data;
      logger.info('[createOrUpdateWallet] Image uploaded successfully.');
    }

    const walletRef = walletData.id
      ? doc(firestore, 'wallets', walletData.id)
      : doc(collection(firestore, 'wallets'));

    // Set defaults for new wallet
    if (!walletData.id) {
      logger.info('[createOrUpdateWallet] Creating new wallet with defaults.');
      walletToSave = {
        ...walletToSave,
        amount: 0,
        totalIncome: 0,
        totalExpenses: 0,
        created: new Date(),
        isDeleted: false,
        uid,
      };
    }

    // Save wallet
    await setDoc(walletRef, walletToSave, { merge: true });
    logger.info(`[createOrUpdateWallet] Wallet saved successfully: ${walletRef.id}`);

    // Create initial transaction if applicable
    if (!walletData.id && initialAmount && initialAmount > 0) {
      logger.info(
        `[createOrUpdateWallet] Creating initial transaction for new wallet: ${walletRef.id}`,
      );
      await createOrUpdateTransaction({
        type: 'income',
        amount: initialAmount,
        date: initialDate || new Date(),
        walletId: walletRef.id,
        description: initialDescription || 'Initial balance',
        category: 'Initial Balance',
        uid,
      });
    }

    return {
      success: true,
      data: { ...walletToSave, id: walletRef.id },
    };
  } catch (error: any) {
    logger.error('[createOrUpdateWallet] Error saving wallet:', {
      error,
      errorMessage: error.message,
    });
    return { success: false, msg: error.message };
  }
};

export const softDeleteWallet = async (
  walletId: string,
): Promise<ResponseType> => {
  const uid = auth.currentUser?.uid;
  logger.info(
    `[softDeleteWallet] User: ${uid} attempting to soft delete wallet: ${walletId}`,
  );

  if (!uid) {
    logger.error('[softDeleteWallet] User not authenticated.');
    return { success: false, msg: 'User not authenticated' };
  }

  try {
    const walletRef = doc(firestore, 'wallets', walletId);
    const walletSnap = await getDoc(walletRef);

    if (!walletSnap.exists() || walletSnap.data()?.uid !== uid) {
      logger.error(
        `[softDeleteWallet] Wallet not found or permission denied for user ${uid}.`,
      );
      return { success: false, msg: 'Wallet not found or permission denied' };
    }

    await setDoc(walletRef, { isDeleted: true }, { merge: true });
    logger.info(`[softDeleteWallet] Wallet soft-deleted: ${walletId}`);

    return {
      success: true,
      msg: 'Wallet moved to trash successfully.',
    };
  } catch (error: any) {
    logger.error('[softDeleteWallet] Error during soft deletion:', {
      error,
      errorMessage: error.message,
      walletId,
    });
    return { success: false, msg: error.message };
  }
};

export const permanentlyDeleteWallet = async (
  walletId: string,
): Promise<ResponseType> => {
  const uid = auth.currentUser?.uid;
  logger.info(
    `[permanentlyDeleteWallet] User: ${uid} attempting permanent delete of wallet: ${walletId}`,
  );

  if (!uid) {
    logger.error('[permanentlyDeleteWallet] User not authenticated.');
    return { success: false, msg: 'User not authenticated' };
  }

  const batch = writeBatch(firestore);

  try {
    const walletRef = doc(firestore, 'wallets', walletId);
    const walletSnap = await getDoc(walletRef);

    if (!walletSnap.exists() || walletSnap.data()?.uid !== uid) {
      logger.error(
        `[permanentlyDeleteWallet] Wallet not found or permission denied for user ${uid}.`,
      );
      return { success: false, msg: 'Wallet not found or permission denied' };
    }

    // Delete all transactions associated with the wallet
    logger.info(
      `[permanentlyDeleteWallet] Deleting transactions for wallet: ${walletId}`,
    );
    const transactionsQuery = query(
      collection(firestore, 'transactions'),
      where('walletId', '==', walletId),
      where('uid', '==', uid),
    );
    const transactionsSnap = await getDocs(transactionsQuery);

    if (!transactionsSnap.empty) {
      transactionsSnap.forEach((doc) => {
        batch.delete(doc.ref);
      });
      logger.info(
        `[permanentlyDeleteWallet] Batched deletion of ${transactionsSnap.size} transactions.`,
      );
    } else {
      logger.info(
        `[permanentlyDeleteWallet] No transactions found for wallet: ${walletId}`,
      );
    }

    // Delete the wallet itself
    batch.delete(walletRef);
    logger.info(
      `[permanentlyDeleteWallet] Batched deletion of wallet: ${walletId}`,
    );

    await batch.commit();
    logger.info(
      `[permanentlyDeleteWallet] Batch commit successful. Wallet and its transactions are permanently deleted.`,
    );

    return {
      success: true,
      msg: 'Wallet and all its transactions permanently deleted.',
    };
  } catch (error: any) {
    logger.error('[permanentlyDeleteWallet] Error during permanent deletion:', {
      error,
      errorMessage: error.message,
      walletId,
    });
    return { success: false, msg: error.message };
  }
};
