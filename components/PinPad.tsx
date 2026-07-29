import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

type Props = {
  value: string;
  onChange(next: string): void;
  length?: number;
  onComplete?(pin: string): void;
};

export function PinPad({ value, onChange, length = 4, onComplete }: Props) {
  const press = (key: string) => {
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

  return (
    <View>
      <View style={styles.dots}>
        {Array.from({ length }).map((_, i) => (
          <View key={i} style={[styles.dot, i < value.length && styles.dotFilled]} />
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
