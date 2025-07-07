import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import * as Icons from 'phosphor-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { Controller } from 'react-hook-form';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from 'react-native';

import BackButton from '@/components/BackButton';
import Button from '@/components/Button';
import Header from '@/components/Header';
import Input from '@/components/Input';
import ModalWrapper from '@/components/ModalWrapper';
import Typography from '@/components/Typography';

import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { ProfileFormType, useProfileForm } from '@/hooks/useProfileForm';
import { getUserAvatar } from '@/services/imageServices';
import { updateUser } from '@/services/userService';
import { UserType } from '@/types';
import { authenticateBiometric } from '@/utils/auth';
import { scale, verticalScale } from '@/utils/styling';

const ProfileModal = () => {
  const { colors, spacing, isDark } = useTheme();
  const { user, updateUserData } = useAuth();
  const router = useRouter();

  const [userData, setUserData] = useState<UserType>({
    displayName: '',
    photoURL: undefined,
  });
  const [loading, setLoading] = useState(false);

  const currentName = user?.displayName?.trim() ?? '';
  const currentPhoto = user?.photoURL;

  const {
    control,
    handleSubmit,
    watch,
    formState: { isDirty },
  } = useProfileForm({
    displayName: user?.displayName || '',
    changePassword: false,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const watchedDisplayName = watch('displayName');
  const watchedPhoto = userData.photoURL;
  const watchedChangePassword = watch('changePassword');

  const nameChanged = (watchedDisplayName ?? '').trim() !== currentName;

  const photoChanged = useMemo(() => {
    if (!watchedPhoto) return false;
    if (typeof watchedPhoto === 'object' && 'uri' in watchedPhoto)
      return watchedPhoto.uri !== currentPhoto;
    return watchedPhoto !== currentPhoto;
  }, [watchedPhoto, currentPhoto]);

  useEffect(() => {
    setUserData({
      displayName: user?.displayName || '',
      photoURL: user?.photoURL || undefined,
    });
  }, [user]);

  const onSubmit = async (form: ProfileFormType) => {
    setLoading(true);

    const payload: any = {
      ...(nameChanged && { displayName: form.displayName.trim() }),
      ...(photoChanged && { photoURL: watchedPhoto }),
    };

    if (form.changePassword) {
      payload.currentPassword = form.currentPassword?.trim();
      payload.newPassword = form.newPassword?.trim();
    }

    const res = await updateUser(user?.uid as string, payload);

    setLoading(false);

    if (res.success) {
      updateUserData({ uid: user?.uid });
      router.back();
    } else {
      Alert.alert('Update Failed', res.msg);
    }
  };

  const onPickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setUserData((prev) => ({
        ...prev,
        photoURL: { uri: result.assets[0].uri },
      }));
    }
  };

  const renderAvatar = () => (
    <View style={styles.avatarContainer}>
      <Image
        style={[
          styles.avatar,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
        source={getUserAvatar(
          typeof userData.photoURL === 'string'
            ? userData.photoURL
            : userData.photoURL?.uri || null,
        )}
        contentFit="cover"
        transition={100}
      />
      <TouchableOpacity
        style={[
          styles.editIcon,
          {
            backgroundColor: colors.primary,
            padding: spacing.y._7,
            borderRadius: 100,
            shadowColor: isDark ? colors.white : colors.black,
          },
        ]}
        onPress={onPickImage}
      >
        <Icons.Pencil size={verticalScale(20)} color={colors.text} />
      </TouchableOpacity>
    </View>
  );

  return (
    <ModalWrapper>
      <View style={[styles.container, { paddingHorizontal: spacing.y._20 }]}>
        <Header
          title="Update Profile"
          leftIcon={<BackButton />}
          style={{ marginBottom: spacing.y._10 }}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.form,
            { gap: spacing.y._30, marginTop: spacing.y._15 },
          ]}
        >
          {renderAvatar()}

          <View style={[styles.inputContainer, { gap: spacing.y._10 }]}>
            <Typography color={colors.text}>Email</Typography>
            <Input
              placeholder="Email"
              value={user?.email || ''}
              editable={false}
              style={{
                backgroundColor: colors.card,
                color: colors.textSecondary,
                textAlign: 'left',
              }}
            />

            <Typography color={colors.text}>Name</Typography>
            <Controller
              control={control}
              name="displayName"
              render={({ field: { value, onChange, onBlur }, fieldState }) => (
                <Input
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Name"
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            {/* Password toggle */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.x._10,
                marginTop: spacing.y._10,
              }}
            >
              <Typography color={colors.text}>Change Password</Typography>
              <Controller
                control={control}
                name="changePassword"
                render={({ field }) => (
                  <Switch
                    value={field.value}
                    onValueChange={async (val) => {
                      if (val) {
                        const confirmed = await authenticateBiometric({
                          reason: 'Confirm your identity to change password',
                        });

                        if (!confirmed) {
                          Alert.alert(
                            'Authentication Failed',
                            'Face ID or passcode is required to enable password change.',
                          );
                          return;
                        }
                      }

                      field.onChange(val);
                    }}
                    trackColor={{
                      false: colors.neutral400,
                      true: colors.primary,
                    }}
                    thumbColor={colors.white}
                  />
                )}
              />
            </View>

            {watchedChangePassword && (
              <>
                <Typography color={colors.text}>Current Password</Typography>
                <Controller
                  control={control}
                  name="currentPassword"
                  render={({ field, fieldState }) => (
                    <Input
                      {...field}
                      placeholder="Current Password"
                      secureTextEntry
                      error={!!fieldState.error}
                      errorMessage={fieldState.error?.message}
                    />
                  )}
                />

                <Typography color={colors.text}>New Password</Typography>
                <Controller
                  control={control}
                  name="newPassword"
                  render={({ field, fieldState }) => (
                    <Input
                      {...field}
                      placeholder="New Password"
                      secureTextEntry
                      error={!!fieldState.error}
                      errorMessage={fieldState.error?.message}
                    />
                  )}
                />

                <Typography color={colors.text}>Confirm Password</Typography>
                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({ field, fieldState }) => (
                    <Input
                      {...field}
                      placeholder="Confirm Password"
                      secureTextEntry
                      error={!!fieldState.error}
                      errorMessage={fieldState.error?.message}
                    />
                  )}
                />
              </>
            )}
          </View>
        </ScrollView>
      </View>

      <View
        style={[
          styles.footer,
          {
            paddingHorizontal: spacing.x._20,
            paddingTop: spacing.y._15,
            marginBottom: spacing.y._5,
          },
        ]}
      >
        <Button
          onPress={handleSubmit(onSubmit)}
          style={{ flex: 1, backgroundColor: colors.primary }}
          loading={loading}
          disabled={!isDirty && !photoChanged}
        >
          <Typography color={colors.white} fontWeight="700" size={18}>
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
  form: {},
  inputContainer: {},
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
    bottom: 0,
    right: 0,
    elevation: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: scale(12),
  },
});
