import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../components/PayForm';
import { ScreenHeader } from '../components/ScreenHeader';
import { Transaction } from '../services';
import { useAccount } from '../store/AccountContext';
import { colors } from '../theme/colors';
import { formatKsh, layout } from '../theme/layout';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const OPTIONS = [
  { label: 'Export\nStatements', icon: 'share-outline' as const, color: colors.green },
  { label: 'View My Spend', icon: 'pie-chart-outline' as const, color: colors.red },
  { label: 'Statement\nVerification', icon: 'shield-checkmark-outline' as const, color: colors.green },
];

/** "Withdraw from NAIVAS AGENT" → "NAIVAS AGENT": the statement lists who, not what. */
function counterparty(t: Transaction): string {
  return t.title.replace(/^(withdraw from|pay(ment)? to|sent to|send to|received from)\s+/i, '');
}

const monthKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}`;

/** 01 November 2026 */
function dayHeading(d: Date): string {
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** 03:23 PM */
function time(d: Date): string {
  const h = d.getHours() % 12 || 12;
  return `${String(h).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} ${
    d.getHours() >= 12 ? 'PM' : 'AM'
  }`;
}

/** "- KSH. 250.00" / "+ KSH. 1,000.00" */
function amountText(n: number): string {
  return `${n < 0 ? '-' : '+'} ${formatKsh(Math.abs(n), 'KSH.')}`;
}

const TILE_W = (layout.screenWidth - 32 - 20) / 3;

export default function StatementsScreen() {
  const router = useRouter();
  const { transactions } = useAccount();
  const [query, setQuery] = useState('');

  // The current month and the one before it, like the real app's chips.
  const months = useMemo(() => {
    const now = new Date();
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return [prev, now];
  }, []);
  const [month, setMonth] = useState(monthKey(months[1]));

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const out: { day: string; items: Transaction[] }[] = [];
    for (const t of transactions) {
      const d = new Date(t.date);
      if (monthKey(d) !== month) continue;
      if (
        q &&
        !`${counterparty(t)} ${t.subtitle} ${t.receipt}`.toLowerCase().includes(q)
      )
        continue;
      const day = dayHeading(d);
      const last = out[out.length - 1];
      if (last && last.day === day) last.items.push(t);
      else out.push({ day, items: [t] });
    }
    return out;
  }, [transactions, month, query]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="M-PESA Statements" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.section}>Statement Options</Text>
        <View style={styles.options}>
          {OPTIONS.map((o) => (
            <Pressable
              key={o.label}
              style={({ pressed }) => [styles.option, pressed && styles.pressed]}
              onPress={() =>
                router.push({
                  pathname: '/coming-soon',
                  params: { title: o.label.replace('\n', ' ') },
                })
              }
            >
              <Ionicons name={o.icon} size={22} color={o.color} />
              <Text style={styles.optionLabel}>{o.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.search}>
          <View style={styles.searchIcon}>
            <Ionicons name="search" size={16} color={colors.green} />
          </View>
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search"
            placeholderTextColor={colors.textFaint}
          />
        </View>

        <View style={styles.chips}>
          {months.map((m) => {
            const key = monthKey(m);
            const active = key === month;
            return (
              <Pressable
                key={key}
                onPress={() => setMonth(key)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {MONTHS[m.getMonth()]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {groups.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>
              {query ? 'No matching transactions' : 'No transactions this month'}
            </Text>
            <Text style={styles.emptyText}>
              Transactions you make will show up here straight away.
            </Text>
          </View>
        ) : (
          groups.map((g) => (
            <View key={g.day}>
              <Text style={styles.day}>{g.day}</Text>
              {g.items.map((t) => {
                const name = counterparty(t);
                const d = new Date(t.date);
                return (
                  <View key={t.id} style={styles.row}>
                    <Avatar name={name} size={46} />
                    <View style={styles.rowMain}>
                      <Text style={styles.rowTitle} numberOfLines={1}>
                        {name}
                      </Text>
                      <Text style={styles.rowSub} numberOfLines={1}>
                        {t.subtitle}
                      </Text>
                    </View>
                    <View style={styles.rowRight}>
                      <Text style={[styles.rowAmount, t.amount > 0 && styles.rowAmountIn]}>
                        {amountText(t.amount)}
                      </Text>
                      <Text style={styles.rowSub}>{time(d)}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.black },
  scroll: { flex: 1, backgroundColor: colors.screen },
  content: { padding: 16, paddingTop: 8, paddingBottom: 40 },
  section: { color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: 12 },
  options: { flexDirection: 'row', gap: 10 },
  option: {
    width: TILE_W,
    height: 96,
    borderRadius: 12,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  pressed: { opacity: 0.6 },
  optionLabel: { color: colors.text, fontSize: 12.5, textAlign: 'center', marginTop: 8, lineHeight: 16 },

  search: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    marginTop: 18,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: colors.card,
  },
  searchIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.tile,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInput: { flex: 1, color: colors.text, fontSize: 15.5, marginLeft: 10, padding: 0 },

  chips: { flexDirection: 'row', gap: 10, marginTop: 14 },
  chip: { paddingHorizontal: 22, height: 36, borderRadius: 18, justifyContent: 'center', backgroundColor: colors.tile },
  chipActive: { backgroundColor: colors.green },
  chipText: { color: colors.text, fontSize: 14 },
  chipTextActive: { color: colors.black, fontWeight: '600' },

  day: { color: colors.text, fontSize: 16, fontWeight: '600', marginTop: 24, marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
  rowMain: { flex: 1 },
  rowTitle: { color: colors.text, fontSize: 14.5 },
  rowSub: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
  rowRight: { alignItems: 'flex-end' },
  rowAmount: { color: colors.text, fontSize: 14.5 },
  rowAmountIn: { color: colors.green },

  empty: { alignItems: 'center', paddingTop: 50, paddingHorizontal: 30 },
  emptyTitle: { color: colors.text, fontSize: 16, fontWeight: '600' },
  emptyText: { color: colors.textMuted, fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 },
});
