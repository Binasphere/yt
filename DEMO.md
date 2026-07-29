# Running the demo

Two apps, one balance. The trading terminal (Venti, `Desktop/tradin`) and this
phone app read the same wallet — two tables in Supabase — so money moving in one
is visible in the other within a few seconds.

## Before the first run (once)

1. In the Supabase SQL editor, run `Desktop/tradin/supabase/mpesa-demo.sql`.
   That creates the wallets, the statements and the functions that move them.
2. In the Venti admin console → **Users**, find the VIP account and press
   **Set up M-PESA handset**. Give it a four-digit **PIN** and an **opening
   balance** (in cents — 25670000 is KSh 256,700). Each VIP gets their own PIN,
   and a PIN can only be assigned to one account.

The control only appears on VIP rows: the tier is what decides whether an
account settles against the handset or against real PayHero money.

## Start order

1. **The phone app** — `cd Desktop/mpesaclone && npx expo start`, then scan the
   QR in Expo Go. On first launch it asks to be **linked**: type the PIN the
   admin assigned. That binds this handset to that VIP account and is
   remembered from then on — later launches unlock with any four digits, like
   the real app's lock screen.
2. **The terminal** — either is fine, and both drive the same wallet:
   - the deployed site, or
   - `cd Desktop/tradin && npm run dev` on the laptop.

Several handsets can run at once, each linked to a different VIP with its own
PIN and its own balance.

The phone talks to the payments service on Render (`services/config.ts`,
`PREFER = 'remote'`), so it needs mobile data or Wi-Fi with internet — **not**
the same network as the laptop. To run it all on a LAN with no internet, set
`PREFER = 'lan'` and start the terminal with `npm run dev`.

> **Cold start.** Render's free plan spins the service down after ~15 idle
> minutes and the next request can wait the better part of a minute. Open
> https://trad-z5gt.onrender.com/health once before you go on stage — it should
> answer `{"ok":true,...}` — and the demo stays warm.

## What to show

| Action in the terminal | What the phone does |
| --- | --- |
| VIP signs in, Deposit → KSh 10,000 → Pay now | Balance drops by 10,000; "Pay to Venti" appears in the statement |
| VIP withdraws to M-Pesa | Balance rises by the amount immediately — no admin queue |

The rail is **VIP only**. A Standard account still goes to PayHero and a real
STK push, which is worth showing side by side if there is time: same dialog,
different rail, decided by `profiles.live_tier`.

## Between run-throughs

Easiest is the admin console: reopen **Set up M-PESA handset** and save the
opening balance again. Or from a terminal, with that handset's device token:

```
curl -X POST https://trad-z5gt.onrender.com/api/mpesa/reset \
  -H "Authorization: Bearer <deviceToken>" \
  -H "content-type: application/json" \
  -d '{"balanceMinor": 25670000}'
```

A reset clears that one handset's statement and leaves every other phone in the
room alone. The device token survives, so the phone stays linked.

## If the network turns hostile

The phone falls back to its own in-memory data and keeps working — same opening
balance, agent withdrawals still complete, only the link to the terminal is
gone.

If the admin unlinks the handset (or clears the wallet), the next request comes
back `NOT_LINKED`, the phone forgets its token, and the lock screen asks for a
PIN again.

## Endpoints

Served by **both** the Render service and `tradin/src/app/api/mpesa/`, over the
same Supabase wallets:

- `POST /link` — PIN → device token. The only call an unlinked phone may make
- `GET /account` — that handset's VIP profile + balance + statement
- `POST /deposit` — VIP only, Supabase bearer token; debits the phone, credits Live
- `POST /withdraw` — VIP only, Supabase bearer token; pays a booked withdrawal to the phone
- `POST /agent-withdraw` — the phone's own agent withdrawal (device token)
- `POST /reset` — that one handset back to an opening balance (device token)
