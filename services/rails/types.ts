/**
 * What the app needs from a backend, whichever project it is serving.
 *
 * This handset is the customer side of a demo M-PESA rail used by two
 * projects — the Venti trading terminal and Novi — and the two backends speak
 * slightly different dialects: different hosts, a different path prefix, and
 * different response shapes. Each rail file translates its backend into these
 * shapes, and nothing else in the app knows which one is active.
 *
 * Which one is active is chosen in `../config.ts`.
 */

export interface RailTx {
  id: string;
  /** The backend's own kind, mapped to an icon in bridgeApi. */
  kind: string;
  title: string;
  subtitle: string;
  amountMinor: number;
  balanceAfterMinor: number;
  reference: string;
  at: string;
}

export interface RailAccount {
  balanceMinor: number;
  /**
   * What is left to borrow, when the backend tracks Fuliza itself. Null means
   * the backend has no opinion and the app derives a limit on the phone.
   */
  fulizaAvailableMinor: number | null;
  firstName: string;
  lastName: string;
  initials: string;
  /** Local form, e.g. 0712345678. */
  phone: string;
  statement: RailTx[];
}

export interface Rail {
  /** For logs and the About screen. */
  name: string;
  baseUrl: string;
  tokenKey: string;
  pinKey: string;
  paths: { link: string; account: string; agentWithdraw: string };

  /** The device token in a successful link response, or null. */
  parseLink(body: any): string | null;
  parseAccount(body: any): RailAccount;
  parseError(body: any, status: number): { code: string; message: string };
  /** True when a refusal means this handset's binding is gone. */
  isUnlinked(status: number, body: any): boolean;

  agentWithdrawBody(input: {
    amount: number;
    charge: number;
    agentNumber: string;
    agentName: string;
  }): unknown;
  parseAgentWithdraw(body: any): { reference: string; balanceMinor: number; at: string };
}

/** 254712345678 -> 0712345678; anything else as it came. */
export function localPhone(phone: string | null | undefined): string {
  const value = phone ?? '';
  return /^254\d{9}$/.test(value) ? '0' + value.slice(3) : value;
}

export function splitHolder(holderName: string | null | undefined) {
  const parts = String(holderName || '').trim().split(/\s+/).filter(Boolean);
  const firstName = parts[0] ?? 'M-PESA';
  const lastName = parts.slice(1).join(' ') || 'User';
  const initials = ((firstName[0] ?? 'M') + (lastName[0] ?? 'U')).toUpperCase();
  return { firstName, lastName, initials };
}
