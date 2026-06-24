import Image from "next/image";
import Link from "next/link";
import { ButtonLink, LiveDot, Pill } from "@/components/ui";
import { WORLD } from "@/data/world";

const NAV = [
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/world", label: "$world" },
  { href: "/manifesto", label: "Manifesto" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-rule-2)] bg-[var(--color-paper)]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link href="/" className="group inline-flex items-center gap-3">
          <span className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center sm:h-12 sm:w-12">
            <span
              aria-hidden
              className="absolute inset-0 rounded-full blur-md"
              style={{ background: "radial-gradient(circle, rgba(56,214,230,0.45) 0%, transparent 70%)" }}
            />
            <Image
              src="/world-globe.png"
              alt="$world logo"
              width={48}
              height={48}
              priority
              unoptimized
              className="relative h-full w-full object-contain"
            />
          </span>
          <span className="font-display text-base font-semibold tracking-tight">
            World Coin
          </span>
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
          <a
            href={WORLD.xUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Follow World on X"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md ring-rule ink transition-colors hover:bg-paper-2"
          >
            <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4 fill-current">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
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
