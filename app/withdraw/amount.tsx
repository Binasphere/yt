import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenHeader } from '../../components/ScreenHeader';
import { useAccount } from '../../store/AccountContext';
import { colors } from '../../theme/colors';
import { formatKsh } from '../../theme/layout';

export default function AmountScreen() {
  const router = useRouter();
  const { agentNumber, agentName } = useLocalSearchParams<{
    agentNumber: string;
    agentName: string;
  }>();
  const { balances } = useAccount();
  const [raw, setRaw] = useState('');

  const amount = Number(raw || 0);
  const available = balances?.mpesa ?? 0;

  const error = useMemo(() => {
    if (!raw) return null;
    if (amount < 50) return 'The minimum withdrawal amount is Ksh 50.';
    if (amount > available) return 'Amount is more than your available balance.';
    return null;
  }, [raw, amount, available]);

  const valid = !!raw && !error;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Withdraw Money" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.body}>
          <View style={styles.agentCard}>
            <Text style={styles.agentLabel}>Withdrawing from</Text>
            <Text style={styles.agentName}>{agentName}</Text>
            <Text style={styles.agentNumber}>Agent {agentNumber}</Text>
          </View>

          <Text style={styles.label}>Enter Amount</Text>
          <View style={[styles.amountBox, !!error && styles.amountBoxError]}>
            <Text style={styles.currency}>Ksh</Text>
            <TextInput
              style={styles.amountInput}
              value={raw}
              onChangeText={(t) => setRaw(t.replace(/[^0-9]/g, ''))}
              placeholder="0"
              placeholderTextColor={colors.textFaint}
              keyboardType="number-pad"
              maxLength={7}
              autoFocus
            />
          </View>

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <Text style={styles.available}>Available balance: {formatKsh(available)}</Text>
          )}
        </View>

        <View style={styles.footer}>
          <PrimaryButton
            label="Continue"
            disabled={!valid}
            onPress={() =>
              router.push({
                pathname: '/withdraw/confirm',
                params: { agentNumber, agentName, amount: String(amount) },
              })
            }
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.black },
  flex: { flex: 1 },
  body: { flex: 1, padding: 16, paddingTop: 10, backgroundColor: colors.screen },
  agentCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 26,
  },
  agentLabel: { color: colors.textMuted, fontSize: 13.5 },
  agentName: { color: colors.text, fontSize: 17, fontWeight: '600', marginTop: 6 },
  agentNumber: { color: colors.textMuted, fontSize: 14, marginTop: 3 },
  label: { color: colors.textMuted, fontSize: 14, marginBottom: 10 },
  amountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: colors.green,
    paddingBottom: 8,
    gap: 10,
  },
  amountBoxError: { borderBottomColor: colors.red },
  currency: { color: colors.textMuted, fontSize: 24 },
  amountInput: { flex: 1, color: colors.text, fontSize: 34, fontWeight: '700', padding: 0 },
  errorText: { color: colors.red, fontSize: 14, marginTop: 12 },
  available: { color: colors.textMuted, fontSize: 14, marginTop: 12 },
  footer: { padding: 16, backgroundColor: colors.screen },
});
