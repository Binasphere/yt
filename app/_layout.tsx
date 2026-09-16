import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { AppState } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Splash } from '../components/Splash';
import { AccountProvider, useAccount } from '../store/AccountContext';
import { colors } from '../theme/colors';

/**
 * Sends the app back to the lock screen whenever it leaves the foreground.
 *
 * A real banking app does not stay open behind you, so putting the phone down
 * and picking it up again has to cost a PIN. The redirect happens on the way
 * *out* rather than on the way back in, which means the lock screen is already
 * mounted when the app is resumed — there is no frame of somebody's balance on
 * screen before the PIN pad arrives.
 */
function AutoLock() {
  const router = useRouter();
  const { hideBalance } = useAccount();

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'background') return;
      hideBalance();
      router.replace('/');
    });
    return () => sub.remove();
  }, [hideBalance, router]);

  return null;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AccountProvider>
        <AutoLock />
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.screen },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" options={{ animation: 'fade' }} />
          <Stack.Screen name="home" options={{ animation: 'fade' }} />
          <Stack.Screen name="withdraw" />
          <Stack.Screen name="statements" />
          <Stack.Screen name="coming-soon" options={{ animation: 'slide_from_bottom' }} />
        </Stack>
        {/* Last child, so it paints over the stack rather than under it. */}
        <Splash />
      </AccountProvider>
    </SafeAreaProvider>
  );
}
