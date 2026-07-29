/**
 * Colour tokens sampled from the M-PESA app dark theme (assets/ss.jpeg).
 * Keep every colour in this file — screens should never hard-code hex values.
 */
export const colors = {
  // Surfaces
  black: '#000000',
  screen: '#0A0A0A',
  card: '#1A1A1A',
  cardAlt: '#1E1E1E',
  tile: '#2A2A2A',
  chip: '#2C2C2C',
  divider: '#2E2E2E',
  skeleton: '#333333',

  // Brand
  green: '#21C063',
  greenBright: '#3DDC7A',
  greenDim: '#1B8F4A',
  red: '#F5453A',
  blue: '#2F80ED',

  // Text
  text: '#FFFFFF',
  textMuted: '#9E9E9E',
  textFaint: '#6E6E6E',

  // Avatar
  avatarBg: '#5C2E1C',
  avatarText: '#E8845C',

  overlay: 'rgba(0,0,0,0.72)',
} as const;

export type ColorName = keyof typeof colors;
