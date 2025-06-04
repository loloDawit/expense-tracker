import ScreenWrapper from '@/components/ScreenWrapper';
import React from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

import Loading from '@/components/Loading';
import Typography from '@/components/Typography';
import WalletListItem from '@/components/WalletListItem';
import { theme } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import useFetchData from '@/hooks/useFetchData';
import { WalletType } from '@/types';
import { formatAmount } from '@/utils/helper';
import { verticalScale } from '@/utils/styling';
import { useRouter } from 'expo-router';
import { orderBy, where } from 'firebase/firestore';
import * as Icons from 'phosphor-react-native';
const Wallet = () => {
  const router = useRouter();
  const { user } = useAuth();
  const {
    data: wallets,
    loading,
    error,
  } = useFetchData<WalletType>('wallets', [
    where('uid', '==', user?.uid),
    orderBy('created', 'desc'),
  ]);

  const getTotalBalance = () =>
    wallets.reduce((total, item) => {
      total = total + (item?.amount || 0);
      return total;
    }, 0);

  return (
    <ScreenWrapper style={{ backgroundColor: theme.colors.black }}>
      <View style={styles.container}>
        {/* balance view */}
        <View style={styles.balanceView}>
          <View style={{ alignItems: 'center' }}>
            <Typography
              size={45}
              fontWeight={'500'}
              style={{
                fontFamily: 'Manrope-Regular',
                fontVariant: ['tabular-nums'],
              }}
            >
              {formatAmount(getTotalBalance())}
            </Typography>
            <Typography size={16} color={theme.colors.neutral300}>
              Total Income
            </Typography>
          </View>
        </View>

        {/* wallets */}
        <View style={styles.wallets}>
          {/* header */}
          <View style={styles.flexRow}>
            <Typography size={20} fontWeight={'500'}>
              Income Streams
            </Typography>
            <TouchableOpacity
              onPress={() => router.push('/(modals)/walletModal')}
            >
              <Icons.PlusCircle
                weight="fill"
                color={theme.colors.primary}
                size={verticalScale(33)}
              />
            </TouchableOpacity>
          </View>
          <Typography
            size={theme.fontSize.base}
            fontWeight="200"
            color={theme.colors.neutral400}
          >
            Track where your money is coming from
          </Typography>
          {/* wallets data */}
          {loading && <Loading />}
          <FlatList
            data={wallets}
            renderItem={({ item, index }) => (
              <WalletListItem item={item} router={router} index={index} />
            )}
            contentContainerStyle={styles.listStyle}
            // keyExtractor={(item) => item.id}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Wallet;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  balanceView: {
    height: verticalScale(160),
    backgroundColor: theme.colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flexRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.y._10,
  },
  wallets: {
    flex: 1,
    backgroundColor: theme.colors.neutral900,
    borderTopRightRadius: theme.radius.md,

    borderTopLeftRadius: theme.radius.md,
    padding: theme.spacing.x._20,
    paddingTop: theme.spacing.x._25,
  },
  listStyle: {
    paddingVertical: theme.spacing.y._25,
    paddingTop: theme.spacing.y._15,
  },
});
