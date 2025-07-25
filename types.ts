import { Timestamp } from 'firebase/firestore';
import React, { ReactNode } from 'react';
import {
  StyleProp,
  TextInput,
  TextInputProps,
  TextProps,
  TextStyle,
  TouchableOpacityProps,
  ViewStyle,
} from 'react-native';

export type ScreenWrapperProps = {
  style?: ViewStyle;
  children: React.ReactNode;
};
export type ModalWrapperProps = {
  style?: ViewStyle;
  children: React.ReactNode;
  bg?: string;
};
export type accountOptionType = {
  title: string;
  icon: React.ReactNode;
  bgColor: string;
  routeName?: any;
  details?: boolean;
  value?: string;
};

export type TypoProps = {
  size?: number;
  color?: string;
  fontWeight?: TextStyle['fontWeight'];
  children: any | null;
  style?: StyleProp<TextStyle>;
  textProps?: TextProps;
};

export type IconComponent = React.ComponentType<{
  height?: number;
  width?: number;
  strokeWidth?: number;
  color?: string;
  fill?: string;
}>;

export type IconProps = {
  name: string;
  color?: string;
  size?: number;
  strokeWidth?: number;
  fill?: string;
};

export type HeaderProps = {
  title?: string;
  style?: ViewStyle;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

export type BackButtonProps = {
  style?: ViewStyle;
  iconSize?: number;
};

export type TransactionType = {
  id?: string;
  type: 'income' | 'expense';
  amount: number;
  category?: string;
  date: Date | Timestamp | string;
  description?: string;
  image?: any;
  uid?: string;
  walletId: string;
};

export type CategoryType = {
  id: string; // Unique identifier for the category
  label: string;
  value: string;
  icon: string;
  bgColor: string;
  type: 'income' | 'expense'; // Type of category, either income or expense
};
export type ExpenseCategoriesType = {
  [key: string]: CategoryType;
};

export type TransactionListType = {
  data: TransactionType[];
  title?: string;
  loading?: boolean;
  emptyListMessage?: string;
};

export type TransactionItemProps = {
  item: TransactionType;
  index: number;
  handleClick: Function;
};

export interface InputProps extends TextInputProps {
  icon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  inputRef?: React.RefObject<TextInput>;
  //   label?: string;
  error?: string;
}

export interface CustomButtonProps extends TouchableOpacityProps {
  style?: ViewStyle;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

export type ImageUploadProps = {
  file?: any;
  onSelect: (file: any) => void;
  onClear: () => void;
  containerStyle?: ViewStyle;
  imageStyle?: ViewStyle;
  placeholder?: string;
};

export type UserType = {
  uid?: string;
  email?: string | null;
  displayName?: string | null;
  emailVerified?: boolean;
  photoURL?: string | { uri: string };
};

export type AuthContextType = {
  user: UserType | null;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; msg?: string }>;
  signup: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ success: boolean; msg?: string }>;
  logout: () => Promise<void>;
  updateUserData: (data: Partial<UserType>) => void;
  resetPassword: (email: string) => Promise<{ success: boolean; msg?: string }>;
};

export type ResponseType = {
  success: boolean;
  data?: any;
  msg?: string;
};

export type WalletType = {
  id?: string;
  name: string;
  amount?: number;
  totalIncome?: number;
  totalExpenses?: number;
  image: any;
  uid?: string;
  created?: Date;
  isDeleted?: boolean;
};

export type MetricsType = {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  avgTransactionAmount: number;
  highestExpense: number;
  avgDailySpending: number;
  mostActiveDay: string;
  topSpendingCategory: string;
  topIncomeSource: string;
  expenseToIncomeRatio: number;
};

export type ChartState = {
  chartData: any[];
  transactions: TransactionType[];
  summary: MetricsType | null;
  expenseByCategory: { name: string; amount: number }[];
};
