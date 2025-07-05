import { CategoryType, ExpenseCategoriesType } from '@/types';

export const expenseCategories: ExpenseCategoriesType = {
  groceries: {
    id: 'groceries',
    type: 'expense',
    label: 'Groceries',
    value: 'groceries',
    icon: 'ShoppingCart',
    bgColor: '#4B5563', // Deep Teal Green
  },
  rent: {
    id: 'rent',
    type: 'expense',
    label: 'Rent',
    value: 'rent',
    icon: 'House',
    bgColor: '#075985', // Dark Blue
  },
  utilities: {
    id: 'utilities',
    type: 'expense',
    label: 'Utilities',
    value: 'utilities',
    icon: 'Lightbulb',
    bgColor: '#ca8a04', // Dark Golden Brown
  },
  transportation: {
    id: 'transportation',
    type: 'expense',
    label: 'Transportation',
    value: 'transportation',
    icon: 'Car',
    bgColor: '#b45309', // Dark Orange-Red
  },
  entertainment: {
    id: 'entertainment',
    type: 'expense',
    label: 'Entertainment',
    value: 'entertainment',
    icon: 'FilmStrip',
    bgColor: '#0f766e', // Darker Red-Brown
  },
  dining: {
    id: 'dining',
    type: 'expense',
    label: 'Dining',
    value: 'dining',
    icon: 'ForkKnife',
    bgColor: '#be185d', // Dark Red
  },
  health: {
    id: 'health',
    type: 'expense',
    label: 'Health',
    value: 'health',
    icon: 'Heart',
    bgColor: '#e11d48', // Dark Purple
  },
  insurance: {
    id: 'insurance',
    type: 'expense',
    label: 'Insurance',
    value: 'insurance',
    icon: 'ShieldCheck',
    bgColor: '#404040', // Dark Gray
  },
  savings: {
    id: 'savings',
    type: 'expense',
    label: 'Savings',
    value: 'savings',
    icon: 'PiggyBank',
    bgColor: '#065F46', // Deep Teal Green
  },
  clothing: {
    id: 'clothing',
    type: 'expense',
    label: 'Clothing',
    value: 'clothing',
    icon: 'TShirt',
    bgColor: '#7c3aed', // Dark Indigo
  },
  personal: {
    id: 'personal',
    type: 'expense',
    label: 'Personal',
    value: 'personal',
    icon: 'User',
    bgColor: '#a21caf', // Deep Pink
  },
  others: {
    id: 'others',
    type: 'expense',
    label: 'Others',
    value: 'others',
    icon: 'DotsThreeOutline',
    bgColor: '#525252', // Neutral Dark Gray
  },
};

export const incomeCategory: CategoryType = {
  id: 'income',
  type: 'income',
  label: 'Income',
  value: 'income',
  icon: 'CurrencyDollarSimple',
  bgColor: '#16a34a', // Dark
};

export const transactionTypes = [
  { label: 'Expense', value: 'expense' },
  { label: 'Income', value: 'income' },
];
