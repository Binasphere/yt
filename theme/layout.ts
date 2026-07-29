import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const layout = {
  screenWidth: SCREEN_WIDTH,
  gutter: 16,
  cardRadius: 20,
  tileRadius: 14,
  /** Balance cards peek the next card on the right, exactly like the real app. */
  balanceCardWidth: SCREEN_WIDTH - 16 * 2 - 30,
  balanceCardGap: 12,
} as const;

/** Ksh 3,890.13 */
export function formatKsh(amount: number, prefix = 'Ksh'): string {
  const fixed = Math.abs(amount).toFixed(2);
  const [whole, cents] = fixed.split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${prefix} ${amount < 0 ? '-' : ''}${grouped}.${cents}`;
}
