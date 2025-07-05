import { Ionicons } from '@expo/vector-icons';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { theme } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import useFetchData from '@/hooks/useFetchData';
import { TransactionType } from '@/types';
import { orderBy, where } from 'firebase/firestore';
import Input from './Input';
import TransactionList from './TransactionList';

interface SearchableListProps {
  collectionName: string;
  emptyListMessage: string;
  onLoadingChange?: (isLoading: boolean) => void;
}

const SearchableList: React.FC<SearchableListProps> = ({
  collectionName,
  emptyListMessage,
  onLoadingChange,
}) => {
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

  const {
    data: allTransactions,
    loading: transactionsLoading,
  } = useFetchData<TransactionType>(collectionName, constraints);

  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(transactionsLoading);
    }
  }, [transactionsLoading, onLoadingChange]);

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
            <Ionicons name="search" size={24} color={colors.textSecondary} />
          }
        />
      </View>

      <View>
        <TransactionList
          loading={transactionsLoading}
          data={filteredTransactions}
          emptyListMessage={emptyListMessage}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  form: {
    gap: theme.spacing.y._15,
    paddingVertical: theme.spacing.y._15,
    paddingBottom: theme.spacing.y._40,
  },
  inputContainer: {
    gap: theme.spacing.y._10,
  },
});

export default SearchableList;
