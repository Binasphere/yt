import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../components/ScreenHeader';
import { ThemeSheet } from '../components/ThemeSheet';
import { useAccount } from '../store/AccountContext';
import { colors } from '../theme/colors';
import { layout } from '../theme/layout';
import { themed } from '../theme/ThemeContext';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
type Tile = { label: string; icon: IconName; color: 'green' | 'red' };

const QUICK_CARE: Tile[] = [
  { label: 'Security Center', icon: 'shield-outline', color: 'green' },
  { label: 'Get Puk', icon: 'lock-closed-outline', color: 'red' },
  { label: 'Report Fraud', icon: 'warning-outline', color: 'green' },
  { label: 'Check My Usage', icon: 'pie-chart-outline', color: 'green' },
  { label: 'Request e-SIM', icon: 'phone-portrait-outline', color: 'red' },
  { label: 'My Subscriptions', icon: 'calendar-outline', color: 'green' },
  { label: 'Get Help', icon: 'chatbox-ellipses-outline', color: 'red' },
  { label: 'Manage My Line', icon: 'apps-outline', color: 'red' },
  { label: 'Find a Safaricom Shop', icon: 'storefront-outline', color: 'green' },
];

const SETTINGS: Tile[] = [
  { label: 'M-PESA Statements', icon: 'document-text-outline', color: 'green' },
  { label: 'Change PIN', icon: 'keypad-outline', color: 'red' },
  { label: 'Language', icon: 'language-outline', color: 'green' },
  { label: 'Terms & Conditions', icon: 'reader-outline', color: 'green' },
];

function TileIcon({ icon, color }: { icon: IconName; color: 'green' | 'red' }) {
  const styles = useStyles();
  return (
    <View style={styles.tileIcon}>
      <Ionicons name={icon} size={19} color={colors[color]} />
    </View>
  );
}

export default function ProfileScreen() {
  const styles = useStyles();
  const router = useRouter();
  const { profile } = useAccount();
  const [biometric, setBiometric] = useState(true);
  const [themeOpen, setThemeOpen] = useState(false);

  const name = profile ? `${profile.firstName} ${profile.lastName}`.trim() : '';
  const open = (title: string) =>
    title === 'M-PESA Statements'
      ? router.push('/statements')
      : router.push({ pathname: '/coming-soon', params: { title } });

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Profile" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Identity card */}
        <View style={styles.card}>
          <View style={styles.idRow}>
            <View>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{profile?.initials ?? '--'}</Text>
              </View>
              <View style={styles.camera}>
                <Ionicons name="camera-outline" size={13} color={colors.red} />
              </View>
            </View>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
          </View>

          <View style={styles.facts}>
            {[
              ['Phone No.', profile?.phone ?? ''],
              ['Status', 'Active'],
              ['Tariff', 'Prepaid'],
            ].map(([k, v]) => (
              <View key={k} style={styles.fact}>
                <Text style={styles.factKey}>{k}</Text>
                <Text style={styles.factValue}>{v}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.section}>Quick Actions</Text>
        <View style={styles.row2}>
          <Pressable style={[styles.tile, styles.tileWide]} onPress={() => setThemeOpen(true)}>
            <TileIcon icon="sunny-outline" color="green" />
            <Text style={styles.tileLabel}>Appearance</Text>
          </Pressable>
          <View style={[styles.tile, styles.tileWide]}>
            <View style={styles.bioTop}>
              <TileIcon icon="finger-print-outline" color="red" />
              <Switch
                value={biometric}
                onValueChange={setBiometric}
                trackColor={{ false: colors.skeleton, true: colors.green }}
                thumbColor={colors.white}
                style={styles.switch}
              />
            </View>
            <Text style={styles.tileLabel}>Biometric{'\n'}Authentication</Text>
          </View>
        </View>

        {/* Quick Care */}
        <Text style={styles.section}>Quick Care</Text>
        <View style={styles.grid}>
          {QUICK_CARE.map((t) => (
            <Pressable
              key={t.label}
              style={({ pressed }) => [styles.tile, styles.tile3, pressed && styles.pressed]}
              onPress={() => open(t.label)}
            >
              <TileIcon icon={t.icon} color={t.color} />
              <Text style={styles.tileLabel}>{t.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Account and Settings */}
        <Text style={styles.section}>Account and Settings</Text>
        <View style={styles.grid}>
          {SETTINGS.map((t) => (
            <Pressable
              key={t.label}
              style={({ pressed }) => [styles.tile, styles.tileWide, pressed && styles.pressed]}
              onPress={() => open(t.label)}
            >
              <TileIcon icon={t.icon} color={t.color} />
              <Text style={styles.tileLabel}>{t.label}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <ThemeSheet visible={themeOpen} onClose={() => setThemeOpen(false)} />
    </SafeAreaView>
  );
}

const GAP = 10;
/** Widths from the screen, not percentages, so three tiles always fit on one row. */
const INNER = layout.screenWidth - 32;
const W2 = (INNER - GAP) / 2;
const W3 = (INNER - GAP * 2) / 3;

const useStyles = themed((colors) =>
  StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.black },
  scroll: { flex: 1, backgroundColor: colors.screen },
  content: { padding: 16, paddingTop: 10, paddingBottom: 40 },

  card: { backgroundColor: colors.card, borderRadius: 16, padding: 14 },
  idRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.tintGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.green, fontSize: 17, fontWeight: '700' },
  camera: {
    position: 'absolute',
    right: -7,
    bottom: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.tintGreen,
    borderWidth: 2,
    borderColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { flex: 1, color: colors.text, fontSize: 18, fontWeight: '600', marginLeft: 18 },
  facts: { flexDirection: 'row', marginTop: 16 },
  fact: { flex: 1, alignItems: 'center' },
  factKey: { color: colors.textMuted, fontSize: 13 },
  factValue: { color: colors.text, fontSize: 14, marginTop: 4 },

  section: { color: colors.text, fontSize: 16.5, fontWeight: '700', marginTop: 22, marginBottom: 12 },

  row2: { flexDirection: 'row', gap: GAP },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  tile: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 11,
    minHeight: 92,
    justifyContent: 'space-between',
  },
  tileWide: { width: W2 },
  tile3: { width: W3, minHeight: 90 },
  pressed: { opacity: 0.6 },
  tileIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: colors.tile,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bioTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  switch: { transform: [{ scale: 0.85 }] },
  tileLabel: { color: colors.text, fontSize: 13, lineHeight: 17, marginTop: 10 },
}));
