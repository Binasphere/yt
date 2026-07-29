import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenHeader } from '../../components/ScreenHeader';
import { api, ApiError, DEMO_AGENTS } from '../../services';
import { colors } from '../../theme/colors';

export default function AgentNumberScreen() {
  const router = useRouter();
  const [agentNumber, setAgentNumber] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = agentNumber.length >= 5;

  const next = async () => {
    setBusy(true);
    setError(null);
    try {
      const agent = await api.lookupAgent(agentNumber.trim());
      router.push({
        pathname: '/withdraw/amount',
        params: { agentNumber: agent.agentNumber, agentName: agent.name },
      });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not verify that agent.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Withdraw Money" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Agent Number</Text>
          <TextInput
            style={[styles.input, !!error && styles.inputError]}
            value={agentNumber}
            onChangeText={(t) => {
              setAgentNumber(t.replace(/[^0-9]/g, ''));
              setError(null);
            }}
            placeholder="Enter agent number"
            placeholderTextColor={colors.textFaint}
            keyboardType="number-pad"
            maxLength={10}
            autoFocus
          />
          {error && <Text style={styles.errorText}>{error}</Text>}

          <Text style={styles.hint}>
            Ask the agent for their number, or pick a recent one below.
          </Text>

          <View style={styles.agentList}>
            {DEMO_AGENTS.map((a) => (
              <Pressable
                key={a.number}
                style={({ pressed }) => [styles.agentRow, pressed && styles.agentRowPressed]}
                onPress={() => {
                  setAgentNumber(a.number);
                  setError(null);
                }}
              >
                <View style={styles.agentAvatar}>
                  <Text style={styles.agentAvatarText}>{a.name.slice(0, 1)}</Text>
                </View>
                <View style={styles.flex}>
                  <Text style={styles.agentName}>{a.name}</Text>
                  <Text style={styles.agentNumber}>Agent {a.number}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton label="Continue" onPress={next} disabled={!valid} loading={busy} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.black },
  flex: { flex: 1 },
  body: { padding: 16, paddingTop: 10, backgroundColor: colors.screen, flexGrow: 1 },
  label: { color: colors.textMuted, fontSize: 14, marginBottom: 8 },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.divider,
    paddingHorizontal: 16,
    height: 58,
    color: colors.text,
    fontSize: 20,
    letterSpacing: 1.5,
  },
  inputError: { borderColor: colors.red },
  errorText: { color: colors.red, fontSize: 14, marginTop: 8 },
  hint: { color: colors.textMuted, fontSize: 14, marginTop: 18, lineHeight: 20 },
  agentList: { marginTop: 12, gap: 2 },
  agentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  agentRowPressed: { opacity: 0.6 },
  agentAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.tile,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agentAvatarText: { color: colors.green, fontSize: 18, fontWeight: '700' },
  agentName: { color: colors.text, fontSize: 16 },
  agentNumber: { color: colors.textMuted, fontSize: 13.5, marginTop: 2 },
  footer: { padding: 16, backgroundColor: colors.screen },
});
