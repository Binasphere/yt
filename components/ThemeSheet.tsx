import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { themed, ThemePreference, useTheme } from '../theme/ThemeContext';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const OPTIONS: { key: ThemePreference; label: string; icon: IconName }[] = [
  { key: 'light', label: 'Light Mode', icon: 'sunny-outline' },
  { key: 'dark', label: 'Dark Mode', icon: 'moon-outline' },
  { key: 'system', label: 'System', icon: 'settings-outline' },
];

/**
 * The "Theme" bottom sheet from Profile → Appearance. Picking an option
 * applies it straight away — the sheet stays up so the change is visible
 * behind it — and the choice is remembered across launches.
 */
export function ThemeSheet({ visible, onClose }: { visible: boolean; onClose(): void }) {
  const styles = useStyles();
  const { preference, setPreference } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: 36 + insets.bottom }]}>
        <View style={styles.grabber} />

        <View style={styles.header}>
          <Pressable
            hitSlop={8}
            style={({ pressed }) => [styles.back, pressed && styles.pressed]}
            onPress={onClose}
          >
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </Pressable>
          <Text style={styles.title}>Theme</Text>
          <View style={styles.back} />
        </View>

        <View style={styles.options}>
          {OPTIONS.map((o) => {
            const active = o.key === preference;
            const iconColor = active ? colors.green : colors.textMuted;
            return (
              <Pressable key={o.key} style={styles.option} onPress={() => setPreference(o.key)}>
                <View style={[styles.circle, active && styles.circleActive]}>
                  {o.key === 'system' ? (
                    // The real gear is green with a red centre.
                    <View>
                      <Ionicons name="settings-outline" size={28} color={iconColor} />
                      <View style={[styles.gearDot, active && styles.gearDotActive]} />
                    </View>
                  ) : (
                    <Ionicons name={o.icon} size={28} color={iconColor} />
                  )}
                  {active && (
                    <View style={styles.check}>
                      <Ionicons name="checkmark" size={13} color={colors.white} />
                    </View>
                  )}
                </View>
                <Text style={styles.label}>{o.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}

const useStyles = themed((colors) =>
  StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: colors.overlay },
    sheet: {
      backgroundColor: colors.cardAlt,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 20,
      paddingTop: 10,
    },
    grabber: {
      alignSelf: 'center',
      width: 34,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.divider,
    },
    header: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
    back: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.tile,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pressed: { opacity: 0.6 },
    title: { flex: 1, textAlign: 'center', color: colors.text, fontSize: 17, fontWeight: '700' },
    options: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 34 },
    option: { alignItems: 'center', width: 100 },
    circle: {
      width: 76,
      height: 76,
      borderRadius: 38,
      borderWidth: 1,
      borderColor: colors.divider,
      backgroundColor: colors.card,
      alignItems: 'center',
      justifyContent: 'center',
    },
    circleActive: { backgroundColor: colors.tintGreen, borderColor: colors.tintGreen },
    gearDot: {
      position: 'absolute',
      top: 11,
      left: 11,
      width: 6,
      height: 6,
      borderRadius: 3,
      borderWidth: 1.5,
      borderColor: colors.textMuted,
    },
    gearDotActive: { borderColor: colors.red },
    check: {
      position: 'absolute',
      top: 2,
      right: 2,
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: colors.green,
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: { color: colors.text, fontSize: 14, marginTop: 12 },
  })
);
