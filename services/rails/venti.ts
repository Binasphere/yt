import { Rail, localPhone } from './types';

/**
 * The Venti trading terminal's VIP rail (`tradin-payments` on Render).
 *
 * A VIP depositing on the terminal debits the wallet this phone shows, and a
 * withdrawal pays into it, because both read the same `mpesa_demo_wallet` row.
 */
export const rail: Rail = {
  name: 'Venti',
  baseUrl: 'https://trad-z5gt.onrender.com',
  tokenKey: 'venti.mpesa.deviceToken',
  pinKey: 'venti.mpesa.pin',
  paths: {
    link: '/api/mpesa/link',
    account: '/api/mpesa/account',
    agentWithdraw: '/api/mpesa/agent-withdraw',
  },

  parseLink: (body) => (body?.token ? String(body.token) : null),

  parseAccount(body) {
    const profile = body?.profile ?? null;
    return {
      balanceMinor: Number(body?.balanceMinor ?? 0),
      // Venti keeps no Fuliza ledger; the phone derives a steady limit.
      fulizaAvailableMinor: null,
      firstName: profile?.firstName ?? 'M-PESA',
      lastName: profile?.lastName ?? 'User',
      initials: profile?.initials ?? 'MU',
      phone: localPhone(profile?.phone),
      statement: (body?.transactions ?? []).map((t: any) => ({
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
    code: body?.code ?? 'HTTP_ERROR',
    message: body?.error ?? `Request failed (${status})`,
  }),

  isUnlinked: (_status, body) => body?.code === 'NOT_LINKED',

  agentWithdrawBody: ({ amount, charge, agentNumber, agentName }) => ({
    amountMinor: Math.round(amount * 100),
    chargeMinor: Math.round(charge * 100),
    agentNumber,
    agentName,
  }),

  parseAgentWithdraw: (body) => ({
    reference: String(body.reference),
    balanceMinor: Number(body.balanceMinor),
    at: String(body.at ?? new Date().toISOString()),
  }),
};
