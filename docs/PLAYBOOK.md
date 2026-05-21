# World Coin — Launch Playbook

> A practical, opinionated playbook for shipping `$WORLD` and 50 country
> sub-coins on pump.fun. Treat this as a living document — update it after
> each wave.

---

## 0. Read me first

- `$WORLD` is the **hub coin**. It launches first and stays the gravitational
  center of the project. Country coins exist to feed into the World economy.
- Country tickers are **symbolic**. They are memes for fans of a place — they
  are **not** affiliated with, endorsed by, or representative of any actual
  government, embassy, regulator, central bank, or military.
- Always include the disclaimer on the site and on social posts.

---

## 1. Token strategy

### Mother coin

| Field        | Value |
|--------------|-------|
| Name         | World |
| Ticker       | `$WORLD` |
| Chain        | Solana / pump.fun |
| Total supply | pump.fun default (1B) |
| Theme        | Hub coin, navy + gold |

### Country sub-coins — naming convention

| Country        | Proposed ticker |
|----------------|-----------------|
| United States  | `$USA` |
| China          | `$CHN` |
| India          | `$IND` |
| Russia         | `$RUS` |
| Germany        | `$GER` |
| Japan          | `$JPN` |
| Brazil         | `$BRZ` |
| United Kingdom | `$GBR` |
| France         | `$FRA` |
| Türkiye        | `$TUR` |
| ...            | ISO-3 by default; substitute when ISO-3 is unflattering or already heavily used |

> Note: pump.fun does not enforce ticker uniqueness. Always link directly to
> the **mint** in your communications, not the ticker.

### Rollout waves

Launch in deliberate waves to concentrate attention and avoid diluting the
narrative.

1. **Genesis** — `$WORLD` alone for 24–72h. Build the hub.
2. **Wave 1: G7** — `$USA $GBR $FRA $GER $JPN $ITA $CAN`. Highest media gravity.
3. **Wave 2: BRICS+** — `$BRZ $RUS $IND $CHN $ZAF $SAU $IRN $EGY`.
4. **Wave 3: Asia/Pacific** — `$IDN $KOR $VNM $THA $PHP $MYR $PAK $BGD $AUS`.
5. **Wave 4: Europe + Latam** — `$ESP $POL $UKR $MEX $COL $ARG $PER`.
6. **Wave 5: Africa & frontier** — `$NGN $ETH $TZA $KEN $UGA $SDN $DZA $MAR $GHA $AGO $MOZ`.
7. **Wave 6: Long tail** — fill the remaining 50.

> Aim for ~8–10 coins per wave, spaced 24–48 hours apart. Hold the
> leaderboard livestream / X Space at the start of each wave.

---

## 2. Deploying a coin on pump.fun

For each coin:

1. **Wallet hygiene** — generate a fresh Solana wallet for the dev launch.
   Never reuse the wallet that launched a previous coin. This avoids
   "same dev" attribution flags.
2. **Fund** the wallet with ~0.5 SOL (enough for create + initial buy +
   gas headroom).
3. **Prep metadata**
   - Name: `<Country> (WORLD)` — e.g. `Russia (WORLD)`
   - Ticker: see table above
   - Image: 1024×1024 PNG. Flag-derived palette, *not* a literal flag photo.
   - Description: 1 sentence + link to the country page on this site, e.g.
     `Country coin #${ticker} in the World economy. world-coin.xyz/c/${iso}`
   - Twitter / Telegram / Website fields: filled in **before** launch.
4. **Create the coin** on pump.fun.
5. **Anti-snipe seed buy** — execute the initial buy in the same transaction
   bundle as the create (pump.fun supports this). Recommended seed:
   **0.1–0.5 SOL** depending on hype level. This stops bundle snipers from
   front-running you.
6. **Post the mint address** simultaneously to:
   - The country page on this site (update `src/data/countries.ts` → `mint`)
   - The official `@worldcoin_hub` X (or your handle)
   - The country sub-account (e.g. `@usa_world_coin`)
7. **Pin the link**. Pump.fun chart, DexScreener, and Solscan.

---

## 3. Creator fee split (all country sub-coins)

Every country sub-coin on pump.fun earns **creator fees** on trades. Allocate
them the same way for all 50 nations:

| Share | Destination |
|-------|-------------|
| **50%** | **$WORLD buybacks & burns** — country volume directly strengthens the hub |
| **50%** | **Marketing** — launches, KOLs, paid social, league growth |

Operational notes:

