import ExpensePieChart from '@/components/ExpensePieChart';
import React from 'react';

interface PieChartSectionProps {
  data: { name: string; amount: number }[];
}

const PieChartSection: React.FC<PieChartSectionProps> = ({ data }) => {
  if (data.length === 0) {
    return null;
  }
  return <ExpensePieChart data={data} />;
};

export default PieChartSection;
