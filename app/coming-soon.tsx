import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { colors } from '../theme/colors';

export default function ComingSoonScreen() {
  const router = useRouter();
  const { title } = useLocalSearchParams<{ title?: string }>();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title={title ?? 'M-PESA'} />
      <View style={styles.body}>
        <Text style={styles.emoji}>🚧</Text>
        <Text style={styles.title}>{title ?? 'This service'}</Text>
        <Text style={styles.text}>
          This service isn&apos;t available on your account yet.
        </Text>
        <PrimaryButton
          label="Try Withdraw Money"
          style={styles.btn}
          onPress={() => router.replace('/withdraw')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.black },
  body: {
    flex: 1,
    backgroundColor: colors.screen,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 34,
  },
  emoji: { fontSize: 46 },
  title: { color: colors.text, fontSize: 20, fontWeight: '700', marginTop: 18, textAlign: 'center' },
  text: { color: colors.textMuted, fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 12 },
  btn: { alignSelf: 'stretch', marginTop: 30 },
});
