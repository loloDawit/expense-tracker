import { Timestamp } from 'firebase/firestore';

export function formatAmount(
  amount: number,
  type?: 'income' | 'expense',
): string {
  const prefix = type === 'income' ? '+' : type === 'expense' ? '-' : '';

  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${prefix}${formatted}`;
}

export function normalizeDate(
  value: Date | Timestamp | string,
): Date {
  if (value instanceof Date) return value;
  if (typeof value === 'string') return new Date(value);
  if (value instanceof Timestamp) return value.toDate();
  // fallback for unexpected types
  return new Date(value as any);
}
