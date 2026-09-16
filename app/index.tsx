import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { api } from '../services';
import { linkWithPin, loadToken } from '../services/link';
import { useAccount } from '../store/AccountContext';
import { colors } from '../theme/colors';

const PIN_LENGTH = 4;
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'bio', '0', 'del'];

/** One bounce, per box, offset so the four read as a wave rather than a pulse. */
const BOUNCE_STEP = 220;
const BOUNCE_STAGGER = 110;

/** 0712345678 -> 071*****78 */
function maskPhone(phone: string): string {
  if (phone.length < 5) return phone;
  return `${phone.slice(0, 3)}${'*'.repeat(phone.length - 5)}${phone.slice(-2)}`;
}

function FingerprintIcon({ size = 30 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3.6c-3.2 0-5.8 2.6-5.8 5.8v3.2M12 3.6c3.2 0 5.8 2.6 5.8 5.8v5.4"
        stroke={colors.green}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      <Path
        d="M9.2 9.4a2.8 2.8 0 0 1 5.6 0v6.4M9.2 13v3.6M15.4 18.4a10 10 0 0 1-.4 2M6.6 15.6v1.8"
        stroke={colors.red}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      <Circle cx={12} cy={12.4} r={9.2} stroke={colors.green} strokeWidth={1.3} opacity={0.45} />
    </Svg>
  );
}

