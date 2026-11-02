import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import React, { useEffect } from 'react';
import { AppState } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Splash } from '../components/Splash';
import { AccountProvider, useAccount } from '../store/AccountContext';
import { colors } from '../theme/colors';
import { ThemeProvider, useTheme } from '../theme/ThemeContext';

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

/** Everything that has to repaint when the theme flips lives under here. */
function ThemedApp() {
  const { scheme } = useTheme();

  // The window behind every screen. Matching it to the page means a transition
  // never flashes a strip of a different colour.
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.screen).catch(() => {});
  }, [scheme]);

  return (
    <>
      <AutoLock />
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.screen },
          // A short cross-fade instead of a slide: the page changes, nothing
          // swoops across the screen.
          animation: 'fade',
          animationDuration: 180,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="home" />
        <Stack.Screen name="withdraw" />
        <Stack.Screen name="statements" />
        <Stack.Screen name="send-money" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="lipa" />
        <Stack.Screen name="balances" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="coming-soon" />
      </Stack>
      {/* Last child, so it paints over the stack rather than under it. */}
      <Splash />
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AccountProvider>
          <ThemedApp />
        </AccountProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
