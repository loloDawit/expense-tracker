import { auth, firestore } from '@/config/firebase';
import { ResponseType, UserType } from '@/types';
import { FirebaseError } from 'firebase/app';
import { sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { getCloudinaryPath, uploadFileToCloudinary } from './imageServices';

export const updateUser = async (
  uid: string,
  updatedData: UserType,
): Promise<ResponseType> => {
  try {
    // Upload new image if necessary
    const isLocalImage =
      updatedData?.photoURL &&
      typeof updatedData.photoURL !== 'string' &&
      'uri' in updatedData.photoURL;

    const folderPath = getCloudinaryPath('profile', uid);

    if (isLocalImage) {
      const uploadResult = await uploadFileToCloudinary(
        updatedData.photoURL ?? '',
        folderPath,
      );

      if (!uploadResult.success) {
        return {
          success: false,
          msg: uploadResult.msg || 'Failed to upload image',
        };
      }

      updatedData.photoURL = uploadResult.data;
    }

    // Filter out undefined/null values
    const filteredData = Object.fromEntries(
      Object.entries(updatedData).filter(
        ([_, value]) => value !== null && value !== undefined,
      ),
    );

    // Update Firestore
    const userRef = doc(firestore, 'users', uid);
    await updateDoc(userRef, filteredData);

    return {
      success: true,
      msg: 'Updated successfully',
    };
  } catch (error: any) {
    console.error('Error updating user:', error);
    return {
      success: false,
      msg: error.message || 'An unknown error occurred',
    };
  }
};

export const resetPassword = async (email: string): Promise<ResponseType> => {
  const normalizedEmail = email.trim().toLowerCase();

  try {
    await sendPasswordResetEmail(auth, normalizedEmail);
    return {
      success: true,
      msg: 'Password reset email sent successfully.',
    };
  } catch (error: any) {
    const fbError = error as FirebaseError;
    let msg = 'An unknown error occurred';

    switch (fbError.code) {
      case 'auth/user-not-found':
        msg = 'No account found with this email.';
        break;
      case 'auth/invalid-email':
        msg = 'Invalid email address.';
        break;
      case 'auth/too-many-requests':
        msg = 'Too many requests. Please try again later.';
        break;
    }

    console.error('Error sending password reset email:', fbError);

    return {
      success: false,
      msg,
    };
  }
};

export const saveExpoPushToken = async (uid: string, token: string) => {
  const ref = doc(firestore, 'users', uid);

  await setDoc(
    ref,
    {
      expoPushToken: token,
      updatedAt: Date.now(),
    },
    { merge: true }
  );
};