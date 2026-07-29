import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { LayoutAnimation, Platform, Pressable, StyleSheet, Text, UIManager, View } from 'react-native';
import { EmptyAppsIcon } from './icons/MpesaIcons';
import { colors } from '../theme/colors';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TABS = ['Apps', 'Send', 'Pay', 'Bundles', 'Withdraw'];

export function Frequents() {
  const [tab, setTab] = useState('Apps');
  const [open, setOpen] = useState(true);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((o) => !o);
  };

  return (
    <View style={styles.card}>
      <Pressable style={styles.headerRow} onPress={toggle}>
        <Text style={styles.title}>Frequents</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={22} color={colors.text} />
      </Pressable>

      {open && (
        <>
          <View style={styles.tabs}>
            {TABS.map((t) => {
              const active = t === tab;
              return (
                <Pressable
                  key={t}
                  onPress={() => setTab(t)}
                  style={[styles.tab, active && styles.tabActive]}
                >
                  <Text style={[styles.tabText, active && styles.tabTextActive]}>{t}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.empty}>
            <View style={styles.emptyArt}>
              <View style={[styles.bar, { width: 74 }]} />
              <View style={styles.artRow}>
                <View style={[styles.bar, { width: 36 }]} />
                <EmptyAppsIcon size={40} />
                <View style={styles.dot} />
              </View>
              <View style={[styles.bar, { width: 58 }]} />
            </View>

            <Text style={styles.emptyText}>
              It looks like you&apos;re still fresh here. See the services we offer
            </Text>
          </View>

          <Pressable style={styles.exploreBtn} hitSlop={8}>
            <Text style={styles.exploreText}>Explore Apps</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 18,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: colors.text, fontSize: 18, fontWeight: '700' },
  tabs: { flexDirection: 'row', gap: 6, marginTop: 16, overflow: 'hidden' },
  tab: { paddingHorizontal: 20, paddingVertical: 11, borderRadius: 22 },
  tabActive: { backgroundColor: colors.green },
  tabText: { color: colors.text, fontSize: 16 },
  tabTextActive: { color: colors.black, fontWeight: '600' },
  empty: { flexDirection: 'row', alignItems: 'center', marginTop: 22, gap: 14 },
  emptyArt: { width: 120, gap: 9 },
  artRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bar: { height: 9, borderRadius: 5, backgroundColor: colors.skeleton },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.skeleton },
  emptyText: { flex: 1, color: colors.text, fontSize: 15.5, lineHeight: 22 },
  exploreBtn: { alignSelf: 'flex-end', marginTop: 14 },
  exploreText: { color: colors.green, fontSize: 16 },
});
