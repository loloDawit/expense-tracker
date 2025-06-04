import { firestore } from '@/config/firebase';
import { ResponseType, WalletType } from '@/types';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { getCloudinaryPath, uploadFileToCloudinary } from './imageServices';

export const createOrUpdateWallet = async (
  walletData: Partial<WalletType>,
): Promise<ResponseType> => {
  try {
    // upload image

    let walletToSave = { ...walletData };
    const folderPath = getCloudinaryPath('wallets');
    if (walletData.image) {
      const imageUploadResponse = await uploadFileToCloudinary(
        walletData.image,
        folderPath,
      );

      if (!imageUploadResponse.success) {
        return {
          success: false,
          msg: imageUploadResponse.msg || 'Failed to upload image',
        };
      }

      walletToSave.image = imageUploadResponse.data;
    }

    if (!walletData.id) {
      walletToSave.amount = 0;
      walletToSave.totalIncome = 0;
      walletToSave.totalExpenses = 0;
      walletToSave.created = new Date();
    }

    const walletRef = walletData.id
      ? doc(firestore, 'wallets', walletData.id)
      : doc(collection(firestore, 'wallets'));

    await setDoc(walletRef, walletToSave, { merge: true }); // merge: true updates only the data provided

    return {
      success: true,
      data: { ...walletToSave, id: walletRef.id },
    };
  } catch (error: any) {
    console.error('Error creating or updating wallet:', error);
    return {
      success: false,
      msg: error.message,
    };
  }
};

export const deleteWallet = async (walletId: string): Promise<ResponseType> => {
  try {
    const walletRef = doc(firestore, 'wallets', walletId);

    await deleteDoc(walletRef);

    // implement later, when we are able to create transactions
    deleteTransactionsByWalletId(walletId);

    return {
      success: true,
      msg: 'Wallet deleted successfully',
    };
  } catch (error: any) {
    console.error('Error deleting wallet:', error);
    return {
      success: false,
      msg: error.message,
    };
  }
};

export const deleteTransactionsByWalletId = async (
  walletId: string,
): Promise<ResponseType> => {
  try {
    let hasMoreTransactions = true;

    while (hasMoreTransactions) {
      // Query to fetch transactions based on walletId
      const transactionsQuery = query(
        collection(firestore, 'transactions'),
        where('walletId', '==', walletId),
      );

      // Fetch the transactions
      const transactionsSnapshot = await getDocs(transactionsQuery);

      if (transactionsSnapshot.size === 0) {
        hasMoreTransactions = false; // No more transactions to delete
        break;
      }

      // Start a batch for deleting the transactions
      const batch = writeBatch(firestore);

      // Add each transaction to the batch deletion
      transactionsSnapshot.forEach((transactionDoc) => {
        batch.delete(transactionDoc.ref);
      });

      // Commit the batch
      await batch.commit();

      console.log(
        `${transactionsSnapshot.size} transactions deleted in this batch`,
      );
    }

    return {
      success: true,
      msg: 'All transactions deleted successfully',
    };
  } catch (error: any) {
    console.error('Error deleting transactions:', error);
    return {
      success: false,
      msg: error.message,
    };
  }
};
