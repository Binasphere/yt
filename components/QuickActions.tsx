import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  AirtimeIcon,
  BuyBundlesIcon,
  HomeInternetIcon,
  InternationalIcon,
  LipaNaMpesaIcon,
  SendMoneyIcon,
  TunukiwaIcon,
  WithdrawIcon,
} from './icons/MpesaIcons';
import { colors } from '../theme/colors';

type Action = {
  key: string;
  label: string;
  Icon: React.ComponentType<{ size?: number }>;
  route?: string;
};

const ACTIONS: Action[] = [
  { key: 'send', label: 'Send\nMoney', Icon: SendMoneyIcon },
  { key: 'lipa', label: 'Lipa na\nM-PESA', Icon: LipaNaMpesaIcon },
  { key: 'withdraw', label: 'Withdraw\nMoney', Icon: WithdrawIcon, route: '/withdraw' },
  { key: 'bundles', label: 'Buy\nBundles', Icon: BuyBundlesIcon },
  { key: 'intl', label: 'International\nTransfers', Icon: InternationalIcon },
  { key: 'airtime', label: 'Airtime\nTop Up', Icon: AirtimeIcon },
  { key: 'tunukiwa', label: 'Tunukiwa\nBundles', Icon: TunukiwaIcon },
  { key: 'home', label: 'Home\nInternet', Icon: HomeInternetIcon },
];

export function QuickActions() {
  const router = useRouter();

  const open = (action: Action) => {
    router.push(
      action.route
        ? (action.route as never)
        : ({ pathname: '/coming-soon', params: { title: action.label.replace('\n', ' ') } } as never)
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Quick Actions</Text>
        <Pressable style={styles.viewAll} hitSlop={8}>
          <Text style={styles.viewAllText}>View all</Text>
          <Ionicons name="chevron-forward" size={17} color={colors.green} />
        </Pressable>
      </View>

      <View style={styles.grid}>
        {ACTIONS.map((a) => (
          <Pressable
            key={a.key}
            style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
            onPress={() => open(a)}
          >
            <View style={styles.circle}>
              <a.Icon size={26} />
            </View>
            <Text style={styles.itemLabel}>{a.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingTop: 18,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginBottom: 14,
  },
  title: { color: colors.text, fontSize: 18, fontWeight: '700' },
  viewAll: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  viewAllText: { color: colors.green, fontSize: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  item: { width: '25%', alignItems: 'center', paddingVertical: 10 },
  itemPressed: { opacity: 0.6 },
  circle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.tile,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: {
    color: colors.text,
    fontSize: 13.5,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 8,
  },
});
