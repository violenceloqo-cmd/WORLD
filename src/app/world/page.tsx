import { ArrowUpRight, ExternalLink } from "lucide-react";
import { Globe } from "@/components/globe";
import { LeaderboardLive } from "@/components/leaderboard-live";
import { ButtonLink, LiveDot, Pill, Stat } from "@/components/ui";
import { COUNTRIES, resolveMint } from "@/data/countries";
import { COUNTRY_CREATOR_FEE_SPLIT, WORLD } from "@/data/world";
import { buildLeaderboardSnapshot } from "@/lib/leaderboard";
import {
  formatCompactInt,
  formatInt,
  formatPrice,
  formatUsd,
} from "@/lib/format";

export const revalidate = 60;
export const metadata = { title: "$WORLD" };

export default async function WorldPage() {
  const snapshot = await buildLeaderboardSnapshot();
  const totalPop = COUNTRIES.reduce((a, c) => a + c.population, 0);

  const market = snapshot.world.market;
  const worldMint = resolveMint(WORLD.mint);
  const worldPumpUrl =
    WORLD.pumpFunUrl.trim() ||
    (worldMint ? `https://pump.fun/coin/${worldMint}` : null);

  const points = COUNTRIES.map((c) => ({
    lat: c.lat,
    lng: c.lng,
    weight: 0.5 + Math.min(1, c.population / 1_500_000_000) * 0.5,
  }));

  return (
    <>
      {/* HERO */}
      <section
        className="relative overflow-hidden border-b border-[var(--color-rule-2)]"
        style={{ background: `linear-gradient(180deg, ${WORLD.colors[0]} 0%, ${WORLD.colors[0]}EE 60%, ${WORLD.colors[0]}CC 100%)`, color: "#F5F1E8" }}
      >
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-3"
          style={{ backgroundColor: WORLD.colors[1] }}
        />
        <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-20 pt-16 sm:px-6 md:grid-cols-[1.1fr_1fr] md:gap-16 md:pb-28 md:pt-24">
          <div className="flex flex-col justify-center">
            <Pill className="w-fit bg-white/10 text-white">
              <LiveDot /> The mother coin
            </Pill>
            <h1 className="mt-6 font-display text-[12vw] font-semibold leading-[0.92] tracking-[-0.02em] sm:text-7xl md:text-[9rem]">
              $WORLD
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">
              The hub. The flag of flags. $WORLD is the gravity that pulls 50
              country sub-coins into a single on-chain economy on pump.fun.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              {worldMint ? (
                <ButtonLink
                  href={worldPumpUrl!}
                  variant="primary"
                  external
                >
                  Buy $WORLD
                  <ExternalLink className="h-4 w-4" aria-hidden />
                </ButtonLink>
              ) : (
                <Pill tone="warn">Pre-launch · launching on pump.fun</Pill>
              )}
              <ButtonLink href="/leaderboard" variant="ghost">
                Leaderboard
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </ButtonLink>
            </div>

            <dl className="mt-12 grid grid-cols-2 gap-6 border-t border-white/20 pt-6 md:grid-cols-4">
              <Hero label="Price" value={worldMint && market ? formatPrice(market.priceUsd) : "—"} />
              <Hero label="Market cap" value={worldMint && market ? formatUsd(market.marketCapUsd) : "—"} />
              <Hero label="Citizens" value={worldMint && snapshot.world.holders ? formatCompactInt(snapshot.world.holders) : "—"} />
              <Hero label="24h volume" value={worldMint && market ? formatUsd(market.volume24hUsd) : "—"} />
            </dl>
          </div>

          <div className="relative flex items-center justify-center">
            <Globe points={points} size={520} className="relative z-10" />
          </div>
        </div>
      </section>

      {/* CREATOR FEE SPLIT */}
      <section className="border-b border-[var(--color-rule-2)] bg-paper-2/50">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="mb-10 max-w-2xl">
            <div className="ink-muted text-[10px] font-medium uppercase tracking-[0.22em]">
              Creator fees · all 50 country coins
            </div>
            <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight md:text-5xl">
              Every nation fuels $WORLD.
            </h2>
            <p className="ink-muted mt-3 text-base leading-relaxed">
              {COUNTRY_CREATOR_FEE_SPLIT.summary}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <FeeSplitCard
              pct={COUNTRY_CREATOR_FEE_SPLIT.worldBuybackBurnPct}
              title="$WORLD buybacks & burns"
              body="Half of all country sub-coin creator fees are used to buy back and burn $WORLD. More trading across the league means more deflationary pressure on the hub."
              accent={WORLD.colors[0]}
            />
            <FeeSplitCard
              pct={COUNTRY_CREATOR_FEE_SPLIT.marketingPct}
              title="Marketing"
              body="The other half funds growth — country launches, KOL campaigns, paid social, and keeping the leaderboard loud."
              accent={WORLD.colors[1]}
            />
          </div>
        </div>
      </section>

      {/* AGGREGATE WORLD ECONOMY */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mb-10">
          <div className="ink-muted text-[10px] font-medium uppercase tracking-[0.22em]">
            The country economy
          </div>
          <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight md:text-5xl">
            What $WORLD powers.
          </h2>
          <p className="ink-muted mt-3 max-w-2xl text-base leading-relaxed">
            Live, aggregated stats across every launched country coin. The
            World economy grows as more nations come online.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 rounded-[10px] border border-[var(--color-rule-2)] bg-paper-2/60 p-6 sm:grid-cols-3 md:grid-cols-6">
          <Stat label="Countries live" value={`${snapshot.aggregates.launchedCount} / ${COUNTRIES.length}`} />
          <Stat label="Combined cap" value={formatUsd(snapshot.aggregates.totalMarketCapUsd)} />
          <Stat label="Combined 24h vol" value={formatUsd(snapshot.aggregates.totalVolume24hUsd)} />
          <Stat label="Citizens" value={formatCompactInt(snapshot.aggregates.totalHolders)} />
          <Stat label="Real-world pop." value={formatInt(totalPop)} sub="across all 50 countries" />
          <Stat
            label="Reach"
            value={`${((totalPop / 8_100_000_000) * 100).toFixed(0)}%`}
            sub="of humanity covered"
          />
        </div>
      </section>

      {/* LIVE LEADERBOARD */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <div className="ink-muted text-[10px] font-medium uppercase tracking-[0.22em]">
              Powered by $WORLD
            </div>
            <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight md:text-5xl">
              Top 10 nations.
            </h2>
          </div>
        </div>
        <LeaderboardLive initial={snapshot} compact limit={10} />
      </section>
    </>
  );
}

function FeeSplitCard({
  pct,
  title,
  body,
  accent,
}: {
  pct: number;
  title: string;
  body: string;
  accent: string;
}) {
  return (
    <article className="rounded-[10px] border border-[var(--color-rule-2)] bg-paper p-6 stamp-shadow">
      <div className="flex items-baseline gap-3">
        <span
          className="font-display text-6xl font-semibold tabular leading-none"
          style={{ color: accent }}
        >
          {pct}%
        </span>
        <span className="font-display text-xl font-semibold tracking-tight">{title}</span>
      </div>
      <p className="ink-muted mt-4 text-sm leading-relaxed">{body}</p>
    </article>
  );
}

function Hero({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/60">
        {label}
      </span>
      <span className="font-display text-2xl font-semibold tabular leading-none text-white">
        {value}
      </span>
    </div>
  );
}
