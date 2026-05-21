import { NextResponse } from "next/server";
import { buildLeaderboardSnapshot } from "@/lib/leaderboard";

// Always render fresh on the server; the response itself is cached for
// 10s on the edge so concurrent clients don't melt the upstream APIs.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const snapshot = await buildLeaderboardSnapshot();
  return NextResponse.json(snapshot, {
    headers: {
      "Cache-Control": "public, s-maxage=10, stale-while-revalidate=20",
    },
  });
}
