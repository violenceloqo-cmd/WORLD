"use client";

import useSWR from "swr";
import { ChangePct, Stat } from "@/components/ui";
import {
  formatCompactInt,
  formatPrice,
  formatUsd,
} from "@/lib/format";
import type { LeaderboardSnapshot } from "@/lib/leaderboard";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Props = {
  iso: string;
  initial: LeaderboardSnapshot;
};

/**
 * Live stats grid for an individual country page. Re-uses the global
 * `/api/leaderboard` snapshot (so 48 country pages share one cached
 * response) and re-renders every 10 seconds.
 */
export function CountryLiveStats({ iso, initial }: Props) {
  const { data } = useSWR<LeaderboardSnapshot>("/api/leaderboard", fetcher, {
    fallbackData: initial,
    refreshInterval: 10_000,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 5_000,
  });

  const snapshot = data ?? initial;
  const row = snapshot.rows.find((r) => r.iso === iso);
  const market = row?.market ?? null;
  const isLaunched = !!row?.mint && !!market;
  const change = market?.change24hPct ?? null;

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-6">
      <Stat
        label="Price"
        value={isLaunched ? formatPrice(market?.priceUsd ?? null) : "—"}
      />
      <Stat
        label="Market cap"
        value={isLaunched ? formatUsd(market?.marketCapUsd ?? null) : "—"}
      />
      <Stat
        label="24h volume"
        value={isLaunched ? formatUsd(market?.volume24hUsd ?? null) : "—"}
      />
      <Stat
        label="24h change"
        value={<ChangePct value={change} className="text-xl" />}
      />
      <Stat
        label="Holders"
        value={isLaunched ? formatCompactInt(row?.holders ?? null) : "—"}
      />
      <Stat
        label="Liquidity"
        value={isLaunched ? formatUsd(market?.liquidityUsd ?? null) : "—"}
      />
    </div>
  );
}
