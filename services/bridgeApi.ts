import { BASE_URL, REQUEST_TIMEOUT } from './config';
import { currentToken, loadToken, pinAccepted, unlinkDevice } from './link';
import { AGENTS, mockApi, receiptCode } from './mockApi';
import { withdrawalCharge } from './tariff';
import {
  ApiError,
  Balances,
  MpesaApi,
  Profile,
  Transaction,
  TxKind,
  WithdrawRequest,
  WithdrawResult,
} from './types';

/**
 * The trading-server adapter.
 *
 * One wallet in Supabase is the truth for both apps, so money the terminal
 * takes for a deposit disappears from this screen and money it pays out for a
 * withdrawal arrives here. Everything this app needs comes from a single
 * `/mpesa/account` read, cached briefly so the three `useAccount` calls
 * behind one refresh do not become three requests.
 *
 * Which wallet that is comes from the device token this handset was given when
 * its PIN was accepted (see `link.ts`). Every call carries it, so two phones in
 * the same room show two different customers.
 *
 * Every call falls back to the offline data in `mockApi` rather than throwing.
 * The app is a demo prop: showing a stale balance beats showing an error.
 */

/**
 * What GET /mpesa/account answers with.
 *
 * Fuliza arrives from the rail rather than being derived here. It used to be
 * computed from the balance, because there was nothing authoritative to ask;
 * now an admin sets the limit per wallet in the console and the server tracks
 * what is owed, so a number invented on the phone would simply be wrong.
 */
interface RailAccount {
  balanceMinor: number;
  fuliza: {
    limitMinor: number;
    usedMinor: number;
    availableMinor: number;
  };
  holderName: string;
  phone: string | null;
  statement: {
    id: string;
    kind: 'DEPOSIT' | 'WITHDRAWAL' | 'AGENT_WITHDRAWAL' | 'RECEIVE' | 'FULIZA_REPAY' | 'REVERSAL';
    title: string;
    subtitle: string;
    amountMinor: number;
    balanceAfterMinor: number;
    fulizaAfterMinor: number;
    reference: string;
    at: string;
  }[];
}

/** Whether the last call reached the trading server. Screens may show this. */
export let bridgeOnline = false;

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  // Warm the token from storage on the first call after a cold start, so a
  // relaunch does not read as "not linked" for the first tick.
  const token = currentToken() ?? (await loadToken());

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init?.headers ?? {}),
      },
    });

    const body = await res.json().catch(() => null);
    if (!res.ok) {
      bridgeOnline = true; // The server answered; it just refused.

      // The wallet behind this token is gone — the admin unlinked or cleared
      // it. Drop the token so the lock screen asks for a PIN again rather than
      // retrying a binding that no longer exists.
      // 401 means the wallet behind this token is gone: an admin cleared it
      // or reissued the handset. Drop the binding so the lock screen asks for
      // a PIN again rather than retrying one that no longer exists.
      if (res.status === 401) void unlinkDevice();

      const code = body?.error?.code ?? 'HTTP_ERROR';
      const message = body?.error?.message ?? `Request failed (${res.status})`;
      throw new ApiError(message, code);
    }

    bridgeOnline = true;
    return body as T;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    bridgeOnline = false;
    throw new ApiError('Cannot reach the trading server.', 'NETWORK');
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Cached account read
// ---------------------------------------------------------------------------

const CACHE_MS = 1200;

let cached: { at: number; value: RailAccount } | null = null;
let inFlight: Promise<RailAccount> | null = null;

