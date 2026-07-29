import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

/** One bounce per dot, offset so the row reads as a wave. */
const BOUNCE_STEP = 220;
const BOUNCE_STAGGER = 110;

type Props = {
  value: string;
  onChange(next: string): void;
  length?: number;
  onComplete?(pin: string): void;
  /** True while the PIN is being checked — the dots go green and bounce. */
  verifying?: boolean;
};

export function PinPad({ value, onChange, length = 4, onComplete, verifying = false }: Props) {
  const press = (key: string) => {
    if (verifying) return;
    Haptics.selectionAsync().catch(() => {});
    if (key === 'del') {
      onChange(value.slice(0, -1));
      return;
    }
    if (value.length >= length) return;
    const next = value + key;
    onChange(next);
    if (next.length === length) onComplete?.(next);
  };

  const bounces = useRef(Array.from({ length }, () => new Animated.Value(0))).current;

  useEffect(() => {
    if (!verifying) {
      bounces.forEach((v) => v.setValue(0));
      return;
    }

    const cycle = length * BOUNCE_STAGGER + BOUNCE_STEP * 2;

    const animations = bounces.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * BOUNCE_STAGGER),
          Animated.timing(v, {
            toValue: 1,
            duration: BOUNCE_STEP,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(v, {
            toValue: 0,
            duration: BOUNCE_STEP,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.delay(cycle - i * BOUNCE_STAGGER - BOUNCE_STEP * 2),
        ])
      )
    );

    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, [verifying, bounces, length]);

  return (
    <View>
      <View style={styles.dots}>
        {Array.from({ length }).map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              i < value.length && styles.dotFilled,
              verifying && styles.dotVerifying,
              verifying && {
                transform: [
                  {
                    translateY: bounces[i].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -10],
                    }),
                  },
                  {
                    scale: bounces[i].interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.25],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.pad}>
        {KEYS.map((k, i) =>
          k === '' ? (
            <View key={i} style={styles.key} />
          ) : (
            <Pressable
              key={i}
              style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
              onPress={() => press(k)}
              disabled={verifying}
            >
              {k === 'del' ? (
                <Ionicons name="backspace-outline" size={26} color={colors.text} />
              ) : (
                <Text style={styles.keyText}>{k}</Text>
              )}
            </Pressable>
          )
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginBottom: 34 },
  dot: {
    width: 15,
    height: 15,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.textMuted,
  },
  dotFilled: { backgroundColor: colors.green, borderColor: colors.green },
  dotVerifying: { backgroundColor: colors.green, borderColor: colors.green },
  pad: { flexDirection: 'row', flexWrap: 'wrap' },
  key: {
    width: '33.33%',
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyPressed: { opacity: 0.5 },
  keyText: { color: colors.text, fontSize: 27, fontWeight: '500' },
});
