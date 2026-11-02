import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { LayoutAnimation, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../components/ScreenHeader';
import { useAccount } from '../store/AccountContext';
import { colors } from '../theme/colors';
import { bongaKsh, formatKsh } from '../theme/layout';
import { themed } from '../theme/ThemeContext';

/** 0712345678 → 254712345678, the way this page prints the line. */
function intlPhone(phone: string): string {
  const d = phone.replace(/\D/g, '');
  return d.startsWith('0') ? `254${d.slice(1)}` : d;
}

type IconName = React.ComponentProps<typeof Ionicons>['name'];

function BalanceCard({
  icon,
  iconColor,
  title,
  value,
  detail,
}: {
  icon: IconName;
  iconColor: string;
  title: string;
  value: string;
  detail: string;
}) {
  const styles = useStyles();
  const [open, setOpen] = useState(false);
  return (
    <Pressable
      style={styles.card}
      onPress={() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setOpen((o) => !o);
      }}
    >
      <View style={styles.cardTop}>
        <View style={styles.cardIcon}>
          <Ionicons name={icon} size={14} color={iconColor} />
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={20} color={colors.text} />
      </View>
      <Text style={styles.cardValue}>{value}</Text>
      {open && <Text style={styles.cardDetail}>{detail}</Text>}
    </Pressable>
  );
}

export default function BalancesScreen() {
  const styles = useStyles();
  const { profile, balances } = useAccount();
  const airtime = balances?.airtime ?? 0;
  const points = balances?.points ?? 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Balances" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.line}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profile?.initials ?? '--'}</Text>
          </View>
          <View>
            <Text style={styles.lineTitle}>Prepaid</Text>
            <Text style={styles.linePhone}>{profile ? intlPhone(profile.phone) : ''}</Text>
          </View>
        </View>

        <BalanceCard
          icon="call-outline"
          iconColor={colors.green}
          title="Airtime"
          value={formatKsh(airtime)}
          detail="Main airtime balance. Top up from the Airtime Top Up tile on the home screen."
        />
        <BalanceCard
          icon="basket-outline"
          iconColor={colors.green}
          title="Bonga"
          value={`Ksh. ${bongaKsh(points)} (worth ${points} points)`}
          detail="Redeem Bonga points for airtime, bundles or Lipa na M-PESA payments."
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const useStyles = themed((colors) =>
  StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.black },
  scroll: { flex: 1, backgroundColor: colors.screen },
  content: { padding: 16, paddingTop: 10, gap: 14 },

  line: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    borderRadius: 16,
    backgroundColor: colors.tintGreen,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.green, fontSize: 16, fontWeight: '700' },
  lineTitle: { color: colors.text, fontSize: 16, fontWeight: '600' },
  linePhone: { color: colors.text, fontSize: 14, marginTop: 4 },

  card: { backgroundColor: colors.card, borderRadius: 14, padding: 16 },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  cardIcon: {
    width: 22,
    height: 22,
    borderRadius: 5,
    backgroundColor: colors.tile,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { flex: 1, color: colors.text, fontSize: 14.5, marginLeft: 12 },
  cardValue: { color: colors.text, fontSize: 18, fontWeight: '600', marginTop: 14 },
  cardDetail: { color: colors.textMuted, fontSize: 13, lineHeight: 19, marginTop: 10 },
}));
