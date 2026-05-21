import Image from "next/image";
import Link from "next/link";
import { ButtonLink, LiveDot, Pill } from "@/components/ui";

const NAV = [
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/world", label: "$WORLD" },
  { href: "/manifesto", label: "Manifesto" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-rule-2)] bg-[var(--color-paper)]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link href="/" className="group inline-flex items-center gap-3">
          <span className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center sm:h-12 sm:w-12">
            <Image
              src="/earth-logo.svg"
              alt="$WORLD logo"
              width={48}
              height={48}
              priority
              className="h-full w-full object-contain"
            />
          </span>
          <div className="flex flex-col leading-none">
            <span className="font-display text-base font-semibold tracking-tight">World</span>
            <span className="ink-muted text-[10px] uppercase tracking-[0.22em]">
              The Country Economy
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium ink-muted transition-colors hover:bg-paper-2 hover:ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Pill tone="muted" className="hidden sm:inline-flex">
            <LiveDot />
            Solana · pump.fun
          </Pill>
          <ButtonLink href="/leaderboard" variant="primary" className="hidden sm:inline-flex">
            View leaderboard
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
