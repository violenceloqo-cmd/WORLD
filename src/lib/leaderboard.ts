import { COUNTRIES, resolveMint, type Country } from "@/data/countries";
import { WORLD } from "@/data/world";
import { getHolderCount, getHolderCounts } from "@/lib/holders";
import { getMarketDataMany } from "@/lib/market";
import type { MarketData } from "@/lib/types";

export type LeaderboardRow = {
  iso: string;
  iso3: string;
  name: string;
  ticker: string;
  flagEmoji: string;
  region: Country["region"];
  population: number;
  colors: [string, string];
  lat: number;
  lng: number;
  mint: string | null;
  pumpFunUrl: string | null;
  /** null while pre-launch */
  market: MarketData | null;
  /** populated when launched and HELIUS_API_KEY is set */
  holders: number | null;
};

export type LeaderboardSnapshot = {
  rows: LeaderboardRow[];
  world: {
    name: string;
    ticker: string;
    mint: string | null;
    market: MarketData | null;
    holders: number | null;
  };
  aggregates: {
    totalMarketCapUsd: number;
    totalVolume24hUsd: number;
    totalHolders: number;
    launchedCount: number;
    pendingCount: number;
  };
  fetchedAt: number;
};

/**
 * Build a leaderboard snapshot — batched DexScreener lookup for all 50
 * countries + the World coin, optional Helius holder counts.
 */
export async function buildLeaderboardSnapshot(): Promise<LeaderboardSnapshot> {
  const mints = COUNTRIES.map((c) => resolveMint(c.mint));
  const worldMint = resolveMint(WORLD.mint);

  const allMints = [...mints, worldMint];
  const allMarkets = await getMarketDataMany(allMints);
  const markets = allMarkets.slice(0, mints.length);
  const worldMarket = allMarkets[allMints.length - 1] ?? null;

  const holders = await getHolderCounts(mints);

  const rows: LeaderboardRow[] = COUNTRIES.map((c, i) => {
    const mint = resolveMint(c.mint);
    const pumpOverride = c.pumpFunUrl.trim();
    return {
      iso: c.iso,
      iso3: c.iso3,
      name: c.name,
      ticker: c.ticker,
      flagEmoji: c.flagEmoji,
      region: c.region,
      population: c.population,
      colors: c.colors,
      lat: c.lat,
      lng: c.lng,
      mint,
      pumpFunUrl: pumpOverride || (mint ? `https://pump.fun/coin/${mint}` : null),
      market: markets[i] ?? null,
      holders: holders[i] ?? null,
    };
  });

  const worldHolders = worldMint ? await getHolderCount(worldMint) : null;

  const launched = rows.filter((r) => r.mint);
  const totalMarketCapUsd = launched.reduce(
    (acc, r) => acc + (r.market?.marketCapUsd ?? 0),
    0,
  );
  const totalVolume24hUsd = launched.reduce(
    (acc, r) => acc + (r.market?.volume24hUsd ?? 0),
    0,
  );
  const totalHolders = launched.reduce(
    (acc, r) => acc + (r.holders ?? 0),
    0,
  );

  return {
    rows,
    world: {
      name: WORLD.name,
      ticker: WORLD.ticker,
      mint: worldMint,
      market: worldMarket ?? null,
      holders: worldHolders,
    },
    aggregates: {
      totalMarketCapUsd,
      totalVolume24hUsd,
      totalHolders,
      launchedCount: launched.length,
      pendingCount: rows.length - launched.length,
    },
    fetchedAt: Date.now(),
  };
}
