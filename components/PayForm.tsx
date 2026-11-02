/**
 * The building blocks the M-PESA payment screens share — Send Money, Lipa na
 * M-PESA and Withdraw are all the same form wearing different labels.
 */
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  KeyboardTypeOptions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../theme/colors';
import { formatKsh } from '../theme/layout';
import { themed } from '../theme/ThemeContext';

/* ── Segmented toggle ─────────────────────────────────────────────── */

export function Segmented<K extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly (readonly [K, string])[];
  value: K;
  onChange: (k: K) => void;
}) {
  const styles = useStyles();
  return (
    <View style={styles.segment}>
      {options.map(([key, label]) => {
        const active = value === key;
        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            style={[styles.segmentItem, active && styles.segmentActive]}
          >
            <Text
              style={[styles.segmentText, active && styles.segmentTextActive]}
              numberOfLines={1}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ── Avatars ──────────────────────────────────────────────────────── */

const TINTS = [
  ['tintSky', 'tintSkyText'],
  ['tintGreen', 'green'],
  ['tintBlue', 'tintBlueText'],
  ['tintPink', 'tintPinkText'],
  ['tintPurple', 'tintPurpleText'],
] as const;

/** Same name, same colour, every time. */
export function tintFor(name: string): readonly [string, string] {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const [bg, fg] = TINTS[h % TINTS.length];
  return [colors[bg], colors[fg]];
}

export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return (words.length > 1 ? words[0][0] + words[1][0] : (words[0] ?? '?').slice(0, 1))
    .toUpperCase();
}

export function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  const styles = useStyles();
  const [bg, fg] = tintFor(name);
  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
      ]}
    >
      <Text style={[styles.avatarText, { color: fg, fontSize: size * 0.36 }]}>
        {initialsOf(name)}
      </Text>
    </View>
  );
}

/* ── Favourites strip ─────────────────────────────────────────────── */

export function Favourites({ names }: { names: string[] }) {
  const styles = useStyles();
  return (
    <>
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Favourites</Text>
        <Pressable hitSlop={8}>
          <Text style={styles.link}>View All</Text>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.favs}>
        <Pressable style={styles.fav}>
          <View style={[styles.avatar, styles.addCircle]}>
            <Ionicons name="add" size={21} color={colors.red} />
          </View>
          <Text style={[styles.favName, styles.favAdd]}>Add</Text>
        </Pressable>
        {names.map((n) => (
          <Pressable key={n} style={styles.fav}>
            <Avatar name={n} />
            <Text style={styles.favName} numberOfLines={2}>
              {n}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </>
  );
}

/* ── Labelled input box ───────────────────────────────────────────── */

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'number-pad',
  maxLength,
  error,
  right,
}: {
  label: string;
  value: string;
  onChangeText(t: string): void;
  placeholder: string;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  error?: boolean;
  right?: React.ReactNode;
}) {
  const styles = useStyles();
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.input, error && styles.inputError]}>
        <TextInput
          style={styles.inputText}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textFaint}
          keyboardType={keyboardType}
          maxLength={maxLength}
        />
        {right}
      </View>
    </>
  );
}

/** Amount box with "Ksh" on the right and the balance line under it. */
export function AmountField({
  value,
  onChange,
  balance,
  fuliza,
  error,
}: {
  value: string;
  onChange(digits: string): void;
  balance: number;
  fuliza: number;
  error: string | null;
}) {
  const styles = useStyles();
  return (
    <>
      <Field
        label="Enter amount"
        value={value}
        onChangeText={(t) => onChange(t.replace(/[^0-9]/g, ''))}
        placeholder="0"
        maxLength={7}
        error={!!error}
        right={<Text style={styles.suffix}>Ksh</Text>}
      />
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <Text style={styles.hint}>
          Balance: {formatKsh(balance)} - Fuliza: {formatKsh(fuliza)}
        </Text>
      )}
    </>
  );
}

export const useFieldStyles = themed((colors) =>
  StyleSheet.create({
  iconBtn: { paddingHorizontal: 6 },
  divider: { width: 1, height: 24, backgroundColor: colors.inputBorder, marginHorizontal: 6 },
}));

