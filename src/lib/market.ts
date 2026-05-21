import { type MarketData } from "@/lib/types";

/**
 * Market data via DexScreener's public API — no API key required.
 *
 * Docs: https://docs.dexscreener.com/api/reference
 * Endpoint: GET https://api.dexscreener.com/latest/dex/tokens/{mint1,mint2,...}
 *
 * Supports comma-separated batch lookups (up to ~30 mints per request).
 * For each mint we pick the most liquid Solana pair and normalize price,
 * market cap, FDV, 24h volume, 24h change, and liquidity.
 */

const DEXSCREENER_TOKENS = "https://api.dexscreener.com/latest/dex/tokens";
const DEXSCREENER_BATCH_SIZE = 30;

type DexPair = {
  chainId: string;
  dexId: string;
  baseToken?: { address?: string };
  priceUsd?: string;
  fdv?: number;
  marketCap?: number;
  volume?: { h24?: number };
  priceChange?: { h24?: number };
  liquidity?: { usd?: number };
};

type DexResponse = {
  pairs?: DexPair[];
};

export async function getMarketData(mint: string): Promise<MarketData> {
  const batch = await fetchDexScreenerBatch([mint]);
  return batch.get(mint) ?? emptyMarketFor(mint);
}

export async function getMarketDataMany(
  mints: Array<string | null | undefined>,
): Promise<Array<MarketData | null>> {
  const unique = Array.from(
    new Set(mints.filter((m): m is string => !!m && m.trim().length > 0)),
  );
  if (unique.length === 0) return mints.map(() => null);

  const dexMap = new Map<string, MarketData>();
  for (let i = 0; i < unique.length; i += DEXSCREENER_BATCH_SIZE) {
    const slice = unique.slice(i, i + DEXSCREENER_BATCH_SIZE);
    const batch = await fetchDexScreenerBatch(slice);
    batch.forEach((v, k) => dexMap.set(k, v));
  }

  return mints.map((m) => {
    if (!m) return null;
    return dexMap.get(m) ?? emptyMarketFor(m);
  });
}

async function fetchDexScreenerBatch(
  mints: string[],
): Promise<Map<string, MarketData>> {
  const out = new Map<string, MarketData>();
  if (mints.length === 0) return out;

  try {
    const url = `${DEXSCREENER_TOKENS}/${mints.join(",")}`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return out;

    const json = (await res.json()) as DexResponse;
    const pairs = json.pairs ?? [];
    if (pairs.length === 0) return out;

    const byMint = new Map<string, DexPair[]>();
    for (const p of pairs) {
      const addr = p.baseToken?.address;
      if (!addr) continue;
      if (!byMint.has(addr)) byMint.set(addr, []);
      byMint.get(addr)!.push(p);
    }

    for (const mint of mints) {
      const candidates = byMint.get(mint) ?? [];
      if (candidates.length === 0) continue;

      const solana = candidates.filter((p) => p.chainId === "solana");
      const pool = solana.length > 0 ? solana : candidates;
      const best = pool.reduce((a, b) => {
        const al = a.liquidity?.usd ?? 0;
        const bl = b.liquidity?.usd ?? 0;
        return bl > al ? b : a;
      });

      const priceUsd = best.priceUsd ? Number(best.priceUsd) : null;
      out.set(mint, {
        mint,
        source: "dexscreener",
        priceUsd: priceUsd !== null && Number.isFinite(priceUsd) ? priceUsd : null,
        marketCapUsd: best.marketCap ?? best.fdv ?? null,
        fdvUsd: best.fdv ?? null,
        volume24hUsd: best.volume?.h24 ?? null,
        change24hPct: best.priceChange?.h24 ?? null,
        liquidityUsd: best.liquidity?.usd ?? null,
        sparkline: [],
        holders: null,
        fetchedAt: Date.now(),
      });
    }
  } catch {
    // best-effort
  }
  return out;
}

function emptyMarketFor(mint: string): MarketData {
  return {
    mint,
    source: "unknown",
    priceUsd: null,
    marketCapUsd: null,
    fdvUsd: null,
    volume24hUsd: null,
    change24hPct: null,
    liquidityUsd: null,
    sparkline: [],
    holders: null,
    fetchedAt: Date.now(),
  };
}
