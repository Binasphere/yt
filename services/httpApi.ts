import { BASE_URL } from './config';
import {
  ApiError,
  Balances,
  MpesaApi,
  Profile,
  Transaction,
  WithdrawRequest,
  WithdrawResult,
} from './types';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    });
  } catch {
    throw new ApiError('Cannot reach the server. Check your connection.', 'NETWORK');
  }

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(body?.message ?? `Request failed (${res.status})`, body?.code ?? 'HTTP_ERROR');
  }
  return body as T;
}

/**
 * Real-backend adapter. Endpoint paths are guesses — adjust them to match
 * your server once it is wired up, then flip USE_MOCK in config.ts.
 */
export const httpApi: MpesaApi = {
  verifyPin: async (pin: string) => {
    const res = await request<{ valid: boolean }>('/api/verify-pin', {
      method: 'POST',
      body: JSON.stringify({ pin }),
    });
    return res.valid;
  },
  getProfile: () => request<Profile>('/api/profile'),
  getBalances: () => request<Balances>('/api/balance'),
  getTransactions: () => request<Transaction[]>('/api/transactions'),
  lookupAgent: (agentNumber: string) =>
    request<{ agentNumber: string; name: string }>(`/api/agents/${agentNumber}`),
  withdraw: (req: WithdrawRequest) =>
    request<WithdrawResult>('/api/withdraw', { method: 'POST', body: JSON.stringify(req) }),
};
