/**
 * Where the app gets its money from.
 *
 * This handset serves three projects, each with its own demo M-PESA rail. The
 * active one is chosen here: exactly one pair of lines below is live. To
 * switch projects, comment out the live pair and uncomment the other. Each
 * rail keeps its own stored link, so switching back does not lose a pairing.
 *
 * If the rail cannot be reached the app falls back to its own in-memory data
 * and keeps working. A demo that dies because a laptop changed Wi-Fi is worse
 * than a demo running on local numbers.
 */

// --- Venti (trading terminal VIP rail): uncomment these two and comment the live pair to switch
// import { rail as activeRail } from './rails/venti';
// export const rail = activeRail;

// --- Novi: uncomment these two and comment the two above to switch ---------
// import { rail as activeRail } from './rails/novi';
// export const rail = activeRail;

// --- obisflow (VIP demo rail, the obisflow API): ACTIVE ------------------
import { rail as activeRail } from './rails/obisflow';
export const rail = activeRail;

/** Set to false to ignore the rail entirely and run standalone. */
export const USE_BRIDGE = true;

/**
 * Which host to use.
 *
 *   'remote'      the active rail's deployed backend. What to use when demoing.
 *   a full origin e.g. 'http://192.168.1.42:8790', to pin a backend running on
 *                 a laptop while developing. The phone must be on that network.
 */
const PREFER: 'remote' | string = 'remote';

export const BASE_URL = PREFER === 'remote' ? rail.baseUrl : PREFER;

/** How often the home screen re-reads the account, in ms. */
export const POLL_INTERVAL = 4000;

/**
 * How long any single call may take before we fall back.
 *
 * Generous on the remote host: a service that has been idle can take the
 * better part of a minute to answer the request that wakes it. Six seconds
 * would give up on that and quietly show fallback numbers, which is precisely
 * the balance drifting from the terminal's that this rail exists to prevent.
 */
export const REQUEST_TIMEOUT = BASE_URL.startsWith('https://') ? 45000 : 8000;

/** Simulated network latency for the offline fallback, in ms. */
export const MOCK_LATENCY = 650;

/**
 * The PIN.
 *
 * It is no longer a formality. An admin assigns a four digit PIN to each VIP
 * wallet in the Novi console, and that PIN is what binds this handset to one
 * account: typed once on the lock screen, exchanged for a device token, and
 * from then on it is what unlocks the app and authorises a withdrawal.
 *
 * Which means the app can no longer accept any four digits. A phone that
 * unlocks on 0000 is a phone that shows somebody else's balance to whoever
 * picks it up in the room.
 *
 * Set ACCEPT_ANY_PIN true only to run the app standalone with no rail behind
 * it, where there is no wallet and therefore no PIN to be right about.
 */
export const ACCEPT_ANY_PIN = false;

/** Only used by the offline fallback data, which has no wallet behind it. */
export const DEMO_PIN = '1234';

/** Opening balance for the phone when it is running on its own data. */
export const FALLBACK_BALANCE = 256_700;
