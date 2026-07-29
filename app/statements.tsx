import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WithdrawIcon } from '../components/icons/MpesaIcons';
import { ScreenHeader } from '../components/ScreenHeader';
import { useAccount } from '../store/AccountContext';
import { colors } from '../theme/colors';
import { formatKsh } from '../theme/layout';

function shortDate(iso: string): string {
  const d = new Date(iso);
  let h = d.getHours();
  const suffix = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${d.getDate()}/${d.getMonth() + 1}/${String(d.getFullYear()).slice(2)}, ${h}:${String(
    d.getMinutes()
  ).padStart(2, '0')} ${suffix}`;
}

export default function StatementsScreen() {
  const { transactions, balances } = useAccount();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="M-PESA Statement" />

      <View style={styles.summary}>
        <Text style={styles.summaryLabel}>Current balance</Text>
        <Text style={styles.summaryValue}>{formatKsh(balances?.mpesa ?? 0)}</Text>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No transactions yet</Text>
            <Text style={styles.emptyText}>
              Complete a withdrawal and it will show up here straight away.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.icon}>
              <WithdrawIcon size={22} />
            </View>
            <View style={styles.rowMain}>
              <Text style={styles.rowTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.rowSub}>
                {item.receipt} · {shortDate(item.date)}
              </Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.rowAmount}>{formatKsh(item.amount)}</Text>
              <Text style={styles.rowBalance}>Bal {formatKsh(item.balanceAfter)}</Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.black },
  summary: {
    backgroundColor: colors.screen,
    paddingHorizontal: 16,
    paddingBottom: 18,
  },
  summaryLabel: { color: colors.textMuted, fontSize: 14 },
  summaryValue: { color: colors.text, fontSize: 26, fontWeight: '700', marginTop: 4 },
  list: { paddingHorizontal: 16, paddingBottom: 32, backgroundColor: colors.screen, flexGrow: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.tile,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowMain: { flex: 1 },
  rowTitle: { color: colors.text, fontSize: 15.5, fontWeight: '500' },
  rowSub: { color: colors.textMuted, fontSize: 12.5, marginTop: 3 },
  rowRight: { alignItems: 'flex-end' },
  rowAmount: { color: colors.red, fontSize: 15, fontWeight: '600' },
  rowBalance: { color: colors.textMuted, fontSize: 12, marginTop: 3 },
  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 30 },
  emptyTitle: { color: colors.text, fontSize: 17, fontWeight: '600' },
  emptyText: { color: colors.textMuted, fontSize: 14.5, textAlign: 'center', marginTop: 8, lineHeight: 21 },
});
