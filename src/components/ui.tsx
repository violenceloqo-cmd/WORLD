import Link from "next/link";
import { cn } from "@/lib/utils";

type RankBadgeProps = {
  rank: number;
  colors: [string, string];
  className?: string;
  size?: "sm" | "md" | "lg";
};

/**
 * Editorial rank badge: serif numeral over a flag-derived color block,
 * accented with a thin band of the country's second color.
 */
export function RankBadge({ rank, colors, className, size = "md" }: RankBadgeProps) {
  const [primary, secondary] = colors;
  const padded = rank.toString().padStart(2, "0");

  const sizes = {
    sm: "h-8 w-10 text-base",
    md: "h-10 w-14 text-xl",
    lg: "h-14 w-20 text-3xl",
  } as const;

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden rounded-[6px] ring-rule",
        sizes[size],
        className,
      )}
      style={{ backgroundColor: primary }}
      aria-label={`Rank ${rank}`}
    >
      <span
        aria-hidden
        className="absolute inset-y-0 right-0 w-1.5"
        style={{ backgroundColor: secondary }}
      />
      <span
        className="font-display font-semibold tracking-tight tabular"
        style={{ color: pickReadable(primary) }}
      >
        {padded}
      </span>
    </div>
  );
}

type FlagBarProps = {
  colors: [string, string];
  label?: string;
  className?: string;
};

/** Two-tone vertical bar used as a country marker on rows. */
export function FlagBar({ colors, label, className }: FlagBarProps) {
  const [a, b] = colors;
  return (
    <span
      aria-label={label ?? "country accent"}
      className={cn("inline-flex h-6 w-2 overflow-hidden rounded-[2px] ring-rule", className)}
    >
      <span className="block h-full w-1/2" style={{ backgroundColor: a }} />
      <span className="block h-full w-1/2" style={{ backgroundColor: b }} />
    </span>
  );
}

type StatProps = {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  align?: "left" | "right";
  className?: string;
};

/** Editorial stat block: tiny caps label over a large mono value. */
export function Stat({ label, value, sub, align = "left", className }: StatProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1",
        align === "right" && "items-end text-right",
        className,
      )}
    >
      <span className="ink-muted text-[10px] font-medium uppercase tracking-[0.14em]">
        {label}
      </span>
      <span className="font-mono tabular text-xl font-medium ink leading-none">
        {value}
      </span>
      {sub ? <span className="ink-muted text-xs">{sub}</span> : null}
    </div>
  );
}

type PillProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "default" | "live" | "warn" | "muted";
};

export function Pill({ tone = "default", className, children, ...rest }: PillProps) {
  const tones: Record<NonNullable<PillProps["tone"]>, string> = {
    default: "bg-paper-2 ink",
    live:    "bg-ink text-[var(--color-paper)]",
    warn:    "bg-[var(--color-flame)] text-white",
    muted:   "bg-transparent ink-muted ring-rule",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em]",
        tones[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}

type LiveDotProps = { className?: string };

export function LiveDot({ className }: LiveDotProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "live-dot inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-flame)]",
        className,
      )}
    />
  );
}

type ChangeProps = { value: number | null; className?: string };

export function ChangePct({ value, className }: ChangeProps) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return <span className={cn("ink-muted tabular font-mono text-sm", className)}>—</span>;
  }
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  const abs = Math.abs(value);
  return (
    <span
      className={cn(
        "tabular font-mono text-sm font-medium",
        value > 0 ? "text-gain" : value < 0 ? "text-loss" : "ink-muted",
        className,
      )}
    >
      {sign}
      {abs.toFixed(2)}%
    </span>
  );
}

type ButtonLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "ghost" | "stamp";
  external?: boolean;
};

export function ButtonLink({
  href,
  children,
  className,
  variant = "primary",
  external,
}: ButtonLinkProps) {
  const base =
    "inline-flex min-h-11 items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium uppercase tracking-[0.12em] transition-colors";
  const variants = {
    primary:
      "bg-ink text-[var(--color-paper)] hover:bg-[var(--color-ink-2)] rounded-[6px]",
    ghost:
      "ink ring-rule hover:bg-paper-2 rounded-[6px]",
    stamp:
      "ink ring-rule rounded-[6px] bg-paper hover:bg-paper-2",
  } as const;

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={cn(base, variants[variant], className)}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cn(base, variants[variant], className)}>
      {children}
    </Link>
  );
}

/**
 * Best-effort foreground color picker for a given background hex.
 * Returns ink (dark) or paper (light) based on luminance.
 */
function pickReadable(hex: string): string {
  const c = hex.replace("#", "");
  if (c.length !== 6) return "#0B1733";
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.62 ? "#0B1733" : "#F5F1E8";
}

export { pickReadable };
