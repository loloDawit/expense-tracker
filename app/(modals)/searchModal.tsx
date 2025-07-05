import { Ionicons } from '@expo/vector-icons';
import BackButton from '@/components/BackButton';
import Header from '@/components/Header';
import Input from '@/components/Input';
import ModalWrapper from '@/components/ModalWrapper';
import { theme } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { TransactionType } from '@/types';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import TransactionList from '@/components/TransactionList';
import { useTheme } from '@/contexts/ThemeContext';
import useFetchData from '@/hooks/useFetchData';
import { orderBy, where } from 'firebase/firestore';

const SearchModal = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [search, setSearch] = useState('');

  const constraints = useMemo(() => {
    if (!user?.uid) return [];
    return [where('uid', '==', user.uid), orderBy('date', 'desc')];
  }, [user?.uid]);

  // Use the useFetchData hook with the 'transactions' collection and constraints
  const {
    data: allTransactions,
    loading: transactionsLoading,
  } = useFetchData<TransactionType>('transactions', constraints);

  //   const hanldeSearch = (search: string) => {};
  //   const handleTextDebounce = useCallback(debounce(hanldeSearch, 400), []);

  const filteredTransactions = allTransactions.filter((item) => {
    if (search.length > 1) {
      if (
        item?.category?.toLowerCase()?.includes(search?.toLowerCase()) ||
        item?.type?.toLowerCase()?.includes(search?.toLowerCase()) ||
        item?.description?.toLowerCase()?.includes(search?.toLowerCase())
      ) {
        return true;
      }
      return false;
    }
    return true;
  });

  return (
    <ModalWrapper
      style={{
        backgroundColor: colors.background,
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
      }}
    >
      <Animated.View entering={FadeIn.duration(200).delay(100)} style={styles.container}>
        <Header
          title={'Search'}
          leftIcon={<BackButton />}
          style={{ marginBottom: theme.spacing.y._10 }}
        />
        {/* form */}
        <ScrollView contentContainerStyle={styles.form}>
          <View style={styles.inputContainer}>
            <Input
              placeholder="shoes..."
              value={search}
              placeholderTextColor={colors.neutral400}
              containerStyle={{ backgroundColor: colors.neutral100 }}
              onChangeText={(value) => setSearch(value)}
              icon={
                <Ionicons
                  name="search"
                  size={24}
                  color={colors.textSecondary}
                />
              }
            />
          </View>

          <View>
            <TransactionList
              loading={transactionsLoading}
              data={filteredTransactions}
              emptyListMessage={'No transactions match your search keywords'}
            />
          </View>
        </ScrollView>
      </Animated.View>
    </ModalWrapper>
  );
};

export default SearchModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.x._20,
  },

  form: {
    gap: theme.spacing.y._15,
    paddingVertical: theme.spacing.y._15,
    paddingBottom: theme.spacing.y._40,
  },
  inputContainer: {
    gap: theme.spacing.y._10,
  },
});
