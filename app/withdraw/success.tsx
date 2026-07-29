import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors } from '../../theme/colors';
import { formatKsh } from '../../theme/layout';

/** "25/7/26 at 5:21 PM" — the format used in M-PESA confirmation messages. */
function mpesaDate(iso: string): string {
  const d = new Date(iso);
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = String(d.getFullYear()).slice(2);
  let h = d.getHours();
  const suffix = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} at ${h}:${m} ${suffix}`;
}

export default function SuccessScreen() {
  const router = useRouter();
  const p = useLocalSearchParams<{
    receipt: string;
    agentName: string;
    agentNumber: string;
    amount: string;
    charge: string;
    balanceAfter: string;
    date: string;
  }>();

  const amount = Number(p.amount);
  const charge = Number(p.charge);
  const balanceAfter = Number(p.balanceAfter);
  const when = mpesaDate(p.date);

  const sms =
    `${p.receipt} Confirmed. You have withdrawn ${formatKsh(amount)} from ` +
    `${p.agentName} - ${p.agentNumber} on ${when}. New M-PESA balance is ` +
    `${formatKsh(balanceAfter)}. Transaction cost, ${formatKsh(charge)}. ` +
    `Amount you can transact within the day is 499,000.00.`;

  const Row = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.checkOuter}>
          <View style={styles.checkInner}>
            <Ionicons name="checkmark" size={44} color={colors.black} />
          </View>
        </View>

        <Text style={styles.title}>Withdrawal Successful</Text>
        <Text style={styles.amount}>{formatKsh(amount)}</Text>
        <Text style={styles.subtitle}>from {p.agentName}</Text>

        <View style={styles.card}>
          <Row label="Receipt no." value={p.receipt} />
          <View style={styles.sep} />
          <Row label="Agent number" value={p.agentNumber} />
          <View style={styles.sep} />
          <Row label="Transaction cost" value={formatKsh(charge)} />
          <View style={styles.sep} />
          <Row label="New M-PESA balance" value={formatKsh(balanceAfter)} />
          <View style={styles.sep} />
          <Row label="Date" value={when} />
        </View>

        <View style={styles.smsCard}>
          <Text style={styles.smsHeader}>MPESA</Text>
          <Text style={styles.smsBody}>{sms}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton label="Done" onPress={() => router.replace('/home')} />
        <PrimaryButton
          label="View Statements"
          variant="outline"
          style={styles.secondaryBtn}
          onPress={() => router.replace('/statements')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.screen },
  body: { padding: 16, paddingTop: 32, alignItems: 'center' },
  checkOuter: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(33,192,99,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: colors.text, fontSize: 20, fontWeight: '700', marginTop: 20 },
  amount: { color: colors.green, fontSize: 32, fontWeight: '700', marginTop: 10 },
  subtitle: { color: colors.textMuted, fontSize: 15, marginTop: 6, textAlign: 'center' },
  card: {
    alignSelf: 'stretch',
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginTop: 28,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  rowLabel: { color: colors.textMuted, fontSize: 14.5 },
  rowValue: { color: colors.text, fontSize: 14.5, fontWeight: '500', flexShrink: 1, textAlign: 'right', marginLeft: 12 },
  sep: { height: 1, backgroundColor: colors.divider },
  smsCard: {
    alignSelf: 'stretch',
    backgroundColor: colors.cardAlt,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderLeftWidth: 3,
    borderLeftColor: colors.green,
  },
  smsHeader: { color: colors.green, fontSize: 13, fontWeight: '700', marginBottom: 8, letterSpacing: 0.5 },
  smsBody: { color: colors.text, fontSize: 14, lineHeight: 21 },
  footer: { padding: 16 },
  secondaryBtn: { marginTop: 12 },
});
