"use client";

import useSWR from "swr";
import { LeaderboardTable } from "@/components/leaderboard-table";
import type { LeaderboardSnapshot } from "@/lib/leaderboard";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Props = {
  initial: LeaderboardSnapshot;
  compact?: boolean;
  limit?: number;
};

/**
 * Server-renders initial snapshot, then polls the leaderboard API every
 * 10 seconds on the client. The API itself is edge-cached for 10s so
 * concurrent visitors share one upstream fetch.
 */
export function LeaderboardLive({ initial, compact, limit }: Props) {
  const { data } = useSWR<LeaderboardSnapshot>("/api/leaderboard", fetcher, {
    fallbackData: initial,
    refreshInterval: 10_000,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 5_000,
  });

  const rows = data?.rows ?? initial.rows;
  return <LeaderboardTable rows={rows} compact={compact} limit={limit} />;
}
