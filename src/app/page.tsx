import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Globe } from "@/components/globe";
import { LeaderboardLive } from "@/components/leaderboard-live";
import { ButtonLink, LiveDot, Pill } from "@/components/ui";
import { COUNTRIES } from "@/data/countries";
import { buildLeaderboardSnapshot } from "@/lib/leaderboard";
import { formatCompactInt, formatUsd } from "@/lib/format";
import { WORLD } from "@/data/world";
import { cn } from "@/lib/utils";

export const revalidate = 10;

export default async function HomePage() {
  const snapshot = await buildLeaderboardSnapshot();

  const launched = snapshot.aggregates.launchedCount;
  const pending = snapshot.aggregates.pendingCount;

  // Ambient dots — every country gets a baseline marker (population-weighted)
  // so the globe doesn't look empty pre-launch.
  const points = COUNTRIES.map((c) => ({
    lat: c.lat,
    lng: c.lng,
    weight: 0.4 + Math.min(1, c.population / 1_500_000_000) * 0.6,
  }));

  // Interactive markers — only launched countries get a hit-button + popover.
  const launchedRows = snapshot.rows.filter((r) => r.mint);
  const markers = launchedRows.map((r) => ({
    iso: r.iso,
    name: r.name,
    ticker: r.ticker,
    flagEmoji: r.flagEmoji,
    colors: r.colors,
    lat: r.lat,
    lng: r.lng,
    weight: 0.5 + Math.min(1, r.population / 1_500_000_000) * 0.5,
    priceUsd: r.market?.priceUsd ?? null,
    marketCapUsd: r.market?.marketCapUsd ?? null,
    change24hPct: r.market?.change24hPct ?? null,
    holders: r.holders,
    pumpFunUrl: r.pumpFunUrl,
  }));

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-[var(--color-rule-2)]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-12 sm:px-6 md:grid-cols-[1.1fr_1fr] md:gap-16 md:pb-24 md:pt-20">
          <div className="flex flex-col justify-center">
            <Pill tone="muted" className="w-fit">
              <LiveDot /> Live on Solana · pump.fun
            </Pill>
            <h1 className="mt-6 font-display text-[10vw] font-semibold leading-[0.95] tracking-[-0.02em] sm:text-7xl md:text-[7.5rem]">
              The world,
              <br />
              <span className="italic">one coin.</span>
            </h1>
            <p className="ink-muted mt-6 max-w-xl text-lg leading-relaxed">
              <span className="font-display italic ink">$WORLD</span> is the hub of a
              new on-chain economy — 48 World Cup 2026 nation sub-coins on pump.fun, ranked
              live by market cap and holders. Nations compete. The leaderboard
              decides.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink href="/leaderboard" variant="primary">
                Open leaderboard
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </ButtonLink>
              <ButtonLink href="/world" variant="ghost">
                About $WORLD
              </ButtonLink>
              <ButtonLink
                href={WORLD.pumpFunUrl ?? "https://pump.fun"}
                variant="stamp"
                external
              >
                pump.fun ↗
              </ButtonLink>
            </div>

            <dl className="mt-12 grid grid-cols-3 gap-6 border-t border-[var(--color-rule-2)] pt-6">
              <HeroStat
                label="Countries launched"
                value={`${launched} / ${launched + pending}`}
              />
              <HeroStat
                label="Combined market cap"
                value={formatUsd(snapshot.aggregates.totalMarketCapUsd)}
              />
              <HeroStat
                label="World citizens"
                value={formatCompactInt(snapshot.aggregates.totalHolders)}
                sub="unique holders"
              />
            </dl>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="pointer-events-none absolute inset-0 -z-0">
              <CrossHair />
            </div>
            <Globe
              points={points}
              markers={markers}
              size={560}
              className="relative z-10"
            />
          </div>
        </div>
        <div className="hairline" />
      </section>

      {/* CONCEPT */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid gap-12 md:grid-cols-[1fr_2fr] md:gap-16">
          <div>
            <div className="ink-muted text-[10px] font-medium uppercase tracking-[0.22em]">
              How it works
            </div>
            <h2 className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
              A stadium for nations,
              <br className="hidden md:block" /> coined on pump.fun.
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <ConceptCard
              n="01"
              title="$WORLD is the hub"
              body="The mother coin. Treasury, identity, and the gravity that pulls the country economy together. Holding $WORLD is holding the league."
            />
            <ConceptCard
              n="05"
              title="Fees flow home"
              body="50% of creator fees from every country sub-coin fund $WORLD buybacks and burns. The other 50% powers marketing for that nation’s coin and the wider league."
              className="sm:col-span-2"
            />
            <ConceptCard
              n="02"
              title="48 World Cup nations"
              body="One coin per nation at FIFA World Cup 2026™. Each launches on pump.fun with its own ticker — $USA, $BRA, $GER, $JPN, $ENG, and so on."
            />
            <ConceptCard
              n="03"
              title="Leaderboard decides"
              body="Market cap, holders, 24h velocity. Countries climb and fall against each other in real time. The ranks are the game."
            />
            <ConceptCard
              n="04"
              title="Sovereign branding"
              body="Each country gets a flag-derived palette, its own page, and its own community. Same chain. Same engine. Different flag."
            />
          </div>
        </div>
      </section>

      <div className="hairline mx-auto max-w-7xl" />

      {/* TOP 10 PREVIEW */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <div className="ink-muted text-[10px] font-medium uppercase tracking-[0.22em]">
              Top 10 — live
            </div>
            <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight md:text-5xl">
              The leaderboard, right now.
            </h2>
          </div>
          <Link
            href="/leaderboard"
            className="hidden text-sm font-medium uppercase tracking-[0.14em] ink-muted hover:ink sm:inline-flex"
          >
            See all 48 →
          </Link>
        </div>
        <LeaderboardLive initial={snapshot} compact limit={10} />
        <div className="mt-6 sm:hidden">
          <Link
            href="/leaderboard"
            className="text-sm font-medium uppercase tracking-[0.14em] ink-muted hover:ink"
          >
            See all 48 →
          </Link>
        </div>
      </section>
    </>
  );
}

function HeroStat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="ink-muted text-[10px] font-medium uppercase tracking-[0.16em]">
        {label}
      </span>
      <span className="font-display text-2xl font-semibold tabular leading-none">
        {value}
      </span>
      {sub ? <span className="ink-muted text-xs">{sub}</span> : null}
    </div>
  );
}

function ConceptCard({
  n,
  title,
  body,
  className,
}: {
  n: string;
  title: string;
  body: string;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "group relative rounded-[10px] border border-[var(--color-rule-2)] bg-paper p-5 stamp-shadow",
        className,
      )}
    >
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] ink-muted">
          {n}
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] ink-muted">
          —
        </span>
      </div>
      <h3 className="mt-4 font-display text-2xl font-semibold leading-tight tracking-tight">
        {title}
      </h3>
      <p className="ink-muted mt-3 text-sm leading-relaxed">{body}</p>
    </article>
  );
}

/** Decorative crosshair / coordinate marks behind the globe. */
function CrossHair() {
  return (
    <svg
      className="h-full w-full text-[var(--color-rule)]"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="0.15" />
      <line x1="50" y1="0" x2="50" y2="100" stroke="currentColor" strokeWidth="0.15" />
      <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="0.15" fill="none" />
      <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="0.15" fill="none" />
    </svg>
  );
}
