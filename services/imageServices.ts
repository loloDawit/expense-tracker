import { auth } from '@/config/firebase';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '@/constants';
import { ResponseType } from '@/types';
import axios from 'axios';
import { ImageSourcePropType } from 'react-native';

export const getUserAvatar = (file?: string | null): ImageSourcePropType => {
  return file ? { uri: file } : require('@/assets/images/defaultAvatar.png');
};

/**
 * getCloudinaryPath
 * @param folderType
 * @param uidOverride
 * @returns
 */
export const getCloudinaryPath = (
  folderType: 'profile' | 'wallets' | 'transactions',
  uidOverride?: string,
): string => {
  const uid = uidOverride || auth.currentUser?.uid;

  if (!uid) {
    throw new Error('User ID is required for Cloudinary path resolution.');
  }

  return `expense-tracker-app/users/${uid}/${folderType}`;
};

const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export const uploadFileToCloudinary = async (
  file: { uri?: string } | string,
  folderName: string,
  publicId?: string,
): Promise<ResponseType> => {
  try {
    if (typeof file === 'string') {
      return {
        success: true,
        data: file,
      };
    }

    if (file && file.uri) {
      const formData = new FormData();

      formData.append('file', {
        uri: file.uri,
        type: 'image/jpeg',
        name: file.uri.split('/').pop() || 'upload.jpg',
      } as any);

      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('folder', folderName);

      // ✅ Add timestamp-based publicId if not explicitly passed
      const finalPublicId = publicId || `img_${Date.now()}`;
      formData.append('public_id', finalPublicId);

      const response = await axios.post(CLOUDINARY_UPLOAD_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        success: true,
        data: response.data.secure_url,
      };
    } else {
      return { success: false, msg: 'Invalid file' };
    }
  } catch (error: any) {
    console.error('Error during file upload:', error);
    return {
      success: false,
      msg: error?.message || 'Could not upload media',
    };
  }
};

export const getFilePath = (file: any) => {
  if (file && typeof file == 'string') return file;
  if (file && typeof file == 'object' && file.uri) return file.uri;
};
