import ScreenWrapper from '@/components/ScreenWrapper';
import React, { useMemo } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

import Loading from '@/components/Loading';
import Typography from '@/components/Typography';
import WalletListItem from '@/components/WalletListItem';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import useFetchData from '@/hooks/useFetchData';
import { WalletType } from '@/types';
import { formatAmount } from '@/utils/helper';
import { verticalScale } from '@/utils/styling';
import { useRouter } from 'expo-router';
import { orderBy, where } from 'firebase/firestore';
import * as Icons from 'phosphor-react-native';
const Wallet = () => {
  const { colors, fontSize, radius, spacing } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const walletConstraints = useMemo(() => {
    if (!user?.uid) return [];
    return [orderBy('created', 'desc')];
  }, [user?.uid]);

  const {
    data: wallets,
    loading,
  } = useFetchData<WalletType>('wallets', walletConstraints);

  const getTotalBalance = () =>
    wallets.reduce((total, item) => {
      total = total + (item?.amount || 0);
      return total;
    }, 0);

  console.log({ wallets });

  return (
    <ScreenWrapper style={{ backgroundColor: colors.background }}>
      <View style={styles.container}>
        {/* balance view */}
        <View style={[styles.balanceView, { backgroundColor: colors.background }]}>
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
            <Typography size={16} color={colors.textSecondary}>
              Total Income
            </Typography>
          </View>
        </View>

        {/* wallets */}
        <View
          style={[
            styles.wallets,
            {
              backgroundColor: colors.card,
              borderTopRightRadius: radius.md,
              borderTopLeftRadius: radius.md,
              padding: spacing.x._20,
              paddingTop: spacing.x._25,
            },
          ]}
        >
          {/* header */}
          <View style={[styles.flexRow, { marginBottom: spacing.y._10 }]}>
            <Typography size={20} fontWeight={'500'}>
              Income Streams
            </Typography>
            <TouchableOpacity
              onPress={() => router.push('/(modals)/walletModal')}
            >
              <Icons.PlusCircle
                weight="fill"
                color={colors.primary}
                size={verticalScale(33)}
              />
            </TouchableOpacity>
          </View>
          <Typography
            size={fontSize.base}
            fontWeight="200"
            color={colors.textSecondary}
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
            contentContainerStyle={[
              styles.listStyle,
              { paddingVertical: spacing.y._25, paddingTop: spacing.y._15 },
            ]}
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  flexRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wallets: {
    flex: 1,
  },
  listStyle: {},
});
