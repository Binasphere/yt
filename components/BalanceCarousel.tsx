import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { EyeOffIcon } from './icons/MpesaIcons';
import { colors } from '../theme/colors';
import { formatKsh, layout } from '../theme/layout';

const CARD_W = layout.balanceCardWidth;
const SNAP = CARD_W + layout.balanceCardGap;

/** Faint polygonal line pattern printed on the real balance card. */
function CardPattern() {
  return (
    <Svg style={StyleSheet.absoluteFill} viewBox="0 0 300 170" preserveAspectRatio="xMidYMid slice">
      <Path
        d="M150 -20 L300 60 M180 -20 L300 110 M120 190 L300 20 M210 190 L300 130 M240 -20 L300 10 M160 40 L300 170 M255 45 L300 45 M230 90 L300 75"
        stroke={colors.green}
        strokeWidth={0.9}
        opacity={0.22}
        fill="none"
      />
    </Svg>
  );
}

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <LinearGradient
        colors={[colors.greenBright, colors.green, colors.blue]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.edge}
      />
      <View style={styles.cardInner}>
        <CardPattern />
        <View style={styles.cardContent}>{children}</View>
      </View>
    </View>
  );
}

type Props = {
  mpesa: number;
  fuliza: number;
  airtime: number;
  points: number;
  hidden: boolean;
  onToggleHidden(): void;
};

export function BalanceCarousel({ mpesa, fuliza, airtime, points, hidden, onToggleHidden }: Props) {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / SNAP);
    if (next !== page) setPage(next);
  };

  const mask = '••••••';

  return (
    <View>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SNAP}
        decelerationRate="fast"
        contentContainerStyle={styles.track}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <CardShell>
          <Text style={styles.label}>M-PESA Balance</Text>
          <View style={styles.amountRow}>
            <Text style={styles.amount}>{hidden ? `Ksh ${mask}` : formatKsh(mpesa)}</Text>
            <Pressable onPress={onToggleHidden} hitSlop={12} style={styles.eye}>
              <EyeOffIcon size={21} />
            </Pressable>
          </View>
          <Text style={styles.sub}>
            Available Fuliza: {hidden ? `Ksh ${mask}` : formatKsh(fuliza)}
          </Text>
          <Pressable style={styles.outlineBtn} onPress={() => router.push('/statements')}>
            <Text style={styles.outlineBtnText}>View Statements</Text>
          </Pressable>
        </CardShell>

        <CardShell>
          <Text style={styles.label}>My Balances</Text>
          <Text style={styles.sub}>Airtime</Text>
          <View style={styles.amountRow}>
            <Text style={styles.amount}>{hidden ? `Ksh. ${mask}` : formatKsh(airtime, 'Ksh.')}</Text>
          </View>
          <Pressable style={styles.outlineBtn}>
            <Text style={styles.outlineBtnText}>Bonga Points: {points}</Text>
          </Pressable>
        </CardShell>
      </ScrollView>

      <View style={styles.dots}>
        {[0, 1].map((i) => (
          <View key={i} style={[styles.dot, page === i ? styles.dotActive : styles.dotIdle]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { paddingHorizontal: 16, gap: layout.balanceCardGap },
  card: {
    width: CARD_W,
    flexDirection: 'row',
    borderRadius: 14,
    overflow: 'hidden',
  },
  edge: { width: 5 },
  cardInner: { flex: 1, backgroundColor: colors.card, overflow: 'hidden' },
  cardContent: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 14 },
  label: { color: colors.green, fontSize: 15, fontWeight: '600' },
  amountRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  amount: { color: colors.text, fontSize: 29, fontWeight: '700', letterSpacing: -0.2 },
  eye: { marginLeft: 14 },
  sub: { color: colors.textMuted, fontSize: 15, marginTop: 5 },
  outlineBtn: {
    marginTop: 12,
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineBtnText: { color: colors.green, fontSize: 16.5, fontWeight: '500' },
  dots: {
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 6,
    marginTop: 14,
    marginBottom: 4,
  },
  dot: { height: 5, borderRadius: 3 },
  dotActive: { width: 26, backgroundColor: colors.green },
  dotIdle: { width: 14, backgroundColor: '#5A6472' },
});
