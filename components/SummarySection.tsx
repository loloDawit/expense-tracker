import StatsSummary from '@/components/StatsSummary';
import { MetricsType } from '@/types';
import React from 'react';

interface SummarySectionProps {
  summary: MetricsType | null;
}

const SummarySection: React.FC<SummarySectionProps> = ({ summary }) => {
  if (!summary) {
    return null;
  }
  return <StatsSummary metrics={summary} />;
};

export default SummarySection;
