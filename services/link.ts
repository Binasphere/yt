import AsyncStorage from '@react-native-async-storage/async-storage';
import { ACCEPT_ANY_PIN, BASE_URL, REQUEST_TIMEOUT } from './config';

/**
 * The handset's link to a VIP account.
 *
 * The phone has no session on the trading platform and no account of its own.
 * What it has is a four digit PIN an admin assigned in the Novi console: typed
 * once, it is exchanged for a `deviceToken` that identifies exactly one wallet.
 * The token is kept in storage from then on, so the binding survives the app
 * being closed and the customer never types the PIN to identify themselves
 * twice.
 *
 * The PIN is kept too, and that is a deliberate second decision rather than a
 * side effect. After linking, the lock screen and every withdrawal need to
 * check a PIN, and checking it here means the phone unlocks instantly and
 * still unlocks with no signal. It is the same four digits the console shows
 * the operator; it guards a prop balance and nothing else.
 */

const TOKEN_KEY = 'novi.mpesa.deviceToken';
const PIN_KEY = 'novi.mpesa.pin';

let token: string | null = null;
let pin: string | null = null;
let loaded = false;

/** Reads the stored binding. Safe to call repeatedly; only the first hits disk. */
export async function loadToken(): Promise<string | null> {
  if (loaded) return token;

  try {
    const [t, p] = await Promise.all([
      AsyncStorage.getItem(TOKEN_KEY),
      AsyncStorage.getItem(PIN_KEY),
    ]);
    token = t;
    pin = p;
  } catch {
    // A device that cannot read its own storage is one the demo can still run
    // on. It just asks for the PIN again.
    token = null;
    pin = null;
  }

  loaded = true;
  return token;
}

/** The token as last known, without touching storage. */
export function currentToken(): string | null {
  return token;
}

/** Whether this handset has been linked to an account. */
export function isLinked(): boolean {
  return token !== null;
}

async function store(nextToken: string | null, nextPin: string | null): Promise<void> {
  token = nextToken;
  pin = nextPin;
  loaded = true;
  try {
    if (nextToken === null) {
      await AsyncStorage.multiRemove([TOKEN_KEY, PIN_KEY]);
    } else {
      await AsyncStorage.setItem(TOKEN_KEY, nextToken);
      if (nextPin) await AsyncStorage.setItem(PIN_KEY, nextPin);
    }
  } catch {
    // Keep the in-memory binding either way: the session still works, it just
    // will not survive a restart.
  }
}

/**
 * Whether an entered PIN is acceptable.
 *
 * Before the phone is linked, any four digits are worth sending to the rail,
 * which is the only thing that can say whether they are right. After linking
 * the PIN has a known correct value, and this is the check the lock screen and
 * the withdrawal sheet use.
 */
export function pinAccepted(entered: string): boolean {
  if (!/^\d{4}$/.test(entered)) return false;
  if (ACCEPT_ANY_PIN) return true;
  if (!pin) return true; // not linked yet: the rail decides
  return entered === pin;
}

export type LinkResult =
  | { ok: true }
  | { ok: false; reason: string };

/**
 * Exchanges a PIN for a device token and remembers both.
 *
 * A wrong PIN and an unassigned PIN come back identically from the rail, so
 * this cannot be used to discover which PINs exist.
 */
export async function linkWithPin(entered: string): Promise<LinkResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const res = await fetch(`${BASE_URL}/mpesa/link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: entered }),
      signal: controller.signal,
    });

    const body = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        ok: false,
        reason: body?.error?.message ?? 'Wrong PIN. Please try again.',
      };
    }
    if (!body?.deviceToken) {
      return { ok: false, reason: 'The rail did not return a device token.' };
    }

    await store(String(body.deviceToken), entered);
    return { ok: true };
  } catch {
    return {
      ok: false,
      reason: 'Cannot reach the server. Check your connection.',
    };
  } finally {
    clearTimeout(timer);
  }
}

/** Forgets the link, so the next unlock asks for a PIN again. */
export async function unlinkDevice(): Promise<void> {
  await store(null, null);
}
