import { Image, Pressable, StyleSheet, View } from 'react-native';
import { QrIcon } from './icons/MpesaIcons';
import { colors } from '../theme/colors';

export function FloatingActions() {
  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <Pressable style={styles.zuri} hitSlop={4}>
        <Image
          source={require('../assets/zuri.png')}
          style={styles.zuriImage}
          resizeMode="cover"
        />
      </Pressable>
      <Pressable style={styles.qr} hitSlop={4}>
        <QrIcon size={30} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    right: 14,
    bottom: 26,
    alignItems: 'center',
    gap: 10,
  },
  zuri: {
    width: 62,
    height: 62,
    borderRadius: 31,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
  },
  zuriImage: { width: '100%', height: '100%' },
  qr: {
    width: 58,
    height: 58,
    borderRadius: 14,
    backgroundColor: colors.tile,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
