import BackButton from '@/components/BackButton';
import Header from '@/components/Header';
import Input from '@/components/Input';
import ModalWrapper from '@/components/ModalWrapper';
import { theme } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { TransactionType } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { debounce } from 'lodash';
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import TransactionList from '@/components/TransactionList';
import { useTheme } from '@/contexts/ThemeContext';
import useFetchData from '@/hooks/useFetchData';
import { orderBy, where } from 'firebase/firestore';

const SearchModal = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [displaySearch, setDisplaySearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const handleSearch = useCallback(
    debounce((value: string) => {
      setDebouncedSearch(value);
    }, 400),
    [],
  );

  const constraints = useMemo(() => {
    if (!user?.uid) return [];
    return [where('uid', '==', user.uid), orderBy('date', 'desc')];
  }, [user?.uid]);

  // Use the useFetchData hook with the 'transactions' collection and constraints
  const { data: allTransactions, loading: transactionsLoading } =
    useFetchData<TransactionType>('transactions', constraints);

  //   const hanldeSearch = (search: string) => {};
  //   const handleTextDebounce = useCallback(debounce(hanldeSearch, 400), []);

  const filteredTransactions = useMemo(() => {
    if (debouncedSearch.length <= 1) return allTransactions;

    type SearchableField = 'category' | 'type' | 'description';
    return allTransactions.filter((item) =>
      (['category', 'type', 'description'] as SearchableField[]).some((field) =>
        item?.[field]?.toLowerCase()?.includes(debouncedSearch.toLowerCase()),
      ),
    );
  }, [debouncedSearch, allTransactions]);

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
      <Animated.View
        entering={FadeIn.duration(200).delay(100)}
        style={styles.container}
      >
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
              value={displaySearch}
              placeholderTextColor={colors.neutral400}
              containerStyle={{ backgroundColor: colors.neutral100 }}
              onChangeText={(value) => {
                const trimmed = value.trimStart();
                setDisplaySearch(trimmed);
                handleSearch(trimmed);
              }}
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
