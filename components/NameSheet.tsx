import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAccount } from '../store/AccountContext';
import { colors } from '../theme/colors';
import { themed } from '../theme/ThemeContext';

/**
 * Profile → edit name. Sets the name the home screen greets you by
 * ("Good morning, <name>"). Kept on this device only; clearing it goes back
 * to the account's first name.
 */
export function NameSheet({ visible, onClose }: { visible: boolean; onClose(): void }) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const { greetingName, displayName, profile, setDisplayName } = useAccount();
  const [draft, setDraft] = useState(greetingName);

  // Start from whatever is showing now each time the sheet opens.
  useEffect(() => {
    if (visible) setDraft(greetingName);
  }, [visible, greetingName]);

  const save = () => {
    setDisplayName(draft);
    onClose();
  };

  const reset = () => {
    setDisplayName(null);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: 24 + insets.bottom }]}>
          <View style={styles.grabber} />

          <View style={styles.header}>
            <Pressable
              hitSlop={8}
              style={({ pressed }) => [styles.back, pressed && styles.pressed]}
              onPress={onClose}
            >
              <Ionicons name="chevron-back" size={22} color={colors.text} />
            </Pressable>
            <Text style={styles.title}>Greeting Name</Text>
            <View style={styles.back} />
          </View>

          <Text style={styles.hint}>The name shown after "Good morning," on the home screen.</Text>

          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            placeholder={profile?.firstName || 'Enter name'}
            placeholderTextColor={colors.textFaint}
            autoFocus
            autoCapitalize="words"
            maxLength={30}
            returnKeyType="done"
            onSubmitEditing={save}
          />

          <Pressable
            style={({ pressed }) => [styles.save, pressed && styles.pressed]}
            onPress={save}
          >
            <Text style={styles.saveText}>Save</Text>
          </Pressable>

          {displayName !== null && (
            <Pressable hitSlop={8} style={styles.resetWrap} onPress={reset}>
              <Text style={styles.reset}>Use account name</Text>
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const useStyles = themed((colors) =>
  StyleSheet.create({
    fill: { flex: 1 },
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
    hint: { color: colors.textMuted, fontSize: 13.5, marginTop: 22 },
    input: {
      marginTop: 12,
      borderWidth: 1,
      borderColor: colors.divider,
      borderRadius: 12,
      backgroundColor: colors.card,
      color: colors.text,
      fontSize: 16,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    save: {
      marginTop: 18,
      backgroundColor: colors.green,
      borderRadius: 24,
      paddingVertical: 13,
      alignItems: 'center',
    },
    saveText: { color: colors.white, fontSize: 16, fontWeight: '700' },
    resetWrap: { alignSelf: 'center', marginTop: 16 },
    reset: { color: colors.green, fontSize: 14, fontWeight: '600' },
  })
);