- Document this split on X, the site (`/world`, `/manifesto`), and in launch tweets.
- Route the $WORLD half through a dedicated buyback/burn wallet or bot; log txs publicly when possible.
- Route the marketing half through `marketing.sol` (see below) with per-country campaign tracking.

Constants live in `src/data/world.ts` as `COUNTRY_CREATOR_FEE_SPLIT`.

---

## 4. Treasury & operational wallets

| Wallet            | Purpose |
|-------------------|---------|
| `dev_world.sol`   | Launches `$WORLD` only. Then archived. |
| `dev_<iso>.sol`   | Fresh wallet per country coin launch. |
| `treasury.sol`    | Holds ops funds (marketing, infra). |
| `marketing.sol`   | Operates KOL / paid social (50% creator-fee share). |
| `world_buyback.sol` | Executes $WORLD buybacks & burns (50% creator-fee share). |
| `multisig.sol`    | Cold storage for $WORLD treasury. Multi-sig (Squads). |

**Never** route a country coin's dev wallet through the treasury — that ties
the project's reputation to every coin's chart. Per-country dev wallets stay
independent.

---

## 5. Per-country branding kit

For every country, prepare:

- **Palette** — two colors derived from the flag (already in `src/data/countries.ts`).
- **Mascot prompt** — a one-line image prompt for consistent avatars:
  `A bold editorial vector mascot for ${country}, ${primary_color} + ${secondary_color}, paper texture, flat, no flag, no national symbol references, 1024×1024.`
- **X handle convention** — `@<iso>_world_coin` (e.g. `@usa_world_coin`).
- **Tagline** — one localized sentence in the country's primary language plus an English version.
- **Pin tweet template** — mint address, leaderboard rank, link to the country page.

---

## 6. Liquidity & graduation

- pump.fun graduates a coin to Raydium at a ~$69k market cap. Until then,
  the bonding curve is the market.
- **Do not** burn LP manually — pump.fun handles graduation automatically.
- After graduation:
  - Add the Raydium pair link to the country page (replaces pump.fun link
    as the primary buy CTA when liquidity > $50k).
  - Update DexScreener boost / trending strategy.
- Avoid OTC trades from the dev wallet for the first **48 hours** post-graduation.

---

## 7. Marketing playbook

### Always-on

- A daily "Standings" tweet from `@worldcoin_hub`: a screenshot of the
  leaderboard top 10 with the day's biggest movers.
- Rivalry posts when two countries swap rank — pin them. These convert.

### Per-launch

- Coordinate launch tweets across:
  - `@worldcoin_hub` (announces)
  - `@<iso>_world_coin` (country handle)
  - 3–5 KOLs with audience in that country / language
- Always link the **mint address**, never just the ticker, to avoid impostors.

### Localized content

For each non-English country, prepare a single tweet of:
- "Your country's coin is live" in the local language.
- Mint address.
- Link to the country page.

### Hype loops

- Twitter Spaces every Friday: "This week in the World economy."
- "Wall of fame" — biggest single holder per country gets pinned on
  the country page (manual add via a follow-up feature).

---

## 8. Risk & compliance

- Disclaimer **must** be on:
  - Site footer (already shipped).
  - Every country page (already shipped via global footer).
  - Every official social profile.
- Avoid using:
  - Real military insignia
  - Real heads of state, alive or recently deceased
  - National anthems, official state logos, or trademarks
- Sanctioned jurisdictions: do **not** geo-target ads at OFAC-sanctioned
  countries; do not accept funds or grant access tied to sanctioned entities.
  If a country in the lineup is sensitive (e.g. North Korea, Cuba), consider
  removing it from the 50-list before launch.
- Always include "this is a memecoin, not an investment" language in any
  paid promotion copy.

---

## 9. Site → token sync checklist (per launch)

- [ ] Update `src/data/countries.ts` with the new `mint`.
- [ ] (Optional) Update `pumpFunUrl` if you want to override the generated link.
- [ ] Verify the country page renders the live stats via DexScreener.
- [ ] Tweet from `@worldcoin_hub` with a screenshot.
- [ ] Add the launch event to the changelog (TBD).

---

## 10. Open questions for you

These need a decision before mainnet launches:

1. Is the project anonymous, pseudonymous, or doxxed? (Affects how dev wallets are presented.)
2. What's the budget for paid marketing / KOLs per wave?
3. Do we want a treasury multisig? Who are the signers?
4. Localization — do we hire community managers per region, or is the site English-only at launch?
5. Are we okay including potentially sensitive countries (e.g. Iran, Russia, Afghanistan), or do we trim the list before Wave 1?