async function account(): Promise<RailAccount> {
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.value;
  if (inFlight) return inFlight;

  inFlight = call<{ account: RailAccount }>('/mpesa/account')
    .then((body) => {
      const value = body.account;
      cached = { at: Date.now(), value };
      return value;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}

/** Drops the cache so the next read is a fresh one. */
function invalidate(): void {
  cached = null;
}

const KIND: Record<RailAccount['statement'][number]['kind'], TxKind> = {
  DEPOSIT: 'paybill',
  WITHDRAWAL: 'receive',
  AGENT_WITHDRAWAL: 'withdraw',
  RECEIVE: 'receive',
  FULIZA_REPAY: 'paybill',
  REVERSAL: 'receive',
};

// ---------------------------------------------------------------------------
// Adapter
// ---------------------------------------------------------------------------

export const bridgeApi: MpesaApi = {
  async verifyPin(pin: string) {
    // Checked against the PIN this handset was linked with, which is the one
    // the admin assigned to this wallet. The pause is the unlock animation,
    // not a network call: the answer is already known on the device.
    await new Promise((r) => setTimeout(r, 650));
    return pinAccepted(pin);
  },

  async getProfile(): Promise<Profile> {
    try {
      const { holderName, phone } = await account();
      // Accounts store numbers in international form (254712345678), and a
      // handset showing 254*******78 on its lock screen is the one detail in
      // the room that says this is not really M-PESA. Rendered the way a
      // Kenyan phone renders it: 0712345678, masked to 071*****78.
      const local = /^254\d{9}$/.test(phone ?? '') ? '0' + (phone as string).slice(3) : (phone ?? '');
      const parts = String(holderName || '').trim().split(/\s+/).filter(Boolean);
      const firstName = parts[0] ?? 'M-PESA';
      const lastName = parts.slice(1).join(' ') || 'User';
      const initials = (firstName[0] ?? 'M') + (lastName[0] ?? 'U');
      return {
        firstName,
        lastName,
        initials: initials.toUpperCase(),
        phone: local,
      };
    } catch {
      return mockApi.getProfile();
    }
  },

  async getBalances(): Promise<Balances> {
    try {
      const { balanceMinor, fuliza } = await account();
      return {
        mpesa: Number((balanceMinor / 100).toFixed(2)),
        // What is left to draw on, not the headline limit: a customer who has
        // already used 2,000 of 5,000 has 3,000, and showing them 5,000 is the
        // one number on this screen that would make them overdraw by mistake.
        fuliza: Number((fuliza.availableMinor / 100).toFixed(2)),
        airtime: 0,
        points: 0,
      };
    } catch {
      return mockApi.getBalances();
    }
  },

  async getTransactions(): Promise<Transaction[]> {
    try {
      const { statement } = await account();
      return statement.map((t) => ({
        id: t.id,
        receipt: t.reference,
        kind: KIND[t.kind] ?? 'withdraw',
        title: t.title,
        subtitle: t.subtitle,
        amount: t.amountMinor / 100,
        balanceAfter: t.balanceAfterMinor / 100,
        date: t.at,
      }));
    } catch {
      return mockApi.getTransactions();
    }
  },

  async lookupAgent(agentNumber: string) {
    // Agents are the phone's own fixture list; the rail has no opinion on them.
    return mockApi.lookupAgent(agentNumber);
  },

  async withdraw({ agentNumber, amount, pin }: WithdrawRequest): Promise<WithdrawResult> {
    if (!pinAccepted(pin)) {
      throw new ApiError('The M-PESA PIN you entered is incorrect.', 'BAD_PIN');
    }

    const agentName = AGENTS[agentNumber];
    if (!agentName) throw new ApiError('Agent number not found.', 'AGENT_NOT_FOUND');
    if (amount < 50) throw new ApiError('The minimum withdrawal amount is Ksh 50.', 'MIN_AMOUNT');

    const charge = withdrawalCharge(amount);

    try {
      const res = await call<{
        balanceMinor: number;
        tx: { reference: string; at: string };
      }>('/mpesa/agent-withdraw', {
        method: 'POST',
        body: JSON.stringify({
          // The charge is taken as part of the same movement: the rail books
          // one debit, and a statement that shows the fee as a separate line
          // from the withdrawal is a statement that has to be reconciled.
          amountMinor: Math.round((amount + charge) * 100),
          agent: agentName,
        }),
      });

      invalidate();

      return {
        receipt: res.tx.reference,
        agentName,
        amount,
        charge,
        balanceAfter: res.balanceMinor / 100,
        date: res.tx.at,
      };
    } catch (e) {
      // A refusal from the server is a real answer — surface it. Only a dead
      // connection falls through to the offline books.
      if (e instanceof ApiError && e.code !== 'NETWORK') throw e;

      const local = await mockApi.withdraw({ agentNumber, amount, pin });
      return { ...local, receipt: local.receipt || receiptCode() };
    }
  },
};

/** Forces the next read to hit the server (used by pull-to-refresh). */
export function refreshBridge(): void {
  invalidate();
}
