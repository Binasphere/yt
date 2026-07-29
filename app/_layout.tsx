import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AccountProvider } from '../store/AccountContext';
import { colors } from '../theme/colors';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AccountProvider>
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
      </AccountProvider>
    </SafeAreaProvider>
  );
}
