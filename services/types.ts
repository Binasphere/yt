export type Profile = {
  firstName: string;
  lastName: string;
  initials: string;
  phone: string;
};

export type Balances = {
  mpesa: number;
  fuliza: number;
  airtime: number;
  points: number;
};

export type TxKind = 'withdraw' | 'send' | 'receive' | 'paybill' | 'airtime';

export type Transaction = {
  id: string;
  receipt: string;
  kind: TxKind;
  title: string;
  subtitle: string;
  amount: number; // negative = money out
  balanceAfter: number;
  date: string; // ISO
};

export type WithdrawRequest = {
  agentNumber: string;
  amount: number;
  pin: string;
};

export type WithdrawResult = {
  receipt: string;
  agentName: string;
  amount: number;
  charge: number;
  balanceAfter: number;
  date: string;
};

/**
 * Every screen talks to this interface only. The mock adapter and the future
 * HTTP adapter both implement it, so swapping backends touches no UI code.
 */
export interface MpesaApi {
  /** Unlocks the app at launch. Resolves true only for a correct PIN. */
  verifyPin(pin: string): Promise<boolean>;
  getProfile(): Promise<Profile>;
  getBalances(): Promise<Balances>;
  getTransactions(): Promise<Transaction[]>;
  lookupAgent(agentNumber: string): Promise<{ agentNumber: string; name: string }>;
  withdraw(req: WithdrawRequest): Promise<WithdrawResult>;
}

export class ApiError extends Error {
  constructor(message: string, readonly code: string = 'ERROR') {
    super(message);
    this.name = 'ApiError';
  }
}
