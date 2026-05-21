"use client";

import useSWR from "swr";
import { formatCompactInt, formatUsd } from "@/lib/format";
import type { LeaderboardSnapshot } from "@/lib/leaderboard";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Props = {
  initial: LeaderboardSnapshot;
};

/**
 * Live aggregate stats (combined cap / 24h vol / total holders) that
 * refresh every 10 seconds in sync with the leaderboard table.
 */
export function LeaderboardAggregates({ initial }: Props) {
  const { data } = useSWR<LeaderboardSnapshot>("/api/leaderboard", fetcher, {
    fallbackData: initial,
    refreshInterval: 10_000,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 5_000,
  });
  const agg = (data ?? initial).aggregates;

  return (
    <dl className="grid w-full grid-cols-3 gap-6 border-t border-[var(--color-rule-2)] pt-4 md:w-auto md:border-0 md:pt-0">
      <Agg label="Combined cap" value={formatUsd(agg.totalMarketCapUsd)} />
      <Agg label="24h volume" value={formatUsd(agg.totalVolume24hUsd)} />
      <Agg label="Citizens" value={formatCompactInt(agg.totalHolders)} />
    </dl>
  );
}

function Agg({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="ink-muted text-[10px] font-medium uppercase tracking-[0.16em]">
        {label}
      </span>
      <span className="font-display text-2xl font-semibold tabular leading-none">
        {value}
      </span>
    </div>
  );
}
