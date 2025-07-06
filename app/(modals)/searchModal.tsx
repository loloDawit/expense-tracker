import BackButton from '@/components/BackButton';
import Header from '@/components/Header';
import ModalWrapper from '@/components/ModalWrapper';
import SearchableList from '@/components/SearchableList';
import { theme } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import Loading from '@/components/Loading';

const SearchModal = () => {
  const { colors, isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const styles = getStyles(colors, isDark);

  return (
    <ModalWrapper
      style={{
        backgroundColor: colors.card,
        shadowColor: isDark ? colors.white : colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
      }}
    >
      <Animated.View
        entering={FadeIn.duration(200).delay(100)}
        style={styles.container}
      >
        <Header
          title={'Search'}
          leftIcon={<BackButton />}
          style={{ marginBottom: theme.spacing.y._10 }}
        />
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <Loading />
          </View>
        )}
        <SearchableList
          collectionName="transactions"
          emptyListMessage="No transactions match your search keywords"
          onLoadingChange={setIsLoading}
        />
      </Animated.View>
    </ModalWrapper>
  );
};

export default SearchModal;
const getStyles = (colors: Record<string, string>, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: theme.spacing.x._20,
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1,
    },
  });
