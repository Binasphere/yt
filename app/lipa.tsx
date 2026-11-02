import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AmountField,
  Favourites,
  Field,
  useFieldStyles,
  PaymentMethods,
  usePayStyles,
  Segmented,
  Swoosh,
} from '../components/PayForm';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { QrIcon } from '../components/icons/MpesaIcons';
import { useAccount } from '../store/AccountContext';
import { colors } from '../theme/colors';
import { bongaKsh, formatKsh } from '../theme/layout';

const MODES = [
  ['till', 'Buy Goods'],
  ['paybill', 'Paybill'],
  ['pochi', 'Pochi la Biashara'],
] as const;
type Mode = (typeof MODES)[number][0];

const FAVOURITES: Record<Mode, string[]> = {
  till: ['Naivas', 'Gardens', 'Java House'],
  paybill: ['KPLC Prepaid', 'Nairobi Water', 'DSTV'],
  pochi: ['Mama Mboga', 'Kinyozi'],
};

export default function LipaScreen() {
  const payStyles = usePayStyles();
  const fieldStyles = useFieldStyles();
  const router = useRouter();
  const { balances } = useAccount();
  const [mode, setMode] = useState<Mode>('till');
  const [method, setMethod] = useState('mpesa');
  const [number, setNumber] = useState('');
  const [account, setAccount] = useState('');
  const [raw, setRaw] = useState('');

  const balance = balances?.mpesa ?? 0;
  const fuliza = balances?.fuliza ?? 0;
  const bonga = bongaKsh(balances?.points ?? 0);
  const amount = Number(raw || 0);

  const error = useMemo(() => {
    if (!raw) return null;
    if (amount < 1) return 'The minimum amount is Ksh 1.';
    const limit = method === 'bonga' ? bonga : balance + fuliza;
    if (amount > limit) return 'Amount is more than you have available.';
    return null;
  }, [raw, amount, method, bonga, balance, fuliza]);

  const numberLabel =
    mode === 'till' ? 'till number' : mode === 'paybill' ? 'business number' : 'Pochi number';

  const valid =
    number.length >= 5 && (mode !== 'paybill' || account.length > 0) && amount > 0 && !error;

  const changeMode = (m: Mode) => {
    setMode(m);
    setNumber('');
    setAccount('');
  };

  return (
    <SafeAreaView style={payStyles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Lipa na M-PESA" />
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
          <Segmented options={MODES} value={mode} onChange={changeMode} />
          <Favourites names={FAVOURITES[mode]} />

          <Field
            label={`Enter ${numberLabel}`}
            placeholder={`Enter ${numberLabel}`}
            value={number}
            onChangeText={(t) => setNumber(t.replace(/[^0-9]/g, ''))}
            maxLength={mode === 'pochi' ? 13 : 10}
            keyboardType={mode === 'pochi' ? 'phone-pad' : 'number-pad'}
            right={
              mode === 'pochi' ? (
                <Pressable hitSlop={6} style={fieldStyles.iconBtn}>
                  <Ionicons name="person-circle-outline" size={23} color={colors.green} />
                </Pressable>
              ) : (
                <Pressable hitSlop={6} style={fieldStyles.iconBtn}>
                  <QrIcon size={21} />
                </Pressable>
              )
            }
          />

          {mode === 'paybill' && (
            <Field
              label="Enter account number"
              placeholder="Enter account number"
              value={account}
              onChangeText={setAccount}
              keyboardType="default"
              maxLength={20}
            />
          )}

          <AmountField value={raw} onChange={setRaw} balance={balance} fuliza={fuliza} error={error} />

          <PaymentMethods
            value={method}
            onChange={setMethod}
            methods={[
              {
                key: 'mpesa',
                name: 'M-PESA',
                sub: `Bal. ${formatKsh(balance)}`,
                mark: <Swoosh color={colors.red} />,
              },
              {
                key: 'bonga',
                name: 'Bonga points',
                sub: `Bal. ${formatKsh(bonga)}`,
                mark: <Ionicons name="basket-outline" size={15} color={colors.green} />,
              },
              {
                key: 'shiriki',
                name: 'Shiriki Pay',
                sub: 'Select',
                mark: <Swoosh color={colors.textMuted} />,
              },
            ]}
          />

          <PrimaryButton
            label="Continue"
            disabled={!valid}
            style={payStyles.continue}
            onPress={() =>
              router.push({ pathname: '/coming-soon', params: { title: 'Lipa na M-PESA' } })
            }
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
