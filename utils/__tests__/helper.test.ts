import { formatAmount } from '../helper';

describe('formatAmount', () => {
  it('formats amount without type', () => {
    expect(formatAmount(1234.56)).toBe('$1,234.56');
  });

  it('formats income amount with plus prefix', () => {
    expect(formatAmount(1234.56, 'income')).toBe('+$1,234.56');
  });

  it('formats expense amount with minus prefix', () => {
    expect(formatAmount(1234.56, 'expense')).toBe('-$1,234.56');
  });
});
