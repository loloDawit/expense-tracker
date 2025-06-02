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
