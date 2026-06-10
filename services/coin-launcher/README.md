# World Coin Launcher

Batch-deploy the 48 World Cup nation coins on [pump.fun](https://pump.fun) as **USDC-paired** tokens (no initial buy).

Your private key stays on your machine — never paste it into chat or commit it.

## Setup

From the **repo root** (recommended):

```bash
# Put DEPLOYER_PRIVATE_KEY in the root .env (or services/coin-launcher/.env)
cd services/coin-launcher && npm install && cd ../..
```

Or work only inside `services/coin-launcher`:

```bash
cd services/coin-launcher
cp .env.example .env
npm install
```

The launcher reads **both** `services/coin-launcher/.env` and the repo root `.env`.
If `HELIUS_API_KEY` is set in root `.env`, it is used as the RPC automatically.

Fund the deployer wallet with **~0.5–1 SOL** (tx fees only; USDC is not required for create-only launches).

## Usage

From the **repo root**:

```bash
npm run launch:dry
npm run launch -- --only cv
npm run launch
```

Or from `services/coin-launcher/`:

```bash
npm run launch:dry
npm run launch -- --only cv
npm run launch
```

Re-deploy a country that failed:

```bash
npm run launch -- --only br --force
```

## Per-coin metadata

| Field | Value |
|-------|-------|
| Name | `Brazil` (plain country name) |
| Ticker | from `countries.ts` (e.g. `BRZ`) |
| Image | literal flag (1024×1024 PNG via flagcdn) |
| Website | `https://worldcoins.fun/c/{iso}` |
| Twitter | `https://x.com/worldcoinpmpfun` |
| Pair | **USDC** (`quoteMint`) |

After each successful create, the mint is written to `src/data/countries.ts` and logged in `deployments.json`.

## Deploy $WORLD separately

This tool does **not** touch `src/data/world.ts`. Launch `$WORLD` manually on pump.fun when ready.

## Optional: Pinata fallback

If `pump.fun/api/ipfs` fails, set `PINATA_JWT` in `.env` for automatic fallback.
