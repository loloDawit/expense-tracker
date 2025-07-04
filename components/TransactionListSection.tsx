import TransactionList from '@/components/TransactionList';
import { TransactionType } from '@/types';
import React from 'react';

interface TransactionListSectionProps {
  transactions: TransactionType[];
}

const TransactionListSection: React.FC<TransactionListSectionProps> = ({
  transactions,
}) => {
  return (
    <TransactionList
      title="Transactions"
      emptyListMessage="No transactions found"
      data={transactions}
    />
  );
};

export default TransactionListSection;
