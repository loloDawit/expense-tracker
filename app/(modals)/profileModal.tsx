import Header from '@/components/Header';

import BackButton from '@/components/BackButton';
import Button from '@/components/Button';
import Input from '@/components/Input';
import ModalWrapper from '@/components/ModalWrapper';
import Typography from '@/components/Typography';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getUserAvatar } from '@/services/imageServices';
import { updateUser } from '@/services/userService';
import { UserType } from '@/types';
import { scale, verticalScale } from '@/utils/styling';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import * as Icons from 'phosphor-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

const ProfileModal = () => {
  const { colors, spacing } = useTheme();
  let [userData, setUserData] = useState<UserType>({
    displayName: '',
    photoURL: undefined,
  });

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { user, updateUserData } = useAuth();
  const trimmedName = userData.displayName?.trim() ?? '';
  const currentName = user?.displayName?.trim() ?? '';
  const currentPhoto = user?.photoURL;
  const selectedPhoto = userData.photoURL;

  const nameChanged = trimmedName !== currentName;
  const photoChanged =
    selectedPhoto &&
    ((typeof selectedPhoto === 'object' && 'uri' in selectedPhoto) ||
      selectedPhoto !== currentPhoto);

  const isDirty = nameChanged || photoChanged;

  useEffect(() => {
    setUserData({
      displayName: user?.displayName || '',
      photoURL: user?.photoURL || undefined,
    });
  }, [user]);

  const onSubmit = async () => {
    setLoading(true);

    const res = await updateUser(user?.uid as string, {
      ...(nameChanged ? { displayName: trimmedName } : {}),
      ...(photoChanged ? { photoURL: selectedPhoto } : {}),
    });

    setLoading(false);

    if (res.success) {
      updateUserData({ uid: user?.uid });
      router.back();
    } else {
      Alert.alert('Update Failed', res.msg);
    }
  };

  const onPickImage = async () => {
    let result: ImagePicker.ImagePickerResult =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        aspect: [4, 3],
        quality: 0.5,
      });

    if (!result.canceled) {
      const asset = result.assets?.[0];
      if (asset?.uri) {
        setUserData({ ...userData, photoURL: { uri: asset.uri } });
      }
    }
  };

  return (
    <ModalWrapper>
      <View style={[styles.container, { paddingHorizontal: spacing.y._20 }]}>
        <Header
          title={'Update Profile'}
          leftIcon={<BackButton />}
          style={{ marginBottom: spacing.y._10 }}
        />

        <ScrollView
          contentContainerStyle={[
            styles.form,
            {
              gap: spacing.y._30,
              marginTop: spacing.y._15,
            },
          ]}
        >
          <View style={styles.avatarContainer}>
            <Image
              style={[
                styles.avatar,
                {
                  backgroundColor: colors.neutral300,
                  borderColor: colors.neutral500,
                },
              ]}
              source={getUserAvatar(
                typeof userData?.photoURL === 'string'
                  ? userData.photoURL
                  : userData?.photoURL?.uri || null,
              )}
              contentFit="cover"
              transition={100}
            />
            <TouchableOpacity
              style={[
                styles.editIcon,
                {
                  backgroundColor: colors.neutral100,
                  borderRadius: 100,
                  padding: spacing.y._7,
                  shadowColor: colors.black,
                },
              ]}
              onPress={onPickImage}
            >
              <Icons.Pencil
                size={verticalScale(20)}
                color={colors.neutral800}
              />
            </TouchableOpacity>
          </View>

          <View style={[styles.inputContainer, { gap: spacing.y._10 }]}>
            <Typography color={colors.neutral200}>Email</Typography>
            <Input
              placeholder="Email"
              value={user?.email || ''}
              editable={false}
              style={{
                backgroundColor: colors.neutral800,
                color: colors.neutral400,
                textAlign: 'left',
              }}
            />
            <Typography color={colors.neutral200}>Name</Typography>
            <Input
              placeholder="Name"
              value={userData?.displayName || ''}
              onChangeText={(value) =>
                setUserData({ ...userData, displayName: value })
              }
            />
          </View>
        </ScrollView>
      </View>

      <View
        style={[
          styles.footer,
          {
            paddingHorizontal: spacing.x._20,
            paddingTop: spacing.y._15,
            borderTopColor: colors.neutral700,
            marginBottom: spacing.y._5,
            borderTopWidth: 1,
          },
        ]}
      >
        <Button
          onPress={onSubmit}
          style={{ flex: 1 }}
          loading={loading}
          disabled={!isDirty}
        >
          <Typography color={colors.black} fontWeight={'700'} size={18}>
            Update
          </Typography>
        </Button>
      </View>
    </ModalWrapper>
  );
};

export default ProfileModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: scale(12),
  },
  form: {
    // spacing applied inline
  },
  avatarContainer: {
    position: 'relative',
    alignSelf: 'center',
  },
  avatar: {
    alignSelf: 'center',
    height: verticalScale(135),
    width: verticalScale(135),
    borderRadius: 200,
    borderWidth: 1,
  },
  editIcon: {
    position: 'absolute',
    bottom: 0, // theme values now inline
    right: 0,
    elevation: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  inputContainer: {},
});
