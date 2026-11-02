import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../components/ScreenHeader';
import { Transaction } from '../services';
import { useAccount } from '../store/AccountContext';
import { colors } from '../theme/colors';
import { formatKsh } from '../theme/layout';
import { themed } from '../theme/ThemeContext';

const TABS = ['Transaction', 'Promotions', 'System'] as const;
type Tab = (typeof TABS)[number];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Receipts already read this session. Module-level so leaving the screen and
 * coming back keeps them read; a fresh launch starts everything unread again.
 */
const readIds = new Set<string>();

function body(t: Transaction): string {
  const verb = t.amount < 0 ? 'sent' : 'received';
  return `#${t.receipt} confirmed. ${formatKsh(Math.abs(t.amount))} has been ${verb} successfully`;
}

function shortDate(iso: string): string {
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export default function NotificationsScreen() {
  const styles = useStyles();
  const { transactions } = useAccount();
  const [tab, setTab] = useState<Tab>('Transaction');
  const [, bump] = useState(0);

  const markRead = (ids: string[]) => {
    ids.forEach((id) => readIds.add(id));
    bump((n) => n + 1);
  };

  const data = tab === 'Transaction' ? transactions : [];

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader
        title="Notifications"
        right={
          <Pressable
            style={({ pressed }) => [styles.markAll, pressed && styles.pressed]}
            onPress={() => markRead(transactions.map((t) => t.id))}
          >
            <Text style={styles.markAllText}>Mark All Read</Text>
          </Pressable>
        }
      />

      <View style={styles.tabs}>
        {TABS.map((t) => {
          const active = t === tab;
          return (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              style={[styles.tab, active && styles.tabActive]}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{t}</Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={data}
        keyExtractor={(t) => t.id}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={34} color={colors.textFaint} />
            <Text style={styles.emptyText}>No {tab.toLowerCase()} notifications yet</Text>
          </View>
        }
        renderItem={({ item }) => {
          const unread = !readIds.has(item.id);
          return (
            <Pressable style={styles.item} onPress={() => markRead([item.id])}>
              {unread && <View style={styles.dot} />}
              <View style={styles.icon}>
                <Ionicons name="checkmark-circle-outline" size={24} color={colors.green} />
              </View>
              <View style={styles.main}>
                <View style={styles.titleRow}>
                  <Text style={styles.title}>Payment Successful</Text>
                  <Text style={styles.date}>{shortDate(item.date)}</Text>
                </View>
                <Text style={styles.body}>{body(item)}</Text>
              </View>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

const useStyles = themed((colors) =>
  StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.black },
  pressed: { opacity: 0.6 },
  markAll: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.cardAlt,
    justifyContent: 'center',
  },
  markAllText: { color: colors.green, fontSize: 13 },

  tabs: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 14,
    backgroundColor: colors.screen,
  },
  tab: {
    height: 36,
    paddingHorizontal: 18,
    borderRadius: 18,
    justifyContent: 'center',
    backgroundColor: colors.tile,
  },
  tabActive: { backgroundColor: colors.green },
  tabText: { color: colors.text, fontSize: 14 },
  tabTextActive: { color: colors.onGreen, fontWeight: '600' },

  list: { flex: 1, backgroundColor: colors.screen },
  listContent: { paddingHorizontal: 16, paddingBottom: 40, gap: 10, flexGrow: 1 },
  item: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    paddingLeft: 16,
  },
  dot: {
    position: 'absolute',
    top: 4,
    left: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.green,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.tile,
    alignItems: 'center',
    justifyContent: 'center',
  },
  main: { flex: 1, marginLeft: 12 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { color: colors.text, fontSize: 15.5, fontWeight: '600', flex: 1 },
  date: { color: colors.textMuted, fontSize: 12.5, marginLeft: 8 },
  body: { color: colors.textMuted, fontSize: 13, lineHeight: 18, marginTop: 5 },

  empty: { alignItems: 'center', paddingTop: 90, gap: 12 },
  emptyText: { color: colors.textMuted, fontSize: 14 },
}));