export default function LockScreen() {
  const router = useRouter();
  const { profile, loading: profileLoading, refresh } = useAccount();

  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Whether this handset has been bound to an account yet.
   *
   * `null` while storage is still being read — the hint under the boxes says
   * different things either way, and flashing the wrong one for a frame is the
   * kind of detail that makes a demo look unfinished.
   */
  const [linked, setLinked] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    void loadToken().then((token) => {
      if (alive) setLinked(token !== null);
    });
    return () => {
      alive = false;
    };
  }, []);

  /**
   * The wait while the PIN is checked.
   *
   * Nothing else on this screen can move — the keypad is disabled and the boxes
   * are full — so the boxes themselves carry the feedback: they go green and
   * bounce in sequence. It reads as "working", where a spinner under the pad
   * reads as "something went wrong somewhere else".
   */
  const bounces = useRef(
    Array.from({ length: PIN_LENGTH }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    if (!busy) {
      bounces.forEach((value) => value.setValue(0));
      return;
    }

    const cycle = PIN_LENGTH * BOUNCE_STAGGER + BOUNCE_STEP * 2;

    const animations = bounces.map((value, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * BOUNCE_STAGGER),
          Animated.timing(value, {
            toValue: 1,
            duration: BOUNCE_STEP,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: BOUNCE_STEP,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          // Hold still until every box has had its turn, so the wave restarts
          // from the first box each time instead of drifting out of phase.
          Animated.delay(cycle - i * BOUNCE_STAGGER - BOUNCE_STEP * 2),
        ])
      )
    );

    animations.forEach((animation) => animation.start());
    return () => animations.forEach((animation) => animation.stop());
  }, [busy, bounces]);

  /**
   * The PIN does two jobs, and which one depends on whether this phone has
   * been linked before.
   *
   * **Unlinked** — the PIN is an identity. It is the one the admin assigned to
   * a VIP in the Novi console, and the rail exchanges it for a device token
   * that binds this handset to that account. Typed once, kept forever.
   *
   * **Linked** the same PIN now unlocks the app, checked on the device
   * against the one it linked with. It used to accept any four digits, on the
   * reasoning that nothing was being guarded. That stopped being true when
   * each VIP got their own wallet: a phone that opens on 0000 is a phone that
   * shows one customer's balance to whoever picks it up in the room.
   */
  const submit = async (entered: string) => {
    setBusy(true);
    setError(null);

    try {
      if (linked === false) {
        const result = await linkWithPin(entered);
        if (!result.ok) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
          setError(result.reason);
          setPin('');
          setBusy(false);
          return;
        }

        setLinked(true);
        // The account behind the new token has not been read yet; pulling it
        // now means the home screen arrives with real numbers rather than
        // fallback ones that correct themselves a tick later.
        await refresh();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        router.replace('/home');
        return;
      }

      const ok = await api.verifyPin(entered);
      if (ok) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        // `busy` stays set: the boxes keep their green while the home screen
        // takes over, rather than flicking back to grey for a frame.
        router.replace('/home');
        return;
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      setError('Wrong PIN. Please try again.');
      setPin('');
    } catch {
      setError('Could not verify your PIN. Please try again.');
      setPin('');
    }
    setBusy(false);
  };

  const press = (key: string) => {
    if (busy) return;
    Haptics.selectionAsync().catch(() => {});

    if (key === 'del') {
      setPin((p) => p.slice(0, -1));
      return;
    }
    if (key === 'bio') {
      setError('Fingerprint is not available. Enter your PIN.');
      return;
    }

    setPin((p) => {
      if (p.length >= PIN_LENGTH) return p;
      const next = p + key;
      if (next.length === PIN_LENGTH) submit(next);
      return next;
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.top}>
        <Text style={styles.heading}>Enter your M-PESA PIN</Text>

        {/* Before linking there is no customer to name — and the offline
            fallback would otherwise put a fixture's name and number on the
            screen, which reads as the wrong person's phone. */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {linked === false ? '••' : (profile?.initials ?? '--')}
          </Text>
        </View>

        <Text style={styles.name}>
          {linked === false
            ? 'Link this phone'
            : profileLoading && !profile
              ? 'Loading…'
              : `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`.trim()}
        </Text>
        <Text style={styles.phone}>
          {linked === false ? ' ' : profile ? maskPhone(profile.phone) : ' '}
        </Text>

        <View style={styles.notice}>
          <Ionicons name="information-circle" size={20} color={colors.green} />
          <Text style={styles.noticeText}>This app will not use any of your data bundles</Text>
        </View>

        <View style={styles.boxes}>
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.box,
                busy && styles.boxVerifying,
                busy && {
                  transform: [
                    {
                      translateY: bounces[i].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -12],
                      }),
                    },
                    {
                      scale: bounces[i].interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.07],
                      }),
                    },
                  ],
                },
              ]}
            >
              {i < pin.length && (
                <View style={[styles.boxDot, busy && styles.boxDotVerifying]} />
              )}
            </Animated.View>
          ))}
        </View>

        <View style={styles.status}>
          {busy ? (
            <Text style={styles.verifying}>Verifying your PIN…</Text>
          ) : error ? (
            <Text style={styles.error}>{error}</Text>
          ) : linked === false ? (
            <Text style={styles.hint}>Enter your M-PESA PIN to continue</Text>
          ) : (
            <Text style={styles.hint}> </Text>
          )}
        </View>
      </View>

      <View style={styles.pad}>
        {KEYS.map((k) => (
          <Pressable
            key={k}
            style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
            onPress={() => press(k)}
            disabled={busy}
          >
            {k === 'bio' ? (
              <FingerprintIcon />
            ) : k === 'del' ? (
              <Ionicons name="close-circle-outline" size={32} color={colors.green} />
            ) : (
              <Text style={styles.keyText}>{k}</Text>
            )}
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.black },
  top: { alignItems: 'center', paddingTop: 18, paddingHorizontal: 24 },
  heading: { color: colors.text, fontSize: 17, fontWeight: '500' },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#E9C9E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 26,
  },
  avatarText: { color: '#C2489B', fontSize: 19, fontWeight: '700', letterSpacing: 0.5 },
  name: { color: colors.text, fontSize: 19, marginTop: 16 },
  phone: { color: colors.text, fontSize: 16.5, marginTop: 6, letterSpacing: 0.5 },
  notice: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 24 },
  noticeText: { color: colors.text, fontSize: 13, fontWeight: '600' },
  boxes: { flexDirection: 'row', gap: 10, marginTop: 34 },
  box: {
    width: 58,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#8FB6C4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxVerifying: {
    borderColor: colors.green,
    borderWidth: 1.8,
    backgroundColor: 'rgba(33,192,99,0.10)',
  },
  boxDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.text },
  boxDotVerifying: { backgroundColor: colors.green },
  status: { height: 40, justifyContent: 'center', paddingHorizontal: 20 },
  verifying: { color: colors.green, fontSize: 13.5, textAlign: 'center' },
  error: { color: colors.red, fontSize: 14, textAlign: 'center' },
  hint: { color: colors.textFaint, fontSize: 12.5, textAlign: 'center' },
  pad: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    paddingHorizontal: 26,
    paddingBottom: 10,
  },
  key: { width: '33.33%', height: '25%', alignItems: 'center', justifyContent: 'center' },
  keyPressed: { opacity: 0.45 },
  keyText: { color: colors.text, fontSize: 32, fontWeight: '400' },
});
