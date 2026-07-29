# M-PESA Clone — Final Year Project

A React Native (Expo) replica of the Safaricom M-PESA app home screen, with one
fully working simulated transaction flow: **agent withdrawal**.

## Running it

```bash
npm install      # only needed once
npm start        # then scan the QR code with Expo Go on your phone
```

Your phone and laptop must be on the same Wi-Fi. If the QR doesn't connect, run
`npx expo start --tunnel`.

## What's implemented

| Area | Status |
| --- | --- |
| Splash screen | `logo.png` centred on white |
| PIN lock screen | Pixel-matched to `assets/pin.png` — entry route |
| Home screen (header, balance carousel, quick actions, frequents) | Pixel-matched to `assets/ss.jpeg` |
| Account name + balance | Fetched through the API layer |
| Withdraw Money | Full flow: agent lookup → amount → PIN → receipt |
| M-PESA statement | Lists transactions produced by withdrawals |
| Other 7 quick actions | Icons only — open a "not in scope" screen |

**Demo PIN: `1234`.** Demo agent numbers are listed on the withdraw screen
(`123456`, `222111`, `654321`, `888777`).

Withdrawal charges use Safaricom's real agent tariff bands (`services/tariff.ts`),
so the receipt totals match what the live app would show.

## Architecture

```
app/                    expo-router screens (file = route)
  index.tsx             PIN lock screen (entry point)
  home.tsx              Home
  statements.tsx        M-PESA statement
  coming-soon.tsx       Placeholder for icon-only tiles
  withdraw/             index → amount → confirm → success
components/             Presentational components
  icons/MpesaIcons.tsx  Hand-drawn SVG replicas of the app's icons
services/               Data layer
  types.ts              MpesaApi interface — the contract
  mockApi.ts            Demo adapter (in-memory, currently active)
  httpApi.ts            Real-backend adapter (fetch)
  config.ts             USE_MOCK switch + BASE_URL
store/AccountContext.tsx  Profile / balance / transaction state
theme/                  Colours and layout tokens
```

### Swapping in the real backend

Screens never call `fetch` directly — they call `api.*`, which satisfies the
`MpesaApi` interface in `services/types.ts`. To go live:

1. Set `USE_MOCK = false` in `services/config.ts`.
2. Set `BASE_URL` to your machine's **LAN IP** (e.g. `http://192.168.1.42:4000`)
   — not `localhost`, because Expo Go runs on the phone.
3. Adjust the endpoint paths in `services/httpApi.ts` to match your server.

No screen or component needs to change.

### Expected API shape

```
POST /api/verify-pin       -> { valid: boolean }     body: { pin }
GET  /api/profile          -> { firstName, lastName, initials, phone }
GET  /api/balance          -> { mpesa, fuliza, airtime, points }
GET  /api/transactions     -> Transaction[]
GET  /api/agents/:number   -> { agentNumber, name }
POST /api/withdraw         -> { receipt, agentName, amount, charge, balanceAfter, date }
     body: { agentNumber, amount, pin }
```

Errors should return a non-2xx status with `{ message, code }`.

## Note

This is an academic simulation built for coursework. It moves no real money and
talks to no Safaricom system.
