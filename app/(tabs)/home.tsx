import ScreenWrapper from '@/components/ScreenWrapper';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import Button from '@/components/Button';
import HomeCard from '@/components/HomeCard';
import TransactionList from '@/components/TransactionList';
import Typography from '@/components/Typography';
import { theme } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import useFetchData from '@/hooks/useFetchData';
import { TransactionType } from '@/types';
import { verticalScale } from '@/utils/styling';
import { useRouter } from 'expo-router';
import { limit, orderBy, where } from 'firebase/firestore';
import * as Icons from 'phosphor-react-native';

const Home = () => {
  const { user } = useAuth();
  const router = useRouter();

  const constraints = [
    where('uid', '==', user?.uid), // Filter by user ID
    orderBy('date', 'desc'), // Order by creation date in descending order
    limit(30), // Limit the results to 50 transactions
  ];

  // Use the useFetchData hook with the 'transactions' collection and constraints
  const {
    data: recentTransactions,
    loading: transactionsLoading,
    error,
  } = useFetchData<TransactionType>('transactions', constraints);

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* header */}
        <View style={styles.header}>
          <View style={{ gap: 4 }}>
            <Typography size={16} color={theme.colors.neutral400}>
              Hello,
            </Typography>
            <Typography fontWeight={'500'} size={20}>
              {user?.displayName || ' '}
            </Typography>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(modals)/searchModal')}
            style={styles.searchIcon}
          >
            <Icons.MagnifyingGlass
              size={verticalScale(22)}
              color={theme.colors.neutral200}
              weight="bold"
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollViewStyle}
          showsVerticalScrollIndicator={false}
        >
          {/* card */}
          <View>
            <HomeCard />
          </View>

          <TransactionList
            title={'Recent Transactions'}
            loading={transactionsLoading}
            data={recentTransactions}
            emptyListMessage="No Transactions added yet!"
          />

          {/* <Button onPress={logout}>
            <Typo color={theme.colors.black}>Logout</Typo>
          </Button> */}
        </ScrollView>
        <Button
          onPress={() => router.push('/(modals)/transactionModal')}
          style={styles.floatingButton}
        >
          <Icons.Plus
            color={theme.colors.black}
            weight="bold"
            size={verticalScale(24)}
          />
        </Button>
      </View>
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.x._20,
    marginTop: verticalScale(8),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.x._10,
  },
  searchIcon: {
    backgroundColor: theme.colors.neutral700,
    padding: theme.spacing.x._10,
    borderRadius: 50,
  },
  floatingButton: {
    height: verticalScale(50),
    width: verticalScale(50),
    borderRadius: 100,
    position: 'absolute',
    bottom: verticalScale(30),
    right: verticalScale(30),
  },

  scrollViewStyle: {
    marginTop: theme.spacing.x._10,
    paddingBottom: verticalScale(100),
    gap: theme.spacing.x._25,
  },
});
