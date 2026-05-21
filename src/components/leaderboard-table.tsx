"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, ChevronDown, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ChangePct, FlagBar, Pill, RankBadge } from "@/components/ui";
import { Sparkline } from "@/components/sparkline";
import type { LeaderboardRow } from "@/lib/leaderboard";
import {
  formatCompactInt,
  formatPrice,
  formatUsd,
} from "@/lib/format";
import { REGIONS } from "@/data/countries";
import { cn } from "@/lib/utils";

type SortKey = "marketCap" | "holders" | "change24h" | "volume24h";

type Props = {
  rows: LeaderboardRow[];
  /** Hide the controls bar — used on the home top-10 preview. */
  compact?: boolean;
  /** Limit rows displayed (after sort/filter). */
  limit?: number;
  className?: string;
};

export function LeaderboardTable({ rows, compact, limit, className }: Props) {
  const [sort, setSort] = useState<SortKey>("marketCap");
  const [dir, setDir] = useState<"desc" | "asc">("desc");
  const [region, setRegion] = useState<string | "all">("all");
  const [query, setQuery] = useState("");

  const sorted = useMemo(() => {
    const filtered = rows.filter((r) => {
      if (region !== "all" && r.region !== region) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        r.name.toLowerCase().includes(q) ||
        r.ticker.toLowerCase().includes(q) ||
        r.iso.toLowerCase().includes(q)
      );
    });
    const launched = filtered.filter((r) => r.mint && r.market);
    const pending = filtered.filter((r) => !r.mint || !r.market);
    const launchedSorted = [...launched].sort((a, b) => {
      const av = pick(a, sort) ?? -Infinity;
      const bv = pick(b, sort) ?? -Infinity;
      return dir === "desc" ? bv - av : av - bv;
    });
    return [...launchedSorted, ...pending];
  }, [rows, sort, dir, region, query]);

  const display = typeof limit === "number" ? sorted.slice(0, limit) : sorted;

  return (
    <section className={cn("space-y-4", className)}>
      {!compact ? (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="ink-muted text-[10px] uppercase tracking-[0.18em]">
              Region
            </span>
            <Chip active={region === "all"} onClick={() => setRegion("all")}>
              All
            </Chip>
            {REGIONS.map((r) => (
              <Chip key={r} active={region === r} onClick={() => setRegion(r)}>
                {r}
              </Chip>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <label className="relative inline-flex items-center">
              <Search
                className="pointer-events-none absolute left-3 h-3.5 w-3.5"
                aria-hidden
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search country or ticker"
                className="h-10 w-56 rounded-md border border-[var(--color-rule)] bg-paper pl-8 pr-3 text-sm placeholder:ink-muted focus:outline-none"
                aria-label="Search countries"
              />
            </label>
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[10px] border border-[var(--color-rule-2)] bg-paper stamp-shadow">
        <div className="grid grid-cols-[64px_minmax(0,1.6fr)_repeat(3,minmax(0,1fr))_120px_56px] gap-3 border-b border-[var(--color-rule-2)] bg-paper-2 px-4 py-3 text-[10px] font-medium uppercase tracking-[0.16em] ink-muted">
          <span>Rank</span>
          <span>Country</span>
          <HeaderButton
            label="Market cap"
            active={sort === "marketCap"}
            dir={dir}
            onClick={() => toggle("marketCap", sort, dir, setSort, setDir)}
            className="justify-end text-right"
          />
          <HeaderButton
            label="Price"
            active={false}
            dir={dir}
            onClick={() => {}}
            className="justify-end text-right pointer-events-none"
          />
          <HeaderButton
            label="Holders"
            active={sort === "holders"}
            dir={dir}
            onClick={() => toggle("holders", sort, dir, setSort, setDir)}
            className="justify-end text-right"
          />
          <HeaderButton
            label="24h"
            active={sort === "change24h"}
            dir={dir}
            onClick={() => toggle("change24h", sort, dir, setSort, setDir)}
            className="justify-end text-right"
          />
          <span />
        </div>

        <ul>
          <AnimatePresence initial={false}>
            {display.map((row, idx) => (
              <Row key={row.iso} row={row} rank={idx + 1} />
            ))}
          </AnimatePresence>
        </ul>

        {display.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm ink-muted">
            No countries match this filter.
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Row({ row, rank }: { row: LeaderboardRow; rank: number }) {
  const launched = !!row.mint && !!row.market;
  const change = row.market?.change24hPct ?? null;
  const positive = change === null ? null : change >= 0;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ type: "spring", stiffness: 380, damping: 38 }}
      className={cn(
        "grid grid-cols-[64px_minmax(0,1.6fr)_repeat(3,minmax(0,1fr))_120px_56px] items-center gap-3 border-b border-[var(--color-rule-2)] px-4 py-3 transition-colors last:border-b-0 hover:bg-paper-2",
        !launched && "opacity-70",
      )}
    >
      <div className="flex items-center">
        <RankBadge rank={rank} colors={row.colors} size="sm" />
      </div>

      <Link href={`/c/${row.iso}`} className="flex min-w-0 items-center gap-3">
        <FlagBar colors={row.colors} label={`${row.name} colors`} />
        <span className="text-xl leading-none" aria-hidden>
          {row.flagEmoji}
        </span>
        <div className="min-w-0 leading-tight">
          <div className="truncate font-display text-base font-semibold tracking-tight">
            {row.name}
          </div>
          <div className="ink-muted font-mono text-[11px] uppercase tracking-[0.14em]">
            ${row.ticker} · {row.region}
          </div>
        </div>
      </Link>

      <div className="text-right font-mono tabular text-sm">
        {launched ? (
          formatUsd(row.market?.marketCapUsd ?? null)
        ) : (
          <Pill tone="muted" className="ml-auto">Pre-launch</Pill>
        )}
      </div>

      <div className="text-right font-mono tabular text-sm ink-muted">
        {launched ? formatPrice(row.market?.priceUsd ?? null) : "—"}
      </div>

      <div className="text-right font-mono tabular text-sm ink-muted">
        {launched ? formatCompactInt(row.holders) : "—"}
      </div>

      <div className="flex items-center justify-end gap-1.5">
        {launched ? (
          <>
            {positive === true ? (
              <ArrowUpRight className="h-3.5 w-3.5 text-gain" aria-hidden />
            ) : positive === false ? (
              <ArrowDownRight className="h-3.5 w-3.5 text-loss" aria-hidden />
            ) : null}
            <ChangePct value={change} />
            <Sparkline
              values={fakeSparkline(row.iso, change ?? 0)}
              positive={positive}
              className="hidden md:block"
            />
          </>
        ) : (
          <span className="ink-muted text-sm">—</span>
        )}
      </div>

      <Link
        href={`/c/${row.iso}`}
        className="ink-muted inline-flex h-10 items-center justify-end text-xs font-medium uppercase tracking-[0.12em] hover:ink"
        aria-label={`View ${row.name}`}
      >
        View →
      </Link>
    </motion.li>
  );
}

function HeaderButton({
  label,
  active,
  dir,
  onClick,
  className,
}: {
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.16em] ink-muted hover:ink",
        className,
      )}
    >
      {label}
      <ChevronDown
        className={cn(
          "h-3 w-3 transition-transform",
          active ? "opacity-100" : "opacity-0 group-hover:opacity-50",
          active && dir === "asc" && "rotate-180",
        )}
        aria-hidden
      />
    </button>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-8 rounded-full px-3 text-xs font-medium uppercase tracking-[0.12em] transition-colors",
        active
          ? "bg-ink text-[var(--color-paper)]"
          : "ink-muted ring-rule hover:bg-paper-2 hover:ink",
      )}
    >
      {children}
    </button>
  );
}

