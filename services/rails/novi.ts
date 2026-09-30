import { Rail, localPhone, splitHolder } from './types';

/**
 * Novi's VIP demo rail (the Novi API, routes under `/mpesa/*`).
 *
 * Fuliza is tracked by the server here: an admin sets a limit per wallet in
 * the Novi console, so the phone shows what the server says is left.
 */
export const rail: Rail = {
  name: 'Novi',
  baseUrl: 'https://backend-avzc.onrender.com',
  tokenKey: 'novi.mpesa.deviceToken',
  pinKey: 'novi.mpesa.pin',
  paths: {
    link: '/mpesa/link',
    account: '/mpesa/account',
    agentWithdraw: '/mpesa/agent-withdraw',
  },

  parseLink: (body) => (body?.deviceToken ? String(body.deviceToken) : null),

  parseAccount(body) {
    const account = body?.account ?? {};
    return {
      balanceMinor: Number(account.balanceMinor ?? 0),
      fulizaAvailableMinor: Number(account.fuliza?.availableMinor ?? 0),
      ...splitHolder(account.holderName),
      phone: localPhone(account.phone),
      statement: (account.statement ?? []).map((t: any) => ({
        id: String(t.id),
        kind: String(t.kind),
        title: String(t.title ?? ''),
        subtitle: String(t.subtitle ?? ''),
        amountMinor: Number(t.amountMinor ?? 0),
        balanceAfterMinor: Number(t.balanceAfterMinor ?? 0),
        reference: String(t.reference ?? ''),
        at: String(t.at ?? new Date().toISOString()),
      })),
    };
  },

  parseError: (body, status) => ({
    code: body?.error?.code ?? 'HTTP_ERROR',
    message: body?.error?.message ?? `Request failed (${status})`,
  }),

  isUnlinked: (status) => status === 401,

  // The charge is booked in the same debit: one line on the statement.
  agentWithdrawBody: ({ amount, charge, agentName }) => ({
    amountMinor: Math.round((amount + charge) * 100),
    agent: agentName,
  }),

  parseAgentWithdraw: (body) => ({
    reference: String(body.tx.reference),
    balanceMinor: Number(body.balanceMinor),
    at: String(body.tx.at),
  }),
};
