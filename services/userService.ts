
import { auth, firestore } from '@/config/firebase';
import { ResponseType, UserType } from '@/types';
import logger from '@/utils/logger';
import { FirebaseError } from 'firebase/app';
import { sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';

import { getCloudinaryPath, uploadFileToCloudinary } from './imageServices';

export const updateUser = async (
  uid: string,
  updatedData: Partial<UserType>,
): Promise<ResponseType> => {
  logger.info(`[updateUser] Starting update for user: ${uid}`, {
    keys: Object.keys(updatedData),
  });

  try {
    let dataToUpdate = { ...updatedData };

    // Upload new image if it's a local file URI
    if (
      dataToUpdate.photoURL &&
      typeof dataToUpdate.photoURL === 'string' &&
      dataToUpdate.photoURL.startsWith('file://')
    ) {
      logger.info('[updateUser] New profile image detected, starting upload.');
      const folderPath = getCloudinaryPath('profile', uid);
      const uploadResult = await uploadFileToCloudinary(
        dataToUpdate.photoURL,
        folderPath,
      );

      if (!uploadResult.success) {
        logger.error('[updateUser] Image upload failed.', {
          msg: uploadResult.msg,
        });
        return {
          success: false,
          msg: uploadResult.msg || 'Failed to upload profile image',
        };
      }
      dataToUpdate.photoURL = uploadResult.data;
      logger.info('[updateUser] Profile image uploaded successfully.');
    }

    // Filter out undefined values to avoid Firestore errors
    const filteredData = Object.fromEntries(
      Object.entries(dataToUpdate).filter(([, value]) => value !== undefined),
    );

    if (Object.keys(filteredData).length === 0) {
      logger.warn('[updateUser] No valid data provided for update.');
      return { success: true, msg: 'No changes to apply.' };
    }

    // Add timestamp and update Firestore
    const userRef = doc(firestore, 'users', uid);
    await updateDoc(userRef, {
      ...filteredData,
      updatedAt: Timestamp.now(),
    });

    logger.info(`[updateUser] User profile updated successfully for uid: ${uid}`);
    return { success: true, msg: 'Profile updated successfully' };
  } catch (error: any) {
    logger.error('[updateUser] Error updating user profile:', {
      error,
      errorMessage: error.message,
      uid,
    });
    return {
      success: false,
      msg: error.message || 'An unknown error occurred while updating.',
    };
  }
};

export const resetPassword = async (email: string): Promise<ResponseType> => {
  const normalizedEmail = email.trim().toLowerCase();
  logger.info(`[resetPassword] Requesting password reset for: ${normalizedEmail}`);

  try {
    await sendPasswordResetEmail(auth, normalizedEmail);
    logger.info(`[resetPassword] Password reset email sent to: ${normalizedEmail}`);
    return {
      success: true,
      msg: 'Password reset email sent successfully. Please check your inbox.',
    };
  } catch (error: any) {
    const fbError = error as FirebaseError;
    let msg = 'An unknown error occurred. Please try again.';

    switch (fbError.code) {
      case 'auth/user-not-found':
        msg = 'No account is associated with this email address.';
        break;
      case 'auth/invalid-email':
        msg = 'The email address is not valid.';
        break;
      case 'auth/too-many-requests':
        msg = 'Too many requests. Please wait a moment and try again.';
        break;
      default:
        logger.error('[resetPassword] Unhandled Firebase error:', {
          errorCode: fbError.code,
          errorMessage: fbError.message,
        });
    }

    logger.warn(`[resetPassword] Failed to send password reset email: ${fbError.code}`);
    return { success: false, msg };
  }
};

export const saveExpoPushToken = async (
  uid: string,
  token: string | null,
): Promise<void> => {
  logger.info(`[saveExpoPushToken] Saving token for user: ${uid}`, {
    hasToken: !!token,
  });
  try {
    const ref = doc(firestore, 'users', uid);
    await setDoc(
      ref,
      {
        expoPushToken: token,
        updatedAt: Timestamp.now(),
      },
      { merge: true },
    );
    logger.info(`[saveExpoPushToken] Token saved successfully for user: ${uid}`);
  } catch (error: any) {
    logger.error('[saveExpoPushToken] Error saving Expo push token:', {
      error,
      errorMessage: error.message,
      uid,
    });
  }
};