function pick(r: LeaderboardRow, k: SortKey): number | null {
  if (k === "marketCap") return r.market?.marketCapUsd ?? null;
  if (k === "holders") return r.holders ?? null;
  if (k === "change24h") return r.market?.change24hPct ?? null;
  if (k === "volume24h") return r.market?.volume24hUsd ?? null;
  return null;
}

function toggle(
  next: SortKey,
  cur: SortKey,
  curDir: "asc" | "desc",
  setSort: (s: SortKey) => void,
  setDir: (d: "asc" | "desc") => void,
) {
  if (next === cur) {
    setDir(curDir === "desc" ? "asc" : "desc");
  } else {
    setSort(next);
    setDir("desc");
  }
}

/**
 * Deterministic placeholder sparkline keyed by iso. Real 24h price points
 * can replace this once we wire DexScreener candles. We use the 24h change
 * as a slope hint so direction matches the badge.
 */
function fakeSparkline(seed: string, slope: number): number[] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const rand = () => {
    h = (h * 1103515245 + 12345) >>> 0;
    return (h % 1000) / 1000;
  };
  const n = 24;
  const out: number[] = [];
  let v = 50;
  for (let i = 0; i < n; i++) {
    const drift = (slope / n) * 1.2;
    v += drift + (rand() - 0.5) * 2.5;
    out.push(v);
  }
  return out;
}
