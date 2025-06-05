import { useTheme } from '@/contexts/ThemeContext';
import { WalletType } from '@/types';
import { formatAmount } from '@/utils/helper';
import { verticalScale } from '@/utils/styling';
import { Image } from 'expo-image';
import { Router } from 'expo-router';
import * as Icons from 'phosphor-react-native';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Typography from './Typography';

const WalletListItem = ({
  item,
  index,
  router,
}: {
  item: WalletType;
  index: number;
  router: Router;
}) => {
  const { colors } = useTheme();

  const handleOpen = () => {
    router.push({
      pathname: '/(modals)/walletModal',
      params: {
        id: item?.id,
        name: item?.name,
        image: item?.image,
      },
    });
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50)
        .springify()
        .damping(13)}
    >
      <TouchableOpacity style={styles.container} onPress={handleOpen}>
        <View
          style={[
            styles.imageContainer,
            {
              borderColor: colors.neutral600,
              borderRadius: 10,
            },
          ]}
        >
          <Image
            style={{ flex: 1 }}
            source={item.image}
            contentFit="cover"
            transition={100}
          />
        </View>

        <View
          style={[
            styles.nameContainer,
            { marginLeft: 10 }, // optional: theme.spacing.x._10
          ]}
        >
          <Typography size={16}>{item.name}</Typography>
          <Typography size={14} color={colors.neutral400}>
            {formatAmount(item?.amount || 0)}
          </Typography>
        </View>

        <Icons.CaretRight
          size={verticalScale(20)}
          weight="bold"
          color={colors.white}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default WalletListItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(17),
  },
  imageContainer: {
    height: verticalScale(45),
    width: verticalScale(45),
    borderWidth: 1,
    overflow: 'hidden',
  },
  nameContainer: {
    flex: 1,
    gap: 2,
  },
});
