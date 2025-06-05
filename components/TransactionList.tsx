import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { Timestamp } from 'firebase/firestore';
import * as Icons from 'phosphor-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { expenseCategories, incomeCategory } from '@/constants/data';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { fetchUserCategories } from '@/services/transactionService';
import {
  CategoryType,
  TransactionItemProps,
  TransactionListType,
  TransactionType,
} from '@/types';
import { formatAmount } from '@/utils/helper';
import { verticalScale } from '@/utils/styling';
import Loading from './Loading';
import Typography from './Typography';

function isValidCategory(obj: any): obj is CategoryType {
  return (
    typeof obj.label === 'string' &&
    typeof obj.value === 'string' &&
    typeof obj.icon === 'string' &&
    typeof obj.bgColor === 'string' &&
    typeof obj.type === 'string'
  );
}

function getCategory(
  categoryKey: string | undefined,
  type: 'income' | 'expense',
  userCategories: CategoryType[],
): CategoryType {
  if (type === 'income') return incomeCategory;

  return (
    expenseCategories[categoryKey!] ||
    userCategories.find((cat) => cat.value === categoryKey) || {
      label: 'Unknown',
      value: 'unknown',
      icon: 'Tag',
      bgColor: colors.neutral700,
      type: 'expense',
    }
  );
}

const TransactionList = ({
  data,
  title,
  loading,
  emptyListMessage,
}: TransactionListType) => {
  const { colors, spacing, radius } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [userCategories, setUserCategories] = useState<CategoryType[]>([]);

  useEffect(() => {
    if (!user?.uid) return;
    fetchUserCategories(user.uid).then((res) => {
      if (res.success && res.data) {
        const valid = res.data.filter(
          isValidCategory,
        ) as unknown as CategoryType[];
        setUserCategories(valid);
      }
    });
  }, [user?.uid]);

  const groupedTransactions = useMemo(() => {
    const map: Record<string, TransactionType[]> = {};
    data.forEach((item) => {
      const dateStr = (item.date as Timestamp)
        ?.toDate()
        ?.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      if (!map[dateStr]) map[dateStr] = [];
      map[dateStr].push(item);
    });

    return Object.entries(map)
      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
      .flatMap(([date, items]) => [{ type: 'header', date }, ...items]);
  }, [data]);

  const handleClick = (item: TransactionType) => {
    router.push({
      pathname: '/(modals)/transactionModal',
      params: {
        id: item.id,
        type: item.type,
        amount: item.amount.toString(),
        category: item.category,
        date: (item.date as Timestamp)?.toDate()?.toISOString(),
        description: item.description,
        image: item?.image,
        uid: item.uid,
        walletId: item.walletId,
      },
    });
  };

  return (
    <View style={[styles.container, { gap: spacing.y._17 }]}>
      {title && (
        <Typography fontWeight="500" size={20}>
          {title}
        </Typography>
      )}

      <View style={styles.list}>
        <FlashList
          data={groupedTransactions}
          estimatedItemSize={60}
          renderItem={({ item, index }) => {
            if ((item as any).type === 'header') {
              return (
                <Typography
                  key={`header-${(item as any).date}`}
                  fontWeight="600"
                  size={15}
                  color={colors.text}
                  style={{ marginBottom: 6, marginTop: 16 }}
                >
                  {(item as any).date}
                </Typography>
              );
            }
            return (
              <TransactionItem
                key={(item as TransactionType).id}
                item={item as TransactionType}
                index={index}
                handleClick={handleClick}
                userCategories={userCategories}
              />
            );
          }}
        />
      </View>

      {!loading && data.length === 0 && (
        <Typography
          size={15}
          color={colors.neutral400}
          style={{ textAlign: 'center', marginTop: spacing.y._15 }}
        >
          {emptyListMessage}
        </Typography>
      )}

      {loading && (
        <View style={{ top: verticalScale(100) }}>
          <Loading />
        </View>
      )}
    </View>
  );
};

export default TransactionList;

const TransactionItem = ({
  item,
  index,
  handleClick,
  userCategories,
}: TransactionItemProps & { userCategories: CategoryType[] }) => {
  const { colors, spacing, radius } = useTheme();
  const category = useMemo(
    () =>
      getCategory(
        item.category,
        item.type as 'income' | 'expense',
        userCategories,
      ),
    [item.category, item.type, userCategories],
  );

  const IconComponent = useMemo(() => {
    if (typeof category.icon === 'string') {
      return Icons[category.icon as keyof typeof Icons] || Icons.Tag;
    }
    return category.icon || Icons.Tag;
  }, [category.icon]);

  const date = (item.date as Timestamp)?.toDate()?.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50)
        .springify()
        .damping(14)}
    >
      <TouchableOpacity
        style={[
          styles.row,
          {
            gap: spacing.x._12,
            marginBottom: spacing.y._12,
            backgroundColor: colors.card,
            padding: spacing.y._10,
            paddingHorizontal: spacing.y._10,
            borderRadius: radius.md,
          },
        ]}
        onPress={() => handleClick(item)}
      >
        <View
          style={[
            styles.icon,
            { backgroundColor: category.bgColor, borderRadius: radius.sm },
          ]}
        >
          <IconComponent
            size={verticalScale(25)}
            weight="fill"
            color={colors.white}
          />
        </View>

        <View style={styles.categoryDes}>
          <Typography size={17}>{category.label}</Typography>
          <Typography
            size={12}
            color={colors.neutral400}
            textProps={{ numberOfLines: 1 }}
          >
            {item.description}
          </Typography>
        </View>

        <View style={styles.amountDate}>
          <Typography
            style={{
              fontFamily: 'Manrope-Regular',
              fontVariant: ['tabular-nums'],
            }}
            fontWeight="500"
            color={item.type === 'income' ? colors.primary : colors.rose}
          >
            {formatAmount(item.amount, item.type)}
          </Typography>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {},
  list: {
    minHeight: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  icon: {
    height: verticalScale(44),
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderCurve: 'continuous',
  },
  categoryDes: {
    flex: 1,
    gap: 2.5,
  },
  amountDate: {
    alignItems: 'flex-end',
    gap: 3,
  },
});
