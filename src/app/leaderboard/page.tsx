import { LeaderboardAggregates } from "@/components/leaderboard-aggregates";
import { LeaderboardLive } from "@/components/leaderboard-live";
import { LiveDot, Pill } from "@/components/ui";
import { buildLeaderboardSnapshot } from "@/lib/leaderboard";

export const revalidate = 10;
export const metadata = { title: "Leaderboard" };

export default async function LeaderboardPage() {
  const snapshot = await buildLeaderboardSnapshot();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <header className="mb-10 flex flex-col gap-4">
        <Pill tone="muted" className="w-fit">
          <LiveDot />
          Updated every 10 seconds
        </Pill>
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h1 className="font-display text-5xl font-semibold leading-[0.95] tracking-tight md:text-7xl">
              Leaderboard
            </h1>
            <p className="ink-muted mt-3 max-w-xl text-base leading-relaxed">
              All 48 World Cup nation sub-coins, ranked live. Pre-launch nations sit at
              the bottom until their coin goes live on pump.fun.
            </p>
          </div>
          <LeaderboardAggregates initial={snapshot} />
        </div>
      </header>

      <LeaderboardLive initial={snapshot} />
    </div>
  );
}
