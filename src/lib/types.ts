export type MarketSource = "dexscreener" | "unknown";

export type MarketData = {
  mint: string;
  source: MarketSource;
  priceUsd: number | null;
  marketCapUsd: number | null;
  fdvUsd: number | null;
  volume24hUsd: number | null;
  change24hPct: number | null;
  liquidityUsd: number | null;
  /** ~24 evenly spaced price points (oldest -> newest) when available. */
  sparkline: number[];
  /** Holder count from on-chain / Helius. May be null when not yet fetched. */
  holders: number | null;
  /** ms since epoch. */
  fetchedAt: number;
};

export type EmptyMarket = {
  mint: null;
  source: "unknown";
  priceUsd: null;
  marketCapUsd: null;
  fdvUsd: null;
  volume24hUsd: null;
  change24hPct: null;
  liquidityUsd: null;
  sparkline: [];
  holders: null;
  fetchedAt: number;
};

export function emptyMarket(): EmptyMarket {
  return {
    mint: null,
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
