import { ArrowUpRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CountryLiveStats } from "@/components/country-live-stats";
import { PriceChart } from "@/components/price-chart";
import {
  ButtonLink,
  ChangePct,
  FlagBar,
  LiveDot,
  Pill,
  RankBadge,
} from "@/components/ui";
import { COUNTRIES, getCountryByIso } from "@/data/countries";
import { buildLeaderboardSnapshot } from "@/lib/leaderboard";
import {
  formatInt,
  formatUsd,
} from "@/lib/format";
import { pickReadable } from "@/components/ui";

export const revalidate = 10;

export function generateStaticParams() {
  return COUNTRIES.map((c) => ({ iso: c.iso }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ iso: string }>;
}) {
  const { iso } = await params;
  const c = getCountryByIso(iso);
  if (!c) return { title: "Country not found" };
  return {
    title: `${c.name} · $${c.ticker}`,
    description: `Live market data for ${c.name}'s country coin on pump.fun.`,
  };
}

export default async function CountryPage({
  params,
}: {
  params: Promise<{ iso: string }>;
}) {
  const { iso } = await params;
  const country = getCountryByIso(iso);
  if (!country) notFound();

  const snapshot = await buildLeaderboardSnapshot();

  // Sort launched countries by market cap to compute live rank.
  const launchedSorted = snapshot.rows
    .filter((r) => r.mint && r.market)
    .sort(
      (a, b) =>
        (b.market?.marketCapUsd ?? 0) - (a.market?.marketCapUsd ?? 0),
    );
  const rank = launchedSorted.findIndex((r) => r.iso === country.iso) + 1 || null;
  const regionRows = launchedSorted.filter((r) => r.region === country.region);
  const regionRank = regionRows.findIndex((r) => r.iso === country.iso) + 1 || null;

  const row = snapshot.rows.find((r) => r.iso === country.iso)!;
  const market = row.market;
  const isLaunched = !!row.mint && !!market;
  const change = market?.change24hPct ?? null;
  const positive = change === null ? null : change >= 0;

  const idx = launchedSorted.findIndex((r) => r.iso === country.iso);
  const rivalsAbove =
    idx > 0 ? launchedSorted.slice(Math.max(0, idx - 3), idx).reverse() : [];
  const rivalsBelow = idx >= 0 ? launchedSorted.slice(idx + 1, idx + 4) : [];

  const [primary, secondary] = country.colors;
  const heroText = pickReadable(primary);

  return (
    <article>
      {/* HERO — full bleed flag color */}
      <section
        className="relative border-b border-[var(--color-rule-2)]"
        style={{ backgroundColor: primary, color: heroText }}
      >
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-3"
          style={{ backgroundColor: secondary }}
        />
        <div className="mx-auto grid max-w-7xl gap-8 px-4 pb-16 pt-10 sm:px-6 md:grid-cols-[1.4fr_1fr] md:pb-24 md:pt-16">
          <div>
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.16em] opacity-80">
              <Link
                href="/leaderboard"
                className="underline-offset-4 hover:underline"
              >
                ← Leaderboard
              </Link>
              <span aria-hidden>·</span>
              <span>{country.region}</span>
              {rank ? (
                <>
                  <span aria-hidden>·</span>
                  <span className="font-mono">
                    Global #{rank} / Region #{regionRank}
                  </span>
                </>
              ) : null}
            </div>

            <h1 className="mt-6 font-display text-[12vw] font-semibold leading-[0.9] tracking-[-0.02em] sm:text-7xl md:text-[8rem]">
              {country.name}
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span
                className="rounded-md px-3 py-1 font-mono text-sm uppercase tracking-[0.18em]"
                style={{ backgroundColor: secondary, color: pickReadable(secondary) }}
              >
                ${country.ticker}
              </span>
              <span className="text-3xl" aria-hidden>
                {country.flagEmoji}
              </span>
              <span className="font-mono text-xs uppercase tracking-[0.18em] opacity-80">
                ISO {country.iso3} · pop. {formatInt(country.population)}
              </span>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              {isLaunched ? (
                <ButtonLink
                  href={
                    row.pumpFunUrl ?? `https://pump.fun/coin/${row.mint}`
                  }
                  variant="primary"
                  external
                >
                  Buy on pump.fun
                  <ExternalLink className="h-4 w-4" aria-hidden />
                </ButtonLink>
              ) : (
                <Pill tone="warn">Pre-launch · coming to pump.fun</Pill>
              )}
              <ButtonLink href="/leaderboard" variant="ghost">
                Compare leaderboard
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </ButtonLink>
            </div>
          </div>

          <aside className="flex flex-col justify-end gap-4 md:items-end">
            {rank ? (
              <RankBadge rank={rank} colors={country.colors} size="lg" />
            ) : null}
            <Pill tone="muted" className="border border-current/10 bg-black/10 backdrop-blur">
              <LiveDot />
              {isLaunched ? "Live · pump.fun" : "Awaiting launch"}
            </Pill>
          </aside>
        </div>
      </section>

      {/* STATS GRID — refreshes every 10s on the client */}
      <section className="border-b border-[var(--color-rule-2)] bg-paper-2/60">
        <CountryLiveStats iso={country.iso} initial={snapshot} />
      </section>

      {/* CHART */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="ink-muted text-[10px] font-medium uppercase tracking-[0.22em]">
              Market cap · 7 days
            </div>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">
              How {country.name} is ranking.
            </h2>
          </div>
          <FlagBar colors={country.colors} className="h-10 w-3" />
        </div>
        {isLaunched ? (
          <PriceChart
            metric="marketCap"
            data={syntheticSeries(
              country.iso,
              market?.marketCapUsd ?? 10_000,
              change ?? 0,
            )}
            positive={positive}
          />
        ) : (
          <div className="grid h-64 place-items-center rounded-[10px] border border-dashed border-[var(--color-rule)] text-sm ink-muted">
            ${country.ticker} is not yet launched — chart will appear when the
            coin goes live on pump.fun.
          </div>
        )}
      </section>

      {/* RIVALS */}
      {rivalsAbove.length + rivalsBelow.length > 0 ? (
        <section className="border-t border-[var(--color-rule-2)] bg-paper-2/40">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <div className="ink-muted text-[10px] font-medium uppercase tracking-[0.22em]">
                  Rivals
                </div>
                <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">
                  Just above. Just below.
                </h2>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-3">
                <div className="ink-muted text-[10px] font-medium uppercase tracking-[0.18em]">
                  Catching
                </div>
                {rivalsAbove.length === 0 ? (
                  <p className="ink-muted text-sm">
                    {country.name} is leading the world right now.
                  </p>
                ) : (
                  rivalsAbove.map((r, i) => (
                    <RivalRow key={r.iso} row={r} rank={idx - (i + 1) + 1} />
                  ))
                )}
              </div>
              <div className="space-y-3">
                <div className="ink-muted text-[10px] font-medium uppercase tracking-[0.18em]">
                  Defending
                </div>
                {rivalsBelow.length === 0 ? (
                  <p className="ink-muted text-sm">No one ranked below yet.</p>
                ) : (
                  rivalsBelow.map((r, i) => (
                    <RivalRow key={r.iso} row={r} rank={idx + (i + 2)} />
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </article>
  );
}

function RivalRow({
  row,
  rank,
}: {
  row: import("@/lib/leaderboard").LeaderboardRow;
  rank: number;
}) {
  return (
    <Link
      href={`/c/${row.iso}`}
      className="flex items-center justify-between gap-3 rounded-[10px] border border-[var(--color-rule-2)] bg-paper p-4 transition-colors hover:bg-paper-2"
    >
      <div className="flex items-center gap-3">
        <RankBadge rank={rank} colors={row.colors} size="sm" />
        <FlagBar colors={row.colors} />
        <span className="text-xl" aria-hidden>
          {row.flagEmoji}
        </span>
        <div className="leading-tight">
          <div className="font-display text-base font-semibold tracking-tight">
            {row.name}
          </div>
          <div className="ink-muted font-mono text-[11px] uppercase tracking-[0.14em]">
            ${row.ticker}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-mono tabular text-sm">
          {formatUsd(row.market?.marketCapUsd ?? null)}
        </div>
        <ChangePct value={row.market?.change24hPct ?? null} className="text-xs" />
      </div>
    </Link>
  );
}

/** Synthetic 7-day market cap series used until a real historical feed is wired. */
function syntheticSeries(seed: string, last: number, change: number) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const rand = () => {
    h = (h * 1103515245 + 12345) >>> 0;
    return (h % 1000) / 1000;
  };
  const points: { t: number; v: number }[] = [];
  const days = 7;
  const stepMs = (days * 24 * 60 * 60 * 1000) / 168;
  const startT = Date.now() - days * 24 * 60 * 60 * 1000;
  const startValue = last / (1 + change / 100 || 1);
  let v = startValue;
  for (let i = 0; i < 168; i++) {
    const drift = ((last - startValue) / 168) * 1.1;
    v += drift + (rand() - 0.5) * startValue * 0.025;
    points.push({ t: startT + i * stepMs, v: Math.max(0, v) });
  }
  return points;
}
