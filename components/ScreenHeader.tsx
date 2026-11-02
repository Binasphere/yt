import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { themed } from '../theme/ThemeContext';

/** Round back button on the left, title centred — the M-PESA app's sub-page header. */
export function ScreenHeader({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack?: () => void;
  /** Optional action on the right (e.g. "Mark All Read"). */
  right?: React.ReactNode;
}) {
  const styles = useStyles();
  const router = useRouter();
  return (
    <View style={styles.row}>
      <Pressable
        hitSlop={8}
        style={({ pressed }) => [styles.back, pressed && styles.backPressed]}
        onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/home')))}
      >
        <Ionicons name="chevron-back" size={24} color={colors.text} />
      </Pressable>
      {right ? <View style={styles.sideWideLeft} /> : null}
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      {/* Same width either side so the title sits in the true centre. */}
      <View style={[styles.side, right ? styles.sideWide : null]}>{right}</View>
    </View>
  );
}

const useStyles = themed((colors) =>
  StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    backgroundColor: colors.black,
  },
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backPressed: { opacity: 0.6 },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: 19,
    fontWeight: '600',
    textAlign: 'center',
  },
  side: { width: 44, alignItems: 'flex-end' },
  sideWide: { width: 110 },
  sideWideLeft: { width: 66 },
}));
