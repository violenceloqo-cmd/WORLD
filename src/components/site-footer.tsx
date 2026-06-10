import Link from "next/link";
import { resolveMint } from "@/data/countries";
import { WORLD } from "@/data/world";

const worldMint = resolveMint(WORLD.mint);

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-[var(--color-rule-2)]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="space-y-3">
          <div className="font-display text-2xl font-semibold leading-none tracking-tight">
            World Coin
          </div>
          <p className="ink-muted max-w-sm text-sm leading-relaxed">
            One hub coin. Forty-eight World Cup nations. A live scoreboard of
            nations on pump.fun. Built for the stadium era of memecoins.
          </p>
        </div>

        <FooterCol
          title="Explore"
          links={[
            { href: "/", label: "Home" },
            { href: "/leaderboard", label: "Leaderboard" },
            { href: "/world", label: "$WORLD" },
            { href: "/manifesto", label: "Manifesto" },
          ]}
        />
        <FooterCol
          title="Build"
          links={[
            {
              href: worldMint
                ? `https://pump.fun/coin/${worldMint}`
                : "https://pump.fun",
              label: "pump.fun",
              external: true,
            },
            {
              href: worldMint
                ? `https://dexscreener.com/solana/${worldMint}`
                : "https://dexscreener.com",
              label: "DexScreener",
              external: true,
            },
            {
              href: worldMint
                ? `https://solscan.io/token/${worldMint}`
                : "https://solscan.io",
              label: "Solscan",
              external: true,
            },
          ]}
        />
        <div className="space-y-3">
          <div className="ink-muted text-[10px] font-medium uppercase tracking-[0.18em]">
            Disclaimer
          </div>
          <p className="ink-muted text-xs leading-relaxed">
            World is a community memecoin universe. Country tickers are
            symbolic — they do not represent or endorse any nation, state,
            or government. 50% of country sub-coin creator fees fund $WORLD
            buybacks and burns; 50% fund marketing. Do your own research before
            purchasing.
          </p>
        </div>
      </div>
      <div className="border-t border-[var(--color-rule-2)]">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-4 py-4 text-xs ink-muted sm:flex-row sm:items-center sm:px-6">
          <span>© {new Date().getFullYear()} World Coin Universe.</span>
          <span className="font-mono uppercase tracking-[0.18em]">
            Lat 0° / Lng 0° · Atlas Editorial
          </span>
        </div>
      </div>
    </footer>
  );
}

type Link = { href: string; label: string; external?: boolean };

function FooterCol({ title, links }: { title: string; links: Link[] }) {
  return (
    <div className="space-y-3">
      <div className="ink-muted text-[10px] font-medium uppercase tracking-[0.18em]">
        {title}
      </div>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            {l.external ? (
              <a
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="text-sm ink hover:underline"
              >
                {l.label}
              </a>
            ) : (
              <Link href={l.href} className="text-sm ink hover:underline">
                {l.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
