/** Metadata for the mother coin ($world on pump.fun). */
export const WORLD = {
  name: "World",
  ticker: "world",
  symbol: "$world",
  tagline: "The hub coin of the country economy.",
  description:
    "World is the mother coin connecting 48 World Cup 2026 nation sub-coins on pump.fun. Each country fights for the top of the global leaderboard — by market cap and by holders.",
  mint: "29Yh3mDBBAEhHrda1gWiiMse5oAdKZz1EVCbsqKBpump",
  /** Leave "" to auto-generate https://pump.fun/coin/{mint} */
  pumpFunUrl: "https://pump.fun/coin/29Yh3mDBBAEhHrda1gWiiMse5oAdKZz1EVCbsqKBpump",
  xUrl: "https://x.com/w_o_r_l_d_xyz",
  /** Brand palette for the World coin itself. */
  colors: ["#0E4DA4", "#F2C849"] as const,
} as const;

/**
 * How pump.fun creator fees from every country sub-coin are allocated.
 * Displayed on site + documented in docs/PLAYBOOK.md.
 */
export const COUNTRY_CREATOR_FEE_SPLIT = {
  /** Share routed to $world buybacks and burns. */
  worldBuybackBurnPct: 50,
  /** Share reserved for marketing (country launches, KOLs, ads). */
  marketingPct: 50,
  summary:
    "50% of creator fees from all 48 country sub-coins fund $world buybacks and burns. The other 50% funds marketing.",
} as const;
