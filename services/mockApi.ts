import { DEMO_PIN, MOCK_LATENCY } from './config';
import { withdrawalCharge } from './tariff';
import {
  ApiError,
  Balances,
  MpesaApi,
  Profile,
  Transaction,
  WithdrawRequest,
  WithdrawResult,
} from './types';

const wait = (ms = MOCK_LATENCY) => new Promise((r) => setTimeout(r, ms));

/** In-memory state — resets when the Metro bundle reloads. */
const db = {
  profile: {
    firstName: 'Deon',
    lastName: 'Orina',
    initials: 'DO',
    phone: '0700123484',
  } as Profile,
  balances: { mpesa: 3890.13, fuliza: 800, airtime: 0, points: 0 } as Balances,
  transactions: [] as Transaction[],
};

const AGENTS: Record<string, string> = {
  '123456': 'QUICKMART SUPERMARKET',
  '222111': 'NAIVAS AGENT - KILIMANI',
  '654321': 'TUSKYS AGENT - CBD',
  '888777': 'MAMA NJERI SHOP',
};

function receiptCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let out = 'T';
  for (let i = 0; i < 9; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export const mockApi: MpesaApi = {
  async verifyPin(pin: string) {
    await wait(900);
    return pin === DEMO_PIN;
  },

  async getProfile() {
    await wait();
    return { ...db.profile };
  },

  async getBalances() {
    await wait();
    return { ...db.balances };
  },

  async getTransactions() {
    await wait(300);
    return [...db.transactions];
  },

  async lookupAgent(agentNumber: string) {
    await wait(500);
    const name = AGENTS[agentNumber];
    if (!name) throw new ApiError('Agent number not found. Check and try again.', 'AGENT_NOT_FOUND');
    return { agentNumber, name };
  },

  async withdraw({ agentNumber, amount, pin }: WithdrawRequest) {
    await wait(1400);

    if (pin !== DEMO_PIN) throw new ApiError('The M-PESA PIN you entered is incorrect.', 'BAD_PIN');

    const agentName = AGENTS[agentNumber];
    if (!agentName) throw new ApiError('Agent number not found.', 'AGENT_NOT_FOUND');

    if (amount < 50) throw new ApiError('The minimum withdrawal amount is Ksh 50.', 'MIN_AMOUNT');

    const charge = withdrawalCharge(amount);
    const total = amount + charge;
    if (total > db.balances.mpesa) {
      throw new ApiError(
        'You do not have enough money in your M-PESA account to complete this transaction.',
        'INSUFFICIENT_FUNDS'
      );
    }

    db.balances.mpesa = Number((db.balances.mpesa - total).toFixed(2));

    const result: WithdrawResult = {
      receipt: receiptCode(),
      agentName,
      amount,
      charge,
      balanceAfter: db.balances.mpesa,
      date: new Date().toISOString(),
    };

    db.transactions.unshift({
      id: result.receipt,
      receipt: result.receipt,
      kind: 'withdraw',
      title: `Withdraw from ${agentName}`,
      subtitle: `Agent ${agentNumber}`,
      amount: -total,
      balanceAfter: db.balances.mpesa,
      date: result.date,
    });

    return result;
  },
};

/** Exposed so the UI can show valid demo agent numbers on the withdraw screen. */
export const DEMO_AGENTS = Object.entries(AGENTS).map(([number, name]) => ({ number, name }));
