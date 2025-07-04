import { CategoryType, ExpenseCategoriesType } from '@/types';

export const expenseCategories: ExpenseCategoriesType = {
  groceries: {
    label: 'Groceries',
    value: 'groceries',
    icon: 'ShoppingCart',
    bgColor: '#4B5563', // Deep Teal Green
  },
  rent: {
    label: 'Rent',
    value: 'rent',
    icon: 'House',
    bgColor: '#075985', // Dark Blue
  },
  utilities: {
    label: 'Utilities',
    value: 'utilities',
    icon: 'Lightbulb',
    bgColor: '#ca8a04', // Dark Golden Brown
  },
  transportation: {
    label: 'Transportation',
    value: 'transportation',
    icon: 'Car',
    bgColor: '#b45309', // Dark Orange-Red
  },
  entertainment: {
    label: 'Entertainment',
    value: 'entertainment',
    icon: 'FilmStrip',
    bgColor: '#0f766e', // Darker Red-Brown
  },
  dining: {
    label: 'Dining',
    value: 'dining',
    icon: 'ForkKnife',
    bgColor: '#be185d', // Dark Red
  },
  health: {
    label: 'Health',
    value: 'health',
    icon: 'Heart',
    bgColor: '#e11d48', // Dark Purple
  },
  insurance: {
    label: 'Insurance',
    value: 'insurance',
    icon: 'ShieldCheck',
    bgColor: '#404040', // Dark Gray
  },
  savings: {
    label: 'Savings',
    value: 'savings',
    icon: 'PiggyBank',
    bgColor: '#065F46', // Deep Teal Green
  },
  clothing: {
    label: 'Clothing',
    value: 'clothing',
    icon: 'TShirt',
    bgColor: '#7c3aed', // Dark Indigo
  },
  personal: {
    label: 'Personal',
    value: 'personal',
    icon: 'User',
    bgColor: '#a21caf', // Deep Pink
  },
  others: {
    label: 'Others',
    value: 'others',
    icon: 'DotsThreeOutline',
    bgColor: '#525252', // Neutral Dark Gray
  },
};

export const incomeCategory: CategoryType = {
  label: 'Income',
  value: 'income',
  icon: 'CurrencyDollarSimple',
  bgColor: '#16a34a', // Dark
};

export const transactionTypes = [
  { label: 'Expense', value: 'expense' },
  { label: 'Income', value: 'income' },
];
