/** Safaricom agent-withdrawal tariff bands: [min, max, charge]. */
const BANDS: [number, number, number][] = [
  [50, 100, 11],
  [101, 2500, 29],
  [2501, 3500, 52],
  [3501, 5000, 69],
  [5001, 7500, 87],
  [7501, 10000, 115],
  [10001, 15000, 167],
  [15001, 20000, 185],
  [20001, 35000, 197],
  [35001, 50000, 278],
  [50001, 250000, 309],
];

export function withdrawalCharge(amount: number): number {
  const band = BANDS.find(([lo, hi]) => amount >= lo && amount <= hi);
  return band ? band[2] : 0;
}
