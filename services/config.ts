import Constants from 'expo-constants';

/**
 * Where the app gets its money from.
 *
 * The demo runs against the Venti M-Pesa rail (`/api/mpesa/*`). The wallet
 * itself lives in Supabase, and two hosts serve routes over it — the payments
 * service on Render, and the Venti dev server on a laptop — so a deposit made
 * on the terminal shows up here and a withdrawal made here shows up there, no
 * matter which of the two the terminal is running on.
 *
 * If the rail cannot be reached the app falls back to its own in-memory data
 * and keeps working — a demo that dies because a laptop changed Wi-Fi is worse
 * than a demo running on local numbers.
 */

/** Set to false to ignore the trading server entirely and run standalone. */
export const USE_BRIDGE = true;

/** Port the Venti dev server listens on (`npm run dev`). */
const BRIDGE_PORT = 3000;

/**
 * The payments service on Render — the rail's public home.
 *
 * Preferred over the laptop because it needs no Wi-Fi arrangement at all: the
 * handset reaches it over mobile data, from any room, and it is the same
 * origin the deployed terminal talks to. Both read one Supabase wallet, so
 * choosing this one never means seeing a different balance.
 */
const REMOTE_BASE_URL = 'https://trad-z5gt.onrender.com';

/**
 * Which host to prefer.
 *
 * 'remote' — Render. The default, and what to use when demoing.
 * 'lan'    — the laptop that served this bundle, over Wi-Fi. Faster (no cold
 *            start) and works with no internet, but only while the phone and
 *            the laptop are on the same network and `npm run dev` is up.
 * Or a full origin, e.g. 'http://192.168.1.42:3000', to pin it by hand.
 */
const PREFER: 'remote' | 'lan' | string = 'remote';

/**
 * The laptop's LAN address, taken from whatever address Metro served this
 * bundle over.
 *
 * The phone already reached the laptop to download the JS, so that host is by
 * definition routable from the handset — which makes it a better answer than
 * anything typed into a config file and forgotten. Only the port differs.
 */
function detectHost(): string | null {
  const candidates = [
    Constants.expoConfig?.hostUri,
    // Older SDKs and bare builds expose it here instead.
    (Constants as unknown as { expoGoConfig?: { debuggerHost?: string } }).expoGoConfig
      ?.debuggerHost,
    (Constants as unknown as { manifest2?: { extra?: { expoGo?: { debuggerHost?: string } } } })
      .manifest2?.extra?.expoGo?.debuggerHost,
  ];

  for (const candidate of candidates) {
    const host = candidate?.split('/')[0]?.split(':')[0];
    if (host) return host;
  }
  return null;
}

function resolveBaseUrl(): string {
  if (PREFER === 'remote') return REMOTE_BASE_URL;
  if (PREFER !== 'lan') return PREFER;

  const host = detectHost();
  // No Metro host means the web build, served from the same machine.
  return `http://${host ?? 'localhost'}:${BRIDGE_PORT}`;
}

export const BASE_URL = resolveBaseUrl();

/** How often the home screen re-reads the balance, in ms. */
export const POLL_INTERVAL = 4000;

/**
 * How long any single call to the rail may take before we fall back.
 *
 * Generous on the remote host: Render spins a free service down after ~15 idle
 * minutes, and the request that wakes it can wait the better part of a minute.
 * Six seconds would give up on that and quietly show fallback numbers — which
 * is precisely the balance drifting from the terminal's that this rail exists
 * to prevent. On the LAN there is no cold start to wait out.
 */
export const REQUEST_TIMEOUT = BASE_URL.startsWith('https://') ? 45000 : 6000;

/** Simulated network latency for the offline fallback, in ms. */
export const MOCK_LATENCY = 650;

/**
 * Demo mode: any four digits unlock the app and authorise a transaction.
 *
 * This is a presentation build with no real account behind it, and a PIN that
 * has to be remembered on stage is a demo that stalls. `DEMO_PIN` stays only
 * as the placeholder the fallback data uses.
 */
export const ACCEPT_ANY_PIN = true;

export const DEMO_PIN = '1234';

/** Whether an entered PIN is acceptable. */
export function pinAccepted(pin: string): boolean {
  return ACCEPT_ANY_PIN ? /^\d{4}$/.test(pin) : pin === DEMO_PIN;
}

/** Opening balance for the phone when it is running on its own data. */
export const FALLBACK_BALANCE = 256_700;
