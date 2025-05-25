import { firestore } from '@/config/firebase';
import { ResponseType, UserType } from '@/types';
import { doc, updateDoc } from 'firebase/firestore';
import { uploadFileToCloudinary } from './imageServices';

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

    const folderPath = `expense-tracker-app/users/${uid}`;

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
