import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { applyPalette, colors, Palette, palettes, Scheme } from './colors';

export type ThemePreference = 'light' | 'dark' | 'system';

type ThemeState = {
  preference: ThemePreference;
  /** What is actually on screen once "system" is resolved. */
  scheme: Scheme;
  setPreference(p: ThemePreference): void;
};

const STORAGE_KEY = 'theme-preference';
const ThemeContext = createContext<ThemeState | null>(null);

let current: Scheme = 'dark';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [preference, setPref] = useState<ThemePreference>('system');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((v) => {
        if (v === 'light' || v === 'dark' || v === 'system') setPref(v);
      })
      .catch(() => {});
  }, []);

  const scheme: Scheme =
    preference === 'system' ? (system === 'light' ? 'light' : 'dark') : preference;

  // Swapped during render, not in an effect, so the children rendering below
  // already read the new palette — no frame of mixed colours.
  if (scheme !== current) {
    applyPalette(scheme);
    current = scheme;
  }

  const value = useMemo<ThemeState>(
    () => ({
      preference,
      scheme,
      setPreference(p) {
        setPref(p);
        AsyncStorage.setItem(STORAGE_KEY, p).catch(() => {});
      },
    }),
    [preference, scheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeState {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}

/**
 * Builds a stylesheet per theme and returns a hook that hands back the one for
 * the theme on screen. Calling the hook also subscribes the component to theme
 * changes, so it (and everything it renders) repaints when the mode flips.
 *
 *   const useStyles = themed((colors) => StyleSheet.create({ ... }));
 *   function Thing() { const styles = useStyles(); ... }
 */
export function themed<T>(
  factory: (c: Palette) => T
): () => T {
  const cache: Partial<Record<Scheme, T>> = {};
  return function useStyles() {
    const { scheme } = useTheme();
    return (cache[scheme] ??= factory(palettes[scheme]));
  };
}

export { colors };
