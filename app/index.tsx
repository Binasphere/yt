import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { api, DEMO_PIN } from '../services';
import { useAccount } from '../store/AccountContext';
import { colors } from '../theme/colors';

const PIN_LENGTH = 4;
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'bio', '0', 'del'];

/** 0700123484 -> 070*****84 */
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
  const { profile, loading: profileLoading } = useAccount();

  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (entered: string) => {
    setBusy(true);
    setError(null);
    try {
      const ok = await api.verifyPin(entered);
      if (ok) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        router.replace('/home');
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        setError('Wrong PIN. Please try again.');
        setPin('');
      }
    } catch {
      setError('Could not verify your PIN. Please try again.');
      setPin('');
    } finally {
      setBusy(false);
    }
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

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{profile?.initials ?? '--'}</Text>
        </View>

        <Text style={styles.name}>
          {profileLoading && !profile
            ? 'Loading…'
            : `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`.trim()}
        </Text>
        <Text style={styles.phone}>{profile ? maskPhone(profile.phone) : ' '}</Text>

        <View style={styles.notice}>
          <Ionicons name="information-circle" size={20} color={colors.green} />
          <Text style={styles.noticeText}>This app will not use any of your data bundles</Text>
        </View>

        <View style={styles.boxes}>
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <View key={i} style={styles.box}>
              {i < pin.length && <View style={styles.boxDot} />}
            </View>
          ))}
        </View>

        <View style={styles.status}>
          {busy ? (
            <ActivityIndicator color={colors.green} />
          ) : error ? (
            <Text style={styles.error}>{error}</Text>
          ) : (
            <Text style={styles.demoHint}>Demo PIN: {DEMO_PIN}</Text>
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
  boxDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.text },
  status: { height: 40, justifyContent: 'center', paddingHorizontal: 20 },
  error: { color: colors.red, fontSize: 14, textAlign: 'center' },
  demoHint: { color: colors.textFaint, fontSize: 12.5, textAlign: 'center' },
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
