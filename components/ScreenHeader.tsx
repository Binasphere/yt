import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export function ScreenHeader({ title, onBack }: { title: string; onBack?: () => void }) {
  const router = useRouter();
  return (
    <View style={styles.row}>
      <Pressable
        hitSlop={10}
        style={styles.back}
        onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/home')))}
      >
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: colors.black,
  },
  back: { width: 34 },
  title: { color: colors.text, fontSize: 19, fontWeight: '600', flex: 1 },
});
