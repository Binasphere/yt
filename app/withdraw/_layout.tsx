import { Stack } from 'expo-router';
import React from 'react';
import { colors } from '../../theme/colors';

export default function WithdrawLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.screen },
        animation: 'slide_from_right',
      }}
    />
  );
}
