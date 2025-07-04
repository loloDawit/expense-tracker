import Header from '@/components/Header';
import { useTheme } from '@/contexts/ThemeContext';
import * as Icons from 'phosphor-react-native';
import React from 'react';
import { TouchableOpacity } from 'react-native';

interface AnalyticsHeaderProps {
  onRefresh: () => void;
}

const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({ onRefresh }) => {
  const { colors } = useTheme();

  return (
    <Header
      title="Statistics"
      rightIcon={
        <TouchableOpacity onPress={onRefresh}>
          <Icons.ArrowsClockwise size={22} color={colors.text} />
        </TouchableOpacity>
      }
    />
  );
};

export default AnalyticsHeader;
