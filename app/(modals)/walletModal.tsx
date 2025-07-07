import BackButton from '@/components/BackButton';
import Button from '@/components/Button';
import DatePickerInput from '@/components/DatePickerInput';
import Header from '@/components/Header';
import ImageUpload from '@/components/ImageUpload';
import Input from '@/components/Input';
import ModalWrapper from '@/components/ModalWrapper';
import Typography from '@/components/Typography';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { createOrUpdateWallet, softDeleteWallet } from '@/services/walletService';
import { WalletType } from '@/types';
import { formatAmount } from '@/utils/helper';
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

  const [initialAmount, setInitialAmount] = useState<string>('0');
  const [displayInitialAmount, setDisplayInitialAmount] = useState<string>(
    formatAmount(0),
  );
  const [initialDate, setInitialDate] = useState<Date>(new Date());
  const [initialDescription, setInitialDescription] = useState<string>('');

  const oldWallet: { name: string; image: string; id?: string } =
    useLocalSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (oldWallet?.id) {
      setWallet({
        name: oldWallet.name,
        image: oldWallet?.image || null,
      });
    }
  }, [oldWallet?.id, oldWallet?.image, oldWallet.name]);

  useEffect(() => {
    if (!oldWallet?.id) {
      const parsed = parseFloat(initialAmount);
      setDisplayInitialAmount(formatAmount(isNaN(parsed) ? 0 : parsed));
    }
  }, [initialAmount, oldWallet?.id]);

  const onSelectImage = (file: any) => {
    if (file) setWallet({ ...wallet, image: file });
  };

  const onSubmit = async () => {
    const { name, image } = wallet;

    if (loading) return;

    if (!name.trim() || !image) {
      Alert.alert('Wallet', 'Please fill all the fields!');
      return;
    }

    if (
      !oldWallet.id &&
      initialAmount.trim() !== '' &&
      isNaN(Number(initialAmount))
    ) {
      Alert.alert('Wallet', 'Initial amount must be a valid number.');
      return;
    }

    setLoading(true);

    let data: WalletType = {
      name,
      image,
      uid: user?.uid,
    };
    if (oldWallet.id) data.id = oldWallet.id;

    const res = await createOrUpdateWallet(
      data,
      oldWallet.id ? undefined : Number(initialAmount) || 0,
      oldWallet.id ? undefined : initialDate,
      oldWallet.id ? undefined : initialDescription.trim() || undefined,
    );

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
    const res = await softDeleteWallet(oldWallet.id as string);
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
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: onDelete, style: 'destructive' },
      ],
    );
  };

  return (
    <ModalWrapper>
      <View style={[styles.container, { paddingHorizontal: spacing.y._20 }]}>
        <Header
          title={oldWallet?.id ? 'Update Wallet' : 'New Wallet'}
          leftIcon={<BackButton />}
          style={{ marginBottom: spacing.y._10 }}
        />
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
            <Typography color={colors.textSecondary}>Wallet Name</Typography>
            <Input
              placeholder="Salary"
              value={wallet.name}
              onChangeText={(value) => setWallet({ ...wallet, name: value })}
            />
          </View>

          <View style={styles.inputContainer}>
            <Typography color={colors.textSecondary}>Wallet Icon</Typography>
            <ImageUpload
              file={wallet.image}
              onSelect={onSelectImage}
              onClear={() => setWallet({ ...wallet, image: null })}
              placeholder="Upload Image"
            />
          </View>

          {!oldWallet?.id && (
            <>
              <View style={[styles.inputContainer, { gap: spacing.y._10 }]}>
                <Typography color={colors.textSecondary}>
                  Initial Amount
                </Typography>
                <Input
                  keyboardType="numeric"
                  placeholder="0.00"
                  value={displayInitialAmount}
                  onChangeText={(value) => setDisplayInitialAmount(value)}
                  onFocus={() => setDisplayInitialAmount(initialAmount)}
                  onBlur={() => {
                    const raw = displayInitialAmount.replace(/[^0-9.]/g, '');
                    const parsed = parseFloat(raw);
                    const valid = !isNaN(parsed) ? parsed.toFixed(2) : '0';
                    setInitialAmount(valid);
                    setDisplayInitialAmount(formatAmount(Number(valid)));
                  }}
                />
              </View>

              <View style={[styles.inputContainer, { gap: spacing.y._10 }]}>
                <Typography color={colors.textSecondary}>
                  Initial Date
                </Typography>
                <DatePickerInput
                  date={initialDate}
                  onDateChange={setInitialDate}
                />
              </View>

              <View style={[styles.inputContainer, { gap: spacing.y._10 }]}>
                <Typography color={colors.textSecondary}>
                  Description (optional)
                </Typography>
                <Input
                  placeholder="e.g., Starting balance, Gift from family"
                  value={initialDescription}
                  onChangeText={setInitialDescription}
                  multiline
                  numberOfLines={3}
                  containerStyle={{
                    height: verticalScale(80),
                  }}
                />
              </View>
            </>
          )}
        </ScrollView>
      </View>

      <View
        style={[
          styles.footer,
          {
            paddingHorizontal: spacing.x._20,
            paddingTop: spacing.y._15,
            borderTopColor: colors.border,
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
              color={colors.text}
              size={verticalScale(24)}
              weight="bold"
            />
          </Button>
        )}
        <Button onPress={onSubmit} loading={loading} style={{ flex: 1 }}>
          <Typography color={colors.white} fontWeight="700" size={18}>
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
