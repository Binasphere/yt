/**
 * Fuliza limits.
 *
 * Safaricom sets a customer's Fuliza limit from how much money moves through
 * the account, so a wallet holding a quarter of a million shillings and a
 * limit of 800 do not belong on the same screen — the pairing is the first
 * thing anyone who uses M-PESA would notice.
 *
 * The limit here is therefore derived from the balance, in the round numbers
 * the real product uses, and capped at 10,000.
 *
 * It is *deterministic* in its seed rather than freshly random on every read.
 * The home screen re-reads the account every four seconds, and a limit that
 * rolled new dice each tick would visibly flicker. Seeded from the account's
 * phone number, it looks arbitrary but holds still for as long as the balance
 * stays in the same band.
 */

/** Highest limit Fuliza will show, in shillings. */
const CAP = 10_000;

/** Limits are always round hundreds in the real product. */
const STEP = 500;

/**
 * Balance bands and the limit range each one earns.
 *
 * A near-empty wallet gets nothing — Fuliza is credit, and it is not extended
 * to an account with no history of money passing through it.
 */
const BANDS: { upTo: number; min: number; max: number }[] = [
  { upTo: 1_000, min: 0, max: 0 },
  { upTo: 5_000, min: 500, max: 1_000 },
  { upTo: 20_000, min: 1_000, max: 2_500 },
  { upTo: 50_000, min: 2_500, max: 5_000 },
  { upTo: 100_000, min: 5_000, max: 7_500 },
  { upTo: Infinity, min: 7_500, max: CAP },
];

/** FNV-1a, folded to [0, 1). Small, stable, and no dependency. */
function unitHash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100_000) / 100_000;
}

/**
 * A plausible Fuliza limit for `balance`.
 *
 * @param balance Account balance in shillings.
 * @param seed    Anything stable per account — the phone number is ideal.
 */
export function fulizaLimit(balance: number, seed: string): number {
  const index = BANDS.findIndex((b) => balance < b.upTo);
  const band = BANDS[index === -1 ? BANDS.length - 1 : index];

  if (band.max === 0) return 0;

  // The band index joins the seed so that crossing into a new band actually
  // moves the number, rather than landing on the same offset within it.
  const t = unitHash(`${seed}:${index}`);
  const raw = band.min + t * (band.max - band.min);
  const rounded = Math.round(raw / STEP) * STEP;

  return Math.min(CAP, Math.max(band.min, rounded));
}
