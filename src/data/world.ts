/** Metadata for the mother coin ($WORLD on pump.fun). */
export const WORLD = {
  name: "World",
  ticker: "WORLD",
  symbol: "$WORLD",
  tagline: "The hub coin of the country economy.",
  description:
    "World is the mother coin connecting 48 World Cup 2026 nation sub-coins on pump.fun. Each country fights for the top of the global leaderboard — by market cap and by holders.",
  mint: "BnVEt3AjtRCqC3eHKjm8np4apcM9RMieTSsbYYmUpump",
  /** Leave "" to auto-generate https://pump.fun/coin/{mint} */
  pumpFunUrl: "https://pump.fun/coin/BnVEt3AjtRCqC3eHKjm8np4apcM9RMieTSsbYYmUpump",
  /** Brand palette for the World coin itself. */
  colors: ["#0E4DA4", "#F2C849"] as const,
} as const;

/**
 * How pump.fun creator fees from every country sub-coin are allocated.
 * Displayed on site + documented in docs/PLAYBOOK.md.
 */
export const COUNTRY_CREATOR_FEE_SPLIT = {
  /** Share routed to $WORLD buybacks and burns. */
  worldBuybackBurnPct: 50,
  /** Share reserved for marketing (country launches, KOLs, ads). */
  marketingPct: 50,
  summary:
    "50% of creator fees from all 48 country sub-coins fund $WORLD buybacks and burns. The other 50% funds marketing.",
} as const;
