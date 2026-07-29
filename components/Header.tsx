import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BellIcon, SearchIcon } from './icons/MpesaIcons';
import { colors } from '../theme/colors';

function greeting(d = new Date()): string {
  const h = d.getHours();
  if (h < 12) return 'Good morning,';
  if (h < 17) return 'Good afternoon,';
  return 'Good evening,';
}

type Props = {
  initials: string;
  firstName: string;
};

export function Header({ initials, firstName }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.avatarWrap}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.avatarBadge}>
          <View style={styles.avatarBadgeDot} />
        </View>
      </View>

      <View style={styles.greetingWrap}>
        <Text style={styles.greeting}>{greeting()}</Text>
        <Text style={styles.name} numberOfLines={1}>
          {firstName} <Text style={styles.wave}>👋</Text>
        </Text>
      </View>

      <Pressable style={styles.iconBtn} hitSlop={6}>
        <BellIcon size={23} />
        <View style={styles.notifDot} />
      </Pressable>

      <Pressable style={[styles.iconBtn, styles.iconBtnLast]} hitSlop={6}>
        <SearchIcon size={23} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 18,
    backgroundColor: colors.black,
  },
  avatarWrap: { width: 46, height: 46 },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.avatarText,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  avatarBadge: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    width: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.black,
  },
  avatarBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E8407A',
  },
  greetingWrap: { flex: 1, marginLeft: 12 },
  greeting: { color: colors.text, fontSize: 16, opacity: 0.95 },
  name: { color: colors.text, fontSize: 21, fontWeight: '700', marginTop: 1 },
  wave: { fontSize: 18 },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  iconBtnLast: { marginLeft: 10 },
  notifDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.red,
    borderWidth: 1.5,
    borderColor: colors.cardAlt,
  },
});
