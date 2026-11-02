import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AmountField,
  Favourites,
  Field,
  fieldStyles,
  PaymentMethods,
  payStyles,
  Segmented,
  Swoosh,
} from '../components/PayForm';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { QrIcon } from '../components/icons/MpesaIcons';
import { useAccount } from '../store/AccountContext';
import { colors } from '../theme/colors';
import { formatKsh } from '../theme/layout';

const MODES = [
  ['mobile', 'Mobile number'],
  ['pochi', 'Pochi la Biashara'],
] as const;
type Mode = (typeof MODES)[number][0];

const FAVOURITES = ['Mama', 'John Kamau', 'Faith', 'Brian'];

const DO_MORE = [
  { icon: 'people-outline' as const, label: 'Send to\nMany' },
  { icon: 'cash-outline' as const, label: 'Request\nMoney' },
  { icon: 'trending-up-outline' as const, label: 'Invest to\nZiiDi' },
];

/** A Kenyan mobile number: 07XXXXXXXX / 01XXXXXXXX, or 2547…/2541… */
function isValidPhone(raw: string): boolean {
  const d = raw.replace(/\D/g, '');
  return /^0[17]\d{8}$/.test(d) || /^254[17]\d{8}$/.test(d);
}

export default function SendMoneyScreen() {
  const router = useRouter();
  const { balances } = useAccount();
  const [mode, setMode] = useState<Mode>('mobile');
  const [method, setMethod] = useState('mpesa');
  const [phone, setPhone] = useState('');
  const [raw, setRaw] = useState('');

  const balance = balances?.mpesa ?? 0;
  const fuliza = balances?.fuliza ?? 0;
  const amount = Number(raw || 0);

  const error = useMemo(() => {
    if (!raw) return null;
    if (amount < 1) return 'The minimum amount is Ksh 1.';
    if (amount > balance + fuliza) return 'Amount is more than your balance and Fuliza limit.';
    return null;
  }, [raw, amount, balance, fuliza]);

  const valid = isValidPhone(phone) && amount > 0 && !error;
  const soon = (title: string) => router.push({ pathname: '/coming-soon', params: { title } });

  return (
    <SafeAreaView style={payStyles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Send Money" />
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
          <Segmented options={MODES} value={mode} onChange={setMode} />
          <Favourites names={FAVOURITES} />

          <Field
            label={mode === 'mobile' ? 'Enter phone number' : 'Enter Pochi number'}
            placeholder={mode === 'mobile' ? 'Enter phone number' : 'Enter Pochi number'}
            value={phone}
            onChangeText={(t) => setPhone(t.replace(/[^0-9+]/g, ''))}
            keyboardType="phone-pad"
            maxLength={13}
            right={
              <>
                <Pressable hitSlop={6} style={fieldStyles.iconBtn}>
                  <Ionicons name="person-circle-outline" size={23} color={colors.green} />
                </Pressable>
                <View style={fieldStyles.divider} />
                <Pressable hitSlop={6} style={fieldStyles.iconBtn}>
                  <QrIcon size={21} />
                </Pressable>
              </>
            }
          />

          <AmountField value={raw} onChange={setRaw} balance={balance} fuliza={fuliza} error={error} />

          <PaymentMethods
            value={method}
            onChange={setMethod}
            methods={[
              { key: 'mpesa', name: 'M-PESA', sub: `Bal. ${formatKsh(balance)}`, mark: <Swoosh color={colors.red} /> },
              { key: 'shiriki', name: 'Shiriki Pay', sub: 'Select', mark: <Swoosh color={colors.textMuted} /> },
            ]}
          />

          <PrimaryButton
            label="Continue"
            disabled={!valid}
            style={payStyles.continue}
            onPress={() => soon('Send Money')}
          />

          <Text style={[payStyles.sectionTitle, styles.doMore]}>Do More</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {DO_MORE.map((d) => (
              <Pressable
                key={d.label}
                style={styles.doCard}
                onPress={() => soon(d.label.replace('\n', ' '))}
              >
                <View style={styles.doCircle}>
                  <Ionicons name={d.icon} size={19} color={colors.green} />
                </View>
                <Text style={styles.doLabel}>{d.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  doMore: { marginTop: 28, marginBottom: 12 },
  doCard: {
    width: 104,
    paddingVertical: 13,
    marginRight: 10,
    borderRadius: 12,
    backgroundColor: colors.card,
    alignItems: 'center',
  },
  doCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.tile,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doLabel: { color: colors.text, fontSize: 13, textAlign: 'center', marginTop: 8, lineHeight: 17 },
});
