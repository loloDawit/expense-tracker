import { theme } from '@/constants/theme';
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
        <View style={styles.imageContainer}>
          <Image
            style={{ flex: 1 }}
            source={item.image}
            contentFit="cover"
            transition={100}
          />
        </View>

        <View style={styles.nameContainer}>
          <Typography size={16}>{item.name}</Typography>
          <Typography size={14} color={theme.colors.neutral400}>
            {formatAmount(item?.amount || 0)}
          </Typography>
        </View>

        {/* <TouchableOpacity> */}
        <Icons.CaretRight
          size={verticalScale(20)}
          weight="bold"
          color={theme.colors.white}
        />
        {/* </TouchableOpacity> */}
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
    // padding: spacingX._15,
  },
  imageContainer: {
    height: verticalScale(45),
    width: verticalScale(45),
    borderWidth: 1,
    borderColor: theme.colors.neutral600,
    borderRadius: theme.radius.sm,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  nameContainer: {
    flex: 1,
    gap: 2,
    marginLeft: theme.spacing.x._10,
  },
});
