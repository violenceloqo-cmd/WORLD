# World Coin Hub

A Next.js site for **$WORLD** — the hub coin on pump.fun (Solana) — and 50
country sub-coins, ranked live on a global leaderboard.

> Visual language: **Atlas Editorial**. Bold serif display, tabular mono
> numbers, paper + ink palette, latitude/longitude grid texture, country
> flag-derived accent colors. Deliberately not generic crypto purple.

## Stack

- **Next.js 15** (App Router, Turbopack) + **TypeScript**
- **Tailwind CSS v4** (CSS-first `@theme` tokens)
- **shadcn/ui** primitives (Radix) — used sparingly, custom components for the editorial look
- **`cobe`** — lightweight 3D globe (no Three.js bundle)
- **Framer Motion** — leaderboard layout animations
- **SWR** — client-side revalidation on top of cached Route Handlers
- **DexScreener API** (primary) + **pump.fun frontend API** (fallback) for market data
- **Helius RPC** (optional) for holder counts

## Project structure

```
src/
  app/
    layout.tsx              # Root layout, fonts, header/footer
    page.tsx                # Home — hero + globe + concept + top-10 preview
    leaderboard/            # Full sortable leaderboard
    c/[iso]/                # Country detail (flag-bleed hero + stats + chart + rivals)
    world/                  # $WORLD mother coin page
    manifesto/              # Concept manifesto
    api/
      leaderboard/route.ts  # Aggregated snapshot, 60s revalidate
      coin/[mint]/route.ts  # Single coin lookup
    globals.css             # Atlas Editorial tokens
  components/
    globe.tsx               # cobe-powered 3D globe
    leaderboard-table.tsx   # Sortable/filterable table w/ Framer Motion
    leaderboard-live.tsx    # SWR wrapper that polls /api/leaderboard
    price-chart.tsx         # Recharts 7d area chart
    sparkline.tsx           # Tiny inline SVG sparkline
    site-header.tsx
    site-footer.tsx
    ui.tsx                  # RankBadge, FlagBar, Stat, Pill, ButtonLink, ChangePct, LiveDot
  data/
    countries.ts            # 50 countries by population (ISO, flag, population, palette, lat/lng, mint?)
    world.ts                # $WORLD metadata
  lib/
    market.ts               # DexScreener + pump.fun fetch
    holders.ts              # Helius holder count (optional)
    leaderboard.ts          # Snapshot builder + aggregates
    format.ts               # Number / currency formatters
    types.ts                # Shared market types
    utils.ts                # cn()
docs/
  PLAYBOOK.md               # Launch playbook for the tokens
```

## Getting started

```bash
npm install
cp .env.example .env.local   # Optional: paste a Helius key for holder counts
npm run dev
```

Open <http://localhost:3000>.

## Wiring real tokens

1. Launch `$WORLD` on pump.fun (see `docs/PLAYBOOK.md`).
2. Paste the mint into `src/data/world.ts`.
3. As each country coin goes live, paste its mint into the matching entry in
   `src/data/countries.ts` (`mint` field). The site automatically:
   - Pulls market cap, price, 24h volume/change from DexScreener.
   - Pulls holders from Helius (if `HELIUS_API_KEY` is set).
   - Flips the country page from "Pre-launch" to live stats.

No code changes needed once the mint is in — caches refresh every 60 seconds.

## Environment

| Var | Required | Purpose |
|---|---|---|
| `HELIUS_API_KEY` | optional | Holder counts. Free tier from <https://helius.dev>. |
| `NEXT_PUBLIC_SITE_URL` | optional | Canonical URL for metadata. |

## Notes & limitations

- Price charts on country pages currently use a deterministic synthetic 7-day
  series until a historical OHLC source is wired (Birdeye, GeckoTerminal, or
  DexScreener candles). Spot stats and 24h change are real.
- Sparklines in the leaderboard row are also synthetic (slope-matched to the
  real 24h change) until candles are wired.
- pump.fun frontend API is unofficial; the DexScreener path covers most
  graduated coins reliably.

See `docs/PLAYBOOK.md` for the full token launch plan.
