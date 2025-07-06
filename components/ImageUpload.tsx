import { useTheme } from '@/contexts/ThemeContext';
import { getFilePath } from '@/services/imageServices';
import { ImageUploadProps } from '@/types';
import { scale, verticalScale } from '@/utils/styling';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as Icons from 'phosphor-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Typography from './Typography';

const ImageUpload = ({
  file = null,
  onSelect,
  onClear,
  containerStyle,
  imageStyle,
  placeholder = '',
}: ImageUploadProps) => {
  const { colors, radius, isDark } = useTheme();

  const pickImage = async () => {
    let result: ImagePicker.ImagePickerResult =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        aspect: [4, 3],
        quality: 0.5,
      });

    if (!result.canceled) {
      onSelect(result.assets?.[0]);
    }
  };

  return (
    <View>
      {!file && (
        <TouchableOpacity
          onPress={pickImage}
          style={[
            {
              height: verticalScale(54),
              backgroundColor: colors.background,
              borderRadius: radius.sm,
              flexDirection: 'row',
              gap: 10,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.border,
              borderStyle: 'dashed',
            },
            containerStyle,
          ]}
        >
          <Icons.UploadSimple color={colors.textSecondary} />
          {placeholder && <Typography size={15} color={colors.textSecondary}>{placeholder}</Typography>}
        </TouchableOpacity>
      )}

      {file && (
        <View
          style={[
            {
              height: scale(150),
              width: scale(150),
              borderRadius: radius.sm,
              borderCurve: 'continuous',
              overflow: 'hidden',
            },
            imageStyle,
          ]}
        >
          <Image
            style={{ flex: 1 }}
            source={getFilePath(file)}
            contentFit="cover"
            transition={100}
          />
          <TouchableOpacity
            onPress={onClear}
            style={{
              position: 'absolute',
              top: scale(6),
              right: scale(6),
              shadowColor: isDark ? colors.white : colors.black,
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 1,
              shadowRadius: 10,
            }}
          >
            <Icons.XCircle
              color={colors.text}
              size={verticalScale(24)}
              weight="fill"
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default ImageUpload;
