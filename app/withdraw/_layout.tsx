import { Stack } from 'expo-router';
import React from 'react';
import { colors } from '../../theme/colors';
import { useTheme } from '../../theme/ThemeContext';

export default function WithdrawLayout() {
  useTheme(); // repaint the stack background when the mode changes
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
