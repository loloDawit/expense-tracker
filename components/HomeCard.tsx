import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import useFetchData from '@/hooks/useFetchData';
import { WalletType } from '@/types';
import { formatAmount } from '@/utils/helper';
import { scale, verticalScale } from '@/utils/styling';
import { orderBy, where } from 'firebase/firestore';
import * as Icons from 'phosphor-react-native';
import React, { useMemo } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import Typography from './Typography';

const HomeCard = () => {
  console.log('test');

  const { colors, spacing } = useTheme();
  const { user } = useAuth();
  const walletConstraints = useMemo(() => {
    if (!user?.uid) return [];
    return [where('uid', '==', user.uid), orderBy('created', 'desc')];
  }, [user?.uid]);
  const {
    data: wallets,
    loading: walletLoading,
    error,
  } = useFetchData<WalletType>('wallets', walletConstraints);

  const getTotals = () => {
    return wallets.reduce(
      (totals: any, item: WalletType) => {
        totals.balance = totals.balance + Number(item.amount);
        totals.income = totals.income + Number(item.totalIncome);
        totals.expenses = totals.expenses + Number(item.totalExpenses);
        return totals;
      },
      { balance: 0, income: 0, expenses: 0 },
    );
  };
  return (
    <ImageBackground
      source={require('../assets/images/card.png')}
      resizeMode="stretch"
      style={styles.bgImage}
    >
      <View style={[styles.container, { padding: spacing.x._20 }]}>
        <View>
          {/* total Income */}
          <View style={[styles.totalIncomeRow, { marginBottom: spacing.y._5 }]}>
            <Typography color={colors.neutral800} size={17} fontWeight={'500'}>
              Total Income
            </Typography>
            <Icons.DotsThreeOutline
              size={verticalScale(23)}
              color={colors.black}
              weight="fill"
            />
          </View>
          <Typography
            color={colors.black}
            size={30}
            fontWeight={'bold'}
            style={{
              fontFamily: 'Manrope-Regular',
              fontVariant: ['tabular-nums'],
            }}
          >
            {walletLoading
              ? '----'
              : formatAmount(getTotals()?.balance?.toFixed(2))}
          </Typography>
        </View>

        {/* expense & income */}
        <View style={styles.stats}>
          {/* income */}
          <View style={{ gap: verticalScale(5) }}>
            <View style={styles.incomeExpense}>
              <View style={styles.statsIcon}>
                <Icons.ArrowDown
                  size={verticalScale(15)}
                  color={colors.black}
                  weight="bold"
                />
              </View>
              <Typography
                size={16}
                color={colors.neutral700}
                fontWeight={'500'}
              >
                Income
              </Typography>
            </View>
            <View style={{ alignSelf: 'center' }}>
              <Typography
                style={{
                  fontFamily: 'Manrope-Regular',
                  fontVariant: ['tabular-nums'],
                }}
                size={17}
                color={colors.green}
                fontWeight={'600'}
              >
                {walletLoading
                  ? '----'
                  : formatAmount(getTotals().balance, 'income')}
              </Typography>
            </View>
          </View>

          {/* expense */}
          <View style={{ gap: verticalScale(5) }}>
            <View style={[styles.incomeExpense, { gap: spacing.y._7 }]}>
              <View
                style={[
                  styles.statsIcon,
                  {
                    backgroundColor: colors.neutral350,
                    padding: spacing.y._5,
                  },
                ]}
              >
                <Icons.ArrowUp
                  size={verticalScale(15)}
                  color={colors.black}
                  weight="bold"
                />
              </View>
              <Typography
                size={16}
                color={colors.neutral700}
                fontWeight={'500'}
              >
                Expense
              </Typography>
            </View>
            <View style={{ alignSelf: 'center' }}>
              <Typography
                size={17}
                color={colors.rose}
                fontWeight={'600'}
                style={{
                  fontFamily: 'Manrope-Regular',
                  fontVariant: ['tabular-nums'],
                }}
              >
                {walletLoading
                  ? '----'
                  : formatAmount(getTotals().expenses, 'expense')}
              </Typography>
            </View>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

export default HomeCard;

const styles = StyleSheet.create({
  bgImage: {
    height: scale(210),
    width: '100%',
  },
  container: {
    paddingHorizontal: scale(23),
    height: '87%',
    width: '100%',
    justifyContent: 'space-between',
  },
  totalIncomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsIcon: {
    borderRadius: 50,
  },
  incomeExpense: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
