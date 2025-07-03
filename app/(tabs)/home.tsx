import ScreenWrapper from '@/components/ScreenWrapper';
import React, { useCallback, useMemo, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';

import Button from '@/components/Button';
import HomeCard from '@/components/HomeCard';
import TransactionList from '@/components/TransactionList';
import Typography from '@/components/Typography';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import useFetchData from '@/hooks/useFetchData';
import { TransactionType } from '@/types';
import { verticalScale } from '@/utils/styling';
import { useRouter } from 'expo-router';
import { limit, orderBy, where } from 'firebase/firestore';
import * as Icons from 'phosphor-react-native';

const Home = () => {
  const { colors, spacing } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const capitalizedName = user?.displayName
    ? user.displayName.charAt(0).toUpperCase() + user.displayName.slice(1)
    : '';

  const constraints = useMemo(() => {
    if (!user?.uid) return [];
    return [where('uid', '==', user.uid), orderBy('date', 'desc'), limit(30)];
  }, [user?.uid]);

  const {
    data: recentTransactions,
    loading: transactionsLoading,
    refetch,
  } = useFetchData<TransactionType>('transactions', constraints);
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);
  console.log('[Home] constraints:', constraints);
  console.log('[Home] handleRefresh:', handleRefresh);
  return (
    <ScreenWrapper refreshing={refreshing} onRefresh={handleRefresh} scrollable>
      <View
        style={{
          flex: 1,
          paddingHorizontal: spacing.x._20,
          marginTop: verticalScale(8),
          gap: spacing.x._25,
        }}
      >
        {/* header */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing.x._10,
          }}
        >
          <View style={{ gap: 4 }}>
            <Typography size={16} color={colors.text}>
              Hello,
            </Typography>
            <Typography fontWeight={'500'} size={20}>
              {capitalizedName}
            </Typography>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(modals)/searchModal')}
            style={{
              backgroundColor: colors.neutral700,
              padding: spacing.x._10,
              borderRadius: 50,
            }}
          >
            <Icons.MagnifyingGlass
              size={verticalScale(22)}
              color={colors.neutral200}
              weight="bold"
            />
          </TouchableOpacity>
        </View>

        {/* main content */}
        <HomeCard />
        <TransactionList
          title={'Recent Transactions'}
          loading={transactionsLoading}
          data={recentTransactions}
          emptyListMessage="No Transactions added yet!"
        />

        {/* floating button */}
        <Button
          onPress={() => router.push('/(modals)/transactionModal')}
          style={{
            height: verticalScale(50),
            width: verticalScale(50),
            borderRadius: 100,
            position: 'absolute',
            bottom: verticalScale(30),
            right: verticalScale(30),
          }}
        >
          <Icons.Plus
            color={colors.black}
            weight="bold"
            size={verticalScale(24)}
          />
        </Button>
      </View>
    </ScreenWrapper>
  );
};

export default Home;
