# WORLD fee-claimer

A small always-on Node service that, **every 10 minutes**, for each of the
flagship country coins (USA, CHN, RUS):

1. Asks pump.fun to build a "collect creator fee" transaction.
2. Signs it locally with that coin's dev wallet and sends it.
3. Sweeps the dev wallet's SOL balance (minus a small reserve for the next
   claim's tx fees) to the `$WORLD` dev wallet.
4. Pings a Telegram bot with the result. Loud alerts on any failure.

It is intentionally isolated from the Next.js site — separate package,
separate secrets, separate deploy.

---

## Architecture (1 minute version)

- **`src/config.ts`** — loads + validates env vars, decodes base58 secret keys.
- **`src/pumpfun.ts`** — thin client around the official
  `POST https://fun-block.pump.fun/agents/collect-fees` endpoint.
- **`src/solana.ts`** — balance reads, signed sends, SOL transfers.
- **`src/telegram.ts`** — Telegram bot notifier (HTML messages).
- **`src/claim.ts`** — per-country claim-and-forward routine. Errors are
  isolated so one country's failure can't kill the others.
- **`src/index.ts`** — entrypoint: cron loop with single-instance lock,
  boot ping, graceful shutdown.

No third-party "bot service" is used — the only external dependency is
the official pump.fun agents API.

---

## Setup

```bash
cd services/fee-claimer
npm install
cp .env.example .env
# fill in .env (see "Env vars" below)
npm run typecheck
```

### Local test in dry-run mode (no real keys yet)

You can boot the service without real dev keys to verify wiring. Use the
placeholder values:

```env
DRY_RUN=true
DEV_USA_PRIVATE_KEY=DRY_RUN_PLACEHOLDER
DEV_CHN_PRIVATE_KEY=DRY_RUN_PLACEHOLDER
DEV_RUS_PRIVATE_KEY=DRY_RUN_PLACEHOLDER
```

In dry-run mode the service:

- Never asks pump.fun to build a tx.
- Never signs anything.
- Logs what it _would_ do and sends a Telegram preview.

Run a one-shot cycle:

```bash
npm run once
```

Run the persistent loop:

```bash
npm run dev   # watches sources, restarts on change
```

### Going live

1. Replace each `DEV_*_PRIVATE_KEY` placeholder with the real base58
   secret key (the format Phantom's "Export private key" gives you).
2. Set `DRY_RUN=false`.
3. Keep `MIN_CLAIM_LAMPORTS` ≥ `10_000_000` (0.01 SOL) so transaction
   fees don't eat tiny claims.
4. Keep `RESERVE_LAMPORTS` ≥ `2_000_000` (0.002 SOL) so the next claim
   always has gas.
5. Start it: `npm run build && npm start`.

---

## Env vars

See `.env.example` for the full list with comments. The minimum you need:

| Var                       | Purpose                                                          |
| ------------------------- | ---------------------------------------------------------------- |
| `SOLANA_RPC_URL`          | Paid Solana RPC (Helius/QuickNode). Public RPCs will drop txs.   |
| `WORLD_DEV_WALLET`        | Destination — your `$WORLD` dev wallet public address.           |
| `DEV_USA_PRIVATE_KEY`     | Base58 secret key of the USA coin's dev wallet (the creator).    |
| `DEV_CHN_PRIVATE_KEY`     | Base58 secret key of the CHN coin's dev wallet.                  |
| `DEV_RUS_PRIVATE_KEY`     | Base58 secret key of the RUS coin's dev wallet.                  |
| `MINT_USA` / `_CHN` / `_RUS` | The three pump.fun mint addresses.                            |
| `TELEGRAM_BOT_TOKEN`      | From @BotFather. Optional but strongly recommended.              |
| `TELEGRAM_CHAT_ID`        | Your chat or channel id.                                         |

### Get a Telegram bot in 2 minutes

1. Open Telegram, message **@BotFather**, send `/newbot`, follow the prompts.
   Copy the token it gives you into `TELEGRAM_BOT_TOKEN`.
2. Start a chat with your new bot and send it any message (so it can DM you).
3. Visit `https://api.telegram.org/bot<TOKEN>/getUpdates` in a browser.
   Find `"chat":{"id":<NUMBER>}` — that number is your `TELEGRAM_CHAT_ID`.

For a private group: add the bot to the group, send a message, then look
up the negative chat id the same way.

---

## Safety rails baked in

- **Per-country error isolation** — one country failing doesn't stop the
  others.
- **Single-instance lock** — overlapping cron ticks are dropped, not run
  in parallel.
- **Min-claim threshold** — skips dust runs that would lose money to fees.
- **Reserve buffer** — never drains a dev wallet below `RESERVE_LAMPORTS`.
- **`PAUSED=true` kill switch** — flip in env to stop without redeploying.
- **`DRY_RUN=true`** — full no-op mode for validation.
- **Sharing-config guard** — if a coin unexpectedly has a sharing config,
  the bot refuses to act and alerts on Telegram.
- **Secret redaction in logs** — pino strips any field named `secretKey`
  / `privateKey` / `keypair`.

---

## Where to run it

A small always-on container. Recommended order:

1. **Railway** or **Fly.io** — easiest. Push, set secrets in the dashboard,
   it stays up. ~$5/month.
2. **Hetzner CX11** + a systemd service. Cheapest.
3. **NOT** Vercel / serverless. This is a long-running cron, not an HTTP
   function.

---

## Operational runbook

- **It went quiet.** Check Telegram for the boot ping. Then
  `npm start` logs (or your host's log viewer) for the most recent
  `cycle starting` / `cycle complete` lines.
- **A claim is failing repeatedly.** Set `DRY_RUN=true`, re-run, and
  check the pump.fun UI for the coin — sometimes coins enter unusual
  states (sharing config, cashback mode). The bot logs the API response.
- **Need to pause now.** Set `PAUSED=true` in the host's env vars and
  redeploy (or restart). Next tick is a no-op.
- **Need to rotate a dev key.** Replace the value in the host's secret
  store, redeploy. The new key must still be the creator on pump.fun
  for that coin.
