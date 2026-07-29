import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PinPad } from '../../components/PinPad';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenHeader } from '../../components/ScreenHeader';
import { api, ApiError, DEMO_PIN, withdrawalCharge } from '../../services';
import { useAccount } from '../../store/AccountContext';
import { colors } from '../../theme/colors';
import { formatKsh } from '../../theme/layout';

export default function ConfirmScreen() {
  const router = useRouter();
  const { refresh } = useAccount();
  const { agentNumber, agentName, amount } = useLocalSearchParams<{
    agentNumber: string;
    agentName: string;
    amount: string;
  }>();

  const value = Number(amount);
  const charge = withdrawalCharge(value);

  const [pinOpen, setPinOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (entered: string) => {
    setBusy(true);
    setError(null);
    try {
      const result = await api.withdraw({ agentNumber, amount: value, pin: entered });
      await refresh();
      setPinOpen(false);
      setPin('');
      router.replace({
        pathname: '/withdraw/success',
        params: {
          receipt: result.receipt,
          agentName: result.agentName,
          agentNumber,
          amount: String(result.amount),
          charge: String(result.charge),
          balanceAfter: String(result.balanceAfter),
          date: result.date,
        },
      });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Transaction failed. Please try again.');
      setPin('');
    } finally {
      setBusy(false);
    }
  };

  const Row = ({ label, value: v, strong }: { label: string; value: string; strong?: boolean }) => (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, strong && styles.rowValueStrong]}>{v}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Confirm Withdrawal" />

      <View style={styles.body}>
        <View style={styles.card}>
          <Row label="Agent" value={agentName} />
          <View style={styles.sep} />
          <Row label="Agent number" value={agentNumber} />
          <View style={styles.sep} />
          <Row label="Amount" value={formatKsh(value)} />
          <View style={styles.sep} />
          <Row label="Transaction cost" value={formatKsh(charge)} />
          <View style={styles.sep} />
          <Row label="Total" value={formatKsh(value + charge)} strong />
        </View>

        <Text style={styles.note}>
          You will receive an M-PESA confirmation SMS once the withdrawal is complete.
        </Text>
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          label="Confirm"
          onPress={() => {
            setError(null);
            setPin('');
            setPinOpen(true);
          }}
        />
      </View>

      <Modal visible={pinOpen} animationType="slide" transparent onRequestClose={() => setPinOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.sheet}>
            <View style={styles.grabber} />
            <Text style={styles.sheetTitle}>Enter M-PESA PIN</Text>
            <Text style={styles.sheetSub}>
              Withdraw {formatKsh(value)} from {agentName}
            </Text>

            <View style={styles.pinWrap}>
              <PinPad value={pin} onChange={setPin} onComplete={submit} />
            </View>

            {busy && <Text style={styles.processing}>Processing…</Text>}
            {error && <Text style={styles.errorText}>{error}</Text>}

            <Text style={styles.demoHint}>Demo PIN: {DEMO_PIN}</Text>

            <Pressable style={styles.cancel} onPress={() => setPinOpen(false)} disabled={busy}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.black },
  body: { flex: 1, padding: 16, paddingTop: 10, backgroundColor: colors.screen },
  card: { backgroundColor: colors.card, borderRadius: 16, paddingHorizontal: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15 },
  rowLabel: { color: colors.textMuted, fontSize: 15 },
  rowValue: { color: colors.text, fontSize: 15.5, fontWeight: '500', flexShrink: 1, textAlign: 'right' },
  rowValueStrong: { color: colors.green, fontSize: 17, fontWeight: '700' },
  sep: { height: 1, backgroundColor: colors.divider },
  note: { color: colors.textMuted, fontSize: 13.5, lineHeight: 20, marginTop: 18 },
  footer: { padding: 16, backgroundColor: colors.screen },

  modalBackdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.cardAlt,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 28,
  },
  grabber: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.divider,
    marginBottom: 18,
  },
  sheetTitle: { color: colors.text, fontSize: 19, fontWeight: '700', textAlign: 'center' },
  sheetSub: { color: colors.textMuted, fontSize: 14, textAlign: 'center', marginTop: 6 },
  pinWrap: { marginTop: 26 },
  processing: { color: colors.green, textAlign: 'center', fontSize: 14, marginTop: 6 },
  errorText: { color: colors.red, textAlign: 'center', fontSize: 14, marginTop: 6, lineHeight: 20 },
  demoHint: { color: colors.textFaint, textAlign: 'center', fontSize: 12.5, marginTop: 10 },
  cancel: { alignSelf: 'center', paddingVertical: 14, paddingHorizontal: 24 },
  cancelText: { color: colors.textMuted, fontSize: 16 },
});
