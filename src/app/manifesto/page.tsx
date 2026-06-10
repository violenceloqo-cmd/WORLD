import { ButtonLink, Pill } from "@/components/ui";

export const metadata = { title: "Manifesto" };

export default function ManifestoPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <Pill tone="muted" className="w-fit">Manifesto · v1</Pill>
      <h1 className="mt-6 font-display text-5xl font-semibold leading-[0.95] tracking-tight md:text-7xl">
        Memecoins are <span className="italic">flags</span>. The world deserves a league.
      </h1>

      <div className="hairline my-12" />

      <Section n="01" title="Memecoins are tribal.">
        <p>
          Every memecoin already represents a tribe — a meme, a city, an animal,
          an inside joke. Tribes can be bigger than any of those. The most
          durable tribe humans have ever invented is the nation.
        </p>
      </Section>

      <Section n="02" title="World is the league.">
        <p>
          $WORLD is the hub, the gravity, the league office. Holding $WORLD is
          holding the entire economy of country coins — not picking one
          favorite, but owning the contest itself.
        </p>
      </Section>

      <Section n="03" title="Forty-eight nations, one chain.">
        <p>
          Every nation at FIFA World Cup 2026™ gets a sub-coin on pump.fun
          with its own ticker, palette, and community. The ticker is a flag.
          The chart is a scoreboard. The leaderboard is a stadium.
        </p>
      </Section>

      <Section n="04" title="The leaderboard is the game.">
        <p>
          Rank by market cap. Rank by holders. Rank by 24h velocity. The
          rivalries are obvious. The competition is on-chain, public, and
          live. Nations climb. Nations fall. Citizens defend.
        </p>
      </Section>

      <Section n="05" title="Symbolic, not political.">
        <p>
          Country tickers are <em>symbolic</em>. World is a community memecoin
          universe — it does not represent, endorse, or speak for any actual
          government, state, military, or person. Choose your flag. Have fun.
          DYOR.
        </p>
      </Section>

      <Section n="06" title="Creator fees flow home.">
        <p>
          Every country sub-coin on pump.fun earns <strong>creator fees</strong> on
          trades. That revenue is split in two — always, across all 48 nations:
        </p>
        <ul className="mt-4 space-y-3 border-l-2 border-[var(--color-accent)] pl-4">
          <li>
            <strong>50%</strong> → $WORLD <strong>buybacks &amp; burns</strong>.
            Country volume directly strengthens the hub coin.
          </li>
          <li>
            <strong>50%</strong> → <strong>marketing</strong> for country launches,
            KOLs, ads, and league growth.
          </li>
        </ul>
        <p className="mt-4 ink-muted text-sm">
          The more any nation trades, the more fuel $WORLD receives. That is the
          flywheel.
        </p>
      </Section>

      <Section n="07" title="The rules.">
        <ul className="list-decimal space-y-2 pl-5">
          <li>$WORLD launches first. Always the hub.</li>
          <li>Country coins roll out in waves on pump.fun.</li>
          <li>One coin per country. No duplicates. No fakes.</li>
          <li>Branding follows the flag. Palette comes from the cloth.</li>
          <li>Leaderboard is the source of truth.</li>
          <li>Creator fees: 50% $WORLD buyback/burn · 50% marketing.</li>
        </ul>
      </Section>

      <div className="mt-16 flex flex-wrap items-center gap-3">
        <ButtonLink href="/leaderboard" variant="primary">
          See who&apos;s winning
        </ButtonLink>
        <ButtonLink href="/world" variant="ghost">
          About $WORLD
        </ButtonLink>
      </div>
    </article>
  );
}

function Section({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-12 grid gap-3 md:grid-cols-[80px_1fr] md:gap-8">
      <div className="font-mono text-[11px] uppercase tracking-[0.22em] ink-muted md:pt-2">
        {n}
      </div>
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
          {title}
        </h2>
        <div className="ink prose-base mt-3 max-w-prose space-y-3 text-base leading-relaxed">
          {children}
        </div>
      </div>
    </section>
  );
}
