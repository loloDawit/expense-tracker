import BackButton from '@/components/BackButton';
import Button from '@/components/Button';
import Header from '@/components/Header';
import ImageUpload from '@/components/ImageUpload';
import Input from '@/components/Input';
import ModalWrapper from '@/components/ModalWrapper';
import Typography from '@/components/Typography';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { createOrUpdateWallet, deleteWallet } from '@/services/walletService';
import { WalletType } from '@/types';
import { scale, verticalScale } from '@/utils/styling';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Icons from 'phosphor-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

const WalletModal = () => {
  const { colors, spacing } = useTheme();
  const [wallet, setWallet] = useState<WalletType>({
    name: '',
    image: null,
  });
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const oldWallet: { name: string; image: string; id?: string } =
    useLocalSearchParams();

  useEffect(() => {
    if (oldWallet?.id) {
      setWallet({
        name: oldWallet.name,
        image: oldWallet?.image || null,
      });
    }
  }, [oldWallet?.id, oldWallet?.image, oldWallet.name]);

  const onSelectImage = (file: any) => {
    if (file) setWallet({ ...wallet, image: file });
  };

  const onSubmit = async () => {
    let { name, image } = wallet;

    if (loading) return;
    if (!name.trim() || !image) {
      Alert.alert('Wallet', 'Please fill all the fields!');
      return;
    }

    setLoading(true);
    let data: WalletType = {
      name,
      image,
      uid: user?.uid,
    };
    if (oldWallet.id) data.id = oldWallet.id;

    const res = await createOrUpdateWallet(data);
    setLoading(false);
    if (res.success) {
      router.back();
    } else {
      Alert.alert('Wallet', res.msg);
    }
  };

  const onDelete = async () => {
    if (!oldWallet?.id) return;
    setLoading(true);
    const res = await deleteWallet(oldWallet.id as string);
    setLoading(false);

    if (res.success) {
      router.back();
    } else {
      Alert.alert('Wallet', res.msg);
    }
  };

  const showDeleteAlert = () => {
    Alert.alert(
      'Confirm',
      'Are you sure you want to do this?\nThis will remove all the transactions related to this wallet!',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel delete'),
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => onDelete(),
          style: 'destructive',
        },
      ],
    );
  };

  console.log('[WalletModal] oldWallet:', oldWallet.id);

  return (
    <ModalWrapper>
      <View style={[styles.container, { paddingHorizontal: spacing.y._20 }]}>
        <Header
          title={oldWallet?.id ? 'Updated Wallet' : 'New Wallet'}
          leftIcon={<BackButton />}
          style={{ marginBottom: spacing.y._10 }}
        />
        {/* form */}
        <ScrollView
          contentContainerStyle={[
            styles.form,
            {
              gap: spacing.y._20,
              paddingVertical: spacing.y._15,
              paddingBottom: spacing.y._40,
            },
          ]}
        >
          <View style={[styles.inputContainer, { gap: spacing.y._10 }]}>
            <Typography color={colors.neutral200}>Wallet Name</Typography>
            <Input
              placeholder="Salary"
              value={wallet.name}
              onChangeText={(value) => setWallet({ ...wallet, name: value })}
            />
          </View>
          <View style={styles.inputContainer}>
            <Typography color={colors.neutral200}>Wallet Icon</Typography>
            <ImageUpload
              file={wallet.image}
              onSelect={onSelectImage}
              onClear={() => setWallet({ ...wallet, image: null })}
              placeholder="Upload Image"
            />
          </View>
        </ScrollView>
      </View>

      {/* footer */}
      <View
        style={[
          styles.footer,
          {
            paddingHorizontal: spacing.x._20,
            paddingTop: spacing.y._15,
            borderTopColor: colors.neutral700,
            marginBottom: spacing.y._5,
          },
        ]}
      >
        {oldWallet?.id && !loading && (
          <Button
            style={{
              backgroundColor: colors.rose,
              paddingHorizontal: spacing.x._15,
            }}
            onPress={showDeleteAlert}
          >
            <Icons.Trash
              color={colors.white}
              size={verticalScale(24)}
              weight="bold"
            />
          </Button>
        )}
        <Button onPress={onSubmit} loading={loading} style={{ flex: 1 }}>
          <Typography color={colors.black} fontWeight={'700'} size={18}>
            {oldWallet?.id ? 'Update Wallet' : 'Add Wallet'}
          </Typography>
        </Button>
      </View>
    </ModalWrapper>
  );
};

export default WalletModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: scale(12),
    borderTopWidth: 1,
  },
  form: {},
  inputContainer: {},
});
