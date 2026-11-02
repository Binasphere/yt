import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AmountField, Field, fieldStyles, payStyles, Segmented } from '../../components/PayForm';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenHeader } from '../../components/ScreenHeader';
import { QrIcon } from '../../components/icons/MpesaIcons';
import { api, ApiError, withdrawalCharge } from '../../services';
import { useAccount } from '../../store/AccountContext';
import { colors } from '../../theme/colors';

const MODES = [
  ['agent', 'At Agent'],
  ['atm', 'From ATM'],
  ['ziidi', 'From Ziidi'],
] as const;
type Mode = (typeof MODES)[number][0];

/**
 * Withdraw money, one screen like the real app: agent, store, amount. The
 * agent is looked up on Continue, and the confirm screen takes it from there
 * (cost breakdown → PIN → receipt).
 */
export default function WithdrawScreen() {
  const router = useRouter();
  const { balances } = useAccount();
  const [mode, setMode] = useState<Mode>('agent');
  const [agentNumber, setAgentNumber] = useState('');
  const [store, setStore] = useState('');
  const [raw, setRaw] = useState('');
  const [busy, setBusy] = useState(false);
  const [agentError, setAgentError] = useState<string | null>(null);

  const balance = balances?.mpesa ?? 0;
  const fuliza = balances?.fuliza ?? 0;
  const amount = Number(raw || 0);

  const amountError = useMemo(() => {
    if (!raw) return null;
    if (amount < 50) return 'The minimum withdrawal amount is Ksh 50.';
    if (amount + withdrawalCharge(amount) > balance)
      return 'Amount plus charges is more than your balance.';
    return null;
  }, [raw, amount, balance]);

  const valid = agentNumber.length >= 5 && store.length > 0 && amount > 0 && !amountError;

  const next = async () => {
    setBusy(true);
    setAgentError(null);
    try {
      const agent = await api.lookupAgent(agentNumber.trim());
      router.push({
        pathname: '/withdraw/confirm',
        params: { agentNumber: agent.agentNumber, agentName: agent.name, amount: String(amount) },
      });
    } catch (e) {
      setAgentError(e instanceof ApiError ? e.message : 'Could not verify that agent.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={payStyles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Withdraw money" />
      <KeyboardAvoidingView
        style={payStyles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={payStyles.scroll}
          contentContainerStyle={payStyles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Segmented
            options={MODES}
            value={mode}
            onChange={(m) =>
              m === 'agent'
                ? setMode(m)
                : router.push({
                    pathname: '/coming-soon',
                    params: { title: m === 'atm' ? 'Withdraw from ATM' : 'Withdraw from Ziidi' },
                  })
            }
          />

          <View style={styles.spacer} />

          <Field
            label="Enter agent number"
            placeholder="Enter agent number"
            value={agentNumber}
            onChangeText={(t) => {
              setAgentNumber(t.replace(/[^0-9]/g, ''));
              setAgentError(null);
            }}
            maxLength={10}
            error={!!agentError}
            right={
              <Pressable hitSlop={6} style={fieldStyles.iconBtn}>
                <QrIcon size={21} />
              </Pressable>
            }
          />
          {agentError && <Text style={styles.errorText}>{agentError}</Text>}

          <Field
            label="Enter store number"
            placeholder="Enter store number"
            value={store}
            onChangeText={(t) => setStore(t.replace(/[^0-9]/g, ''))}
            maxLength={10}
          />

          <AmountField
            value={raw}
            onChange={setRaw}
            balance={balance}
            fuliza={fuliza}
            error={amountError}
          />

          <PrimaryButton
            label="Continue"
            disabled={!valid}
            loading={busy}
            style={styles.continue}
            onPress={next}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  spacer: { height: 10 },
  errorText: { color: colors.red, fontSize: 13, marginTop: 8 },
  continue: { marginTop: 44, height: 48 },
});