/* ── Payment method cards ─────────────────────────────────────────── */

/** The little "swoosh" mark on the payment-method cards. */
export function Swoosh({ color }: { color: string }) {
  return (
    <Svg width={34} height={14} viewBox="0 0 44 18">
      <Path d="M2 15 C12 14 18 10 24 3 C27 8 32 12 42 13 C30 16 16 17 2 15 Z" fill={color} />
    </Svg>
  );
}

export type Method = {
  key: string;
  name: string;
  sub: string;
  mark: React.ReactNode;
};

export function PaymentMethods({
  methods,
  value,
  onChange,
}: {
  methods: Method[];
  value: string;
  onChange(k: string): void;
}) {
  const styles = useStyles();
  const compact = methods.length > 2;
  return (
    <>
      <Text style={[styles.label, styles.methodLabel]}>Payment Method</Text>
      <View style={[styles.methods, compact && styles.methodsCompact]}>
        {methods.map((m) => {
          const active = m.key === value;
          return (
            <Pressable
              key={m.key}
              onPress={() => onChange(m.key)}
              style={[styles.method, active && styles.methodActive]}
            >
              {active && (
                <View style={styles.tick}>
                  <Ionicons name="checkmark" size={12} color={colors.white} style={styles.tickIcon} />
                </View>
              )}
              {m.mark}
              <Text style={[styles.methodName, compact && styles.methodNameCompact]} numberOfLines={1}>
                {m.name}
              </Text>
              <Text style={styles.methodSub} numberOfLines={1}>
                {m.sub}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </>
  );
}

export const usePayStyles = themed((colors) =>
  StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.black },
  flex: { flex: 1 },
  scroll: { flex: 1, backgroundColor: colors.screen },
  content: { padding: 16, paddingTop: 6, paddingBottom: 40 },
  continue: { marginTop: 26, height: 48 },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  gap: { height: 10 },
}));

const useStyles = themed((colors) =>
  StyleSheet.create({
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 30,
    padding: 5,
  },
  segmentItem: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  segmentActive: { backgroundColor: colors.green },
  segmentText: { color: colors.text, fontSize: 14.5 },
  segmentTextActive: { color: colors.onGreen, fontWeight: '600' },

  avatar: { alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '700' },
  addCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.tile },

  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  link: { color: colors.green, fontSize: 14 },
  favs: { marginTop: 14, marginHorizontal: -6 },
  fav: { width: 68, alignItems: 'center' },
  favName: { color: colors.text, fontSize: 13, textAlign: 'center', marginTop: 6 },
  favAdd: { color: colors.textMuted },

  label: { color: colors.text, fontSize: 14, marginTop: 18, marginBottom: 8 },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: colors.card,
  },
  inputError: { borderColor: colors.red },
  inputText: { flex: 1, color: colors.text, fontSize: 15.5, padding: 0 },
  suffix: { color: colors.textMuted, fontSize: 15.5 },
  hint: { color: colors.textMuted, fontSize: 13, marginTop: 8 },
  errorText: { color: colors.red, fontSize: 13, marginTop: 8 },

  methodLabel: { marginTop: 26 },
  methods: { flexDirection: 'row', gap: 12 },
  methodsCompact: { gap: 8 },
  method: {
    flex: 1,
    height: 84,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: colors.card,
    paddingHorizontal: 4,
  },
  methodActive: { borderColor: colors.green, borderWidth: 1.5, backgroundColor: colors.tintGreen },
  /** Green corner triangle with a tick, like the real card. */
  tick: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 0,
    height: 0,
    borderTopWidth: 32,
    borderLeftWidth: 32,
    borderTopColor: colors.green,
    borderLeftColor: 'transparent',
  },
  tickIcon: { position: 'absolute', top: -31, right: 2 },
  methodName: { color: colors.text, fontSize: 14, fontWeight: '600', marginTop: 7 },
  methodNameCompact: { fontSize: 13 },
  methodSub: { color: colors.textMuted, fontSize: 12, marginTop: 3 },
}));
