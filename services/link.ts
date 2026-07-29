import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL, REQUEST_TIMEOUT } from './config';

/**
 * The handset's link to a VIP account.
 *
 * The phone has no Supabase session and no account of its own. What it has is a
 * four-digit PIN the admin assigned in the Venti console: typed once, it is
 * exchanged for a `deviceToken` that identifies exactly one demo wallet. The
 * token is kept in storage from then on, so the binding survives the app being
 * closed — the customer never types the PIN for identification twice.
 *
 * The token is held in memory as well as on disk so that every request does not
 * pay for a storage read; `loadToken()` is what warms it at start-up.
 */

const TOKEN_KEY = 'venti.mpesa.deviceToken';

let token: string | null = null;
let loaded = false;

/** Reads the stored token. Safe to call repeatedly; only the first hits disk. */
export async function loadToken(): Promise<string | null> {
  if (loaded) return token;

  try {
    token = await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    // A device that cannot read its own storage is one the demo can still run
    // on — it just asks for the PIN again.
    token = null;
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

async function store(value: string | null): Promise<void> {
  token = value;
  loaded = true;
  try {
    if (value === null) await AsyncStorage.removeItem(TOKEN_KEY);
    else await AsyncStorage.setItem(TOKEN_KEY, value);
  } catch {
    // Keep the in-memory token either way: the session still works, it just
    // will not survive a restart.
  }
}

export type LinkResult =
  | { ok: true }
  | { ok: false; reason: string };

/**
 * Exchanges a PIN for a device token and remembers it.
 *
 * A wrong PIN and an unissued PIN come back identically from the rail, so this
 * cannot be used to discover which PINs exist.
 */
export async function linkWithPin(pin: string): Promise<LinkResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const res = await fetch(`${BASE_URL}/api/mpesa/link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
      signal: controller.signal,
    });

    const body = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        ok: false,
        reason: body?.error ?? 'Wrong PIN. Please try again.',
      };
    }
    if (!body?.token) {
      return { ok: false, reason: 'The rail did not return a token.' };
    }

    await store(String(body.token));
    return { ok: true };
  } catch {
    return {
      ok: false,
      reason: 'Cannot reach the trading server. Check your connection.',
    };
  } finally {
    clearTimeout(timer);
  }
}

/** Forgets the link, so the next unlock asks for a PIN again. */
export async function unlinkDevice(): Promise<void> {
  await store(null);
}
