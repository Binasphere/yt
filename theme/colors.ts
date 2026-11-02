/**
 * Colour tokens for both themes. Dark is sampled from the M-PESA app's dark
 * theme (assets/ss.jpeg), light from its light-mode screens.
 * Keep every colour in this file — screens should never hard-code hex values.
 */
const dark = {
  // Surfaces. `black` is the chrome behind headers and safe areas: true black
  // in dark mode, white in light mode.
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
  /** Text and icons sitting on a solid green fill. */
  onGreen: '#000000',
  white: '#FFFFFF',

  // Avatar
  avatarBg: '#5C2E1C',
  avatarText: '#E8845C',

  // Contact / profile avatars (dark-theme versions of the app's pastel chips)
  tintPink: '#3A1E26',
  tintPinkText: '#F06A8A',
  tintSky: '#16303D',
  tintSkyText: '#6EC6F0',
  tintBlue: '#1C2742',
  tintBlueText: '#5B8DEF',
  tintGreen: '#14301F',
  tintPurple: '#2A2145',
  tintPurpleText: '#9B7BF0',
  inputBorder: '#3A3A3A',

  overlay: 'rgba(0,0,0,0.72)',
};

export type Palette = { [K in keyof typeof dark]: string };

const light: Palette = {
  black: '#FFFFFF',
  screen: '#F3F4F6',
  card: '#FFFFFF',
  cardAlt: '#FFFFFF',
  tile: '#F1F3F5',
  chip: '#ECEEF1',
  divider: '#E3E6EA',
  skeleton: '#DADDE2',

  green: '#3AA935',
  greenBright: '#4CC24A',
  greenDim: '#2E8B2B',
  red: '#E3342F',
  blue: '#2F80ED',

  text: '#2A2A2A',
  textMuted: '#6B7075',
  textFaint: '#9AA0A6',
  onGreen: '#FFFFFF',
  white: '#FFFFFF',

  avatarBg: '#F6E3DA',
  avatarText: '#C8643A',

  tintPink: '#FDECEF',
  tintPinkText: '#E8507A',
  tintSky: '#E8F5FC',
  tintSkyText: '#4FB3E6',
  tintBlue: '#E8EEFC',
  tintBlueText: '#3D6FE0',
  tintGreen: '#E9F5EA',
  tintPurple: '#EEE9FB',
  tintPurpleText: '#7A55E0',
  inputBorder: '#D6DCE4',

  overlay: 'rgba(0,0,0,0.45)',
};

export type Scheme = 'light' | 'dark';
export const palettes: Record<Scheme, Palette> = { dark, light };

/**
 * The palette in use right now. It is swapped in place by the ThemeProvider
 * before anything renders, so code that reads `colors.x` during render always
 * gets the current theme. Stylesheets must not capture it at load time — build
 * them with `themed()` instead.
 */
export const colors: Palette = { ...dark };

export function applyPalette(scheme: Scheme) {
  Object.assign(colors, palettes[scheme]);
}

export type ColorName = keyof Palette;
