import { BASE_URL, REQUEST_TIMEOUT, pinAccepted } from './config';
import { currentToken, loadToken, unlinkDevice } from './link';
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
 * `/api/mpesa/account` read, cached briefly so the three `useAccount` calls
 * behind one refresh do not become three requests.
 *
 * Which wallet that is comes from the device token this handset was given when
 * its PIN was accepted (see `link.ts`). Every call carries it, so two phones in
 * the same room show two different customers.
 *
 * Every call falls back to the offline data in `mockApi` rather than throwing.
 * The app is a demo prop: showing a stale balance beats showing an error.
 */

interface RailProfile {
  phone: string;
  firstName: string;
  lastName: string;
  initials: string;
}

interface RailAccount {
  linked: boolean;
  profile: RailProfile | null;
  balanceMinor: number;
  transactions: {
    id: string;
    kind: 'DEPOSIT' | 'WITHDRAWAL' | 'AGENT_WITHDRAWAL';
    title: string;
    subtitle: string;
    amountMinor: number;
    balanceAfterMinor: number;
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
      if (body?.code === 'NOT_LINKED') void unlinkDevice();

      throw new ApiError(body?.error ?? `Request failed (${res.status})`, body?.code ?? 'HTTP_ERROR');
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

  inFlight = call<RailAccount>('/api/mpesa/account')
    .then((value) => {
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

const KIND: Record<RailAccount['transactions'][number]['kind'], TxKind> = {
  DEPOSIT: 'paybill',
  WITHDRAWAL: 'receive',
  AGENT_WITHDRAWAL: 'withdraw',
};

// ---------------------------------------------------------------------------
// Adapter
// ---------------------------------------------------------------------------

export const bridgeApi: MpesaApi = {
  async verifyPin(pin: string) {
    // The PIN is a demo formality — no account on the rail has one.
    await new Promise((r) => setTimeout(r, 900));
    return pinAccepted(pin);
  },

  async getProfile(): Promise<Profile> {
    try {
      const { profile } = await account();
      if (!profile) return mockApi.getProfile();
      return {
        firstName: profile.firstName,
        lastName: profile.lastName,
        initials: profile.initials,
        phone: profile.phone,
      };
    } catch {
      return mockApi.getProfile();
    }
  },

  async getBalances(): Promise<Balances> {
    try {
      const { balanceMinor } = await account();
      return {
        mpesa: Number((balanceMinor / 100).toFixed(2)),
        fuliza: 800,
        airtime: 0,
        points: 0,
      };
    } catch {
      return mockApi.getBalances();
    }
  },

  async getTransactions(): Promise<Transaction[]> {
    try {
      const { transactions } = await account();
      return transactions.map((t) => ({
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
      const res = await call<{ reference: string; balanceMinor: number; at: string }>(
        '/api/mpesa/agent-withdraw',
        {
          method: 'POST',
          body: JSON.stringify({
            amountMinor: Math.round(amount * 100),
            chargeMinor: Math.round(charge * 100),
            agentNumber,
            agentName,
          }),
        }
      );

      invalidate();

      return {
        receipt: res.reference,
        agentName,
        amount,
        charge,
        balanceAfter: res.balanceMinor / 100,
        date: res.at,
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
