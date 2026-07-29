import React, { useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BalanceCarousel } from '../components/BalanceCarousel';
import { FloatingActions } from '../components/FloatingActions';
import { Frequents } from '../components/Frequents';
import { Header } from '../components/Header';
import { QuickActions } from '../components/QuickActions';
import { useAccount } from '../store/AccountContext';
import { colors } from '../theme/colors';

export default function HomeScreen() {
  const { profile, balances, loading, error, hidden, toggleHidden, refresh } = useAccount();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  if (loading && !profile) {
    return (
      <SafeAreaView style={styles.center} edges={['top', 'bottom']}>
        <ActivityIndicator color={colors.green} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header initials={profile?.initials ?? '--'} firstName={profile?.firstName ?? ''} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.green} />
        }
      >
        {error && <Text style={styles.error}>{error}</Text>}

        <BalanceCarousel
          mpesa={balances?.mpesa ?? 0}
          fuliza={balances?.fuliza ?? 0}
          airtime={balances?.airtime ?? 0}
          points={balances?.points ?? 0}
          hidden={hidden}
          onToggleHidden={toggleHidden}
        />

        <View style={styles.quickActionsWrap}>
          <QuickActions />
        </View>

        <Frequents />
        <View style={styles.bottomSpace} />
      </ScrollView>

      <FloatingActions />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.black },
  center: { flex: 1, backgroundColor: colors.screen, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1, backgroundColor: colors.screen },
  content: { paddingTop: 18 },
  quickActionsWrap: { marginTop: 14 },
  bottomSpace: { height: 140 },
  error: {
    color: colors.red,
    marginHorizontal: 16,
    marginBottom: 10,
    fontSize: 14,
  },
});
