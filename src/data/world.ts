/**
 * Metadata for the mother coin. Paste pump.fun mint into `mint` when $WORLD launches.
 */
export const WORLD = {
  name: "World",
  ticker: "WORLD",
  symbol: "$WORLD",
  tagline: "The hub coin of the country economy.",
  description:
    "World is the mother coin connecting 50 country sub-coins on pump.fun. Each country fights for the top of the global leaderboard — by market cap and by holders.",
  /** Paste the Solana mint address from pump.fun between the quotes. */
  mint: "9uxk3teC769uPA7PqoNjTmTxEGHyUe33qmdsXN5fpump",
  /** Leave "" to auto-generate https://pump.fun/coin/{mint} */
  pumpFunUrl: "",
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
    "50% of creator fees from all 50 country sub-coins fund $WORLD buybacks and burns. The other 50% funds marketing.",
} as const;
