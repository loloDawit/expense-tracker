import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '@/constants';
import { ResponseType } from '@/types';
import axios from 'axios';
import { ImageSourcePropType } from 'react-native';

export const getUserAvatar = (file?: string | null): ImageSourcePropType => {
  return file ? { uri: file } : require('@/assets/images/defaultAvatar.png');
};

const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export const uploadFileToCloudinary = async (
  file: { uri?: string } | string,
  folderName: string,
): Promise<ResponseType> => {
  try {
    // Prepare the file data
    if (typeof file === 'string') {
      return {
        success: true,
        data: file,
      };
    }

    if (file && file.uri) {
      const formData = new FormData();
      formData.append('file', {
        uri: file?.uri,
        type: 'image/jpeg',
        name: file?.uri?.split('/').pop() || 'file.jpg',
      } as any);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('folder', folderName);

      const response = await axios.post(CLOUDINARY_UPLOAD_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Return the success response
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
      msg: error?.message || 'Could not uplaod media',
    };
  }
};
