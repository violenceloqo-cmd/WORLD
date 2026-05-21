import Link from "next/link";
import { ButtonLink } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-start justify-center px-4 py-32 sm:px-6">
      <div className="font-mono text-[11px] uppercase tracking-[0.22em] ink-muted">
        404 · Off the map
      </div>
      <h1 className="mt-4 font-display text-6xl font-semibold leading-[0.95] tracking-tight md:text-8xl">
        Uncharted territory.
      </h1>
      <p className="ink-muted mt-4 max-w-md text-base leading-relaxed">
        This coordinate isn&apos;t on the World map. Let&apos;s get you back to a known nation.
      </p>
      <div className="mt-8 flex gap-3">
        <ButtonLink href="/" variant="primary">Back to home</ButtonLink>
        <ButtonLink href="/leaderboard" variant="ghost">Open leaderboard</ButtonLink>
      </div>
      <Link
        href="/world"
        className="mt-12 font-mono text-xs uppercase tracking-[0.18em] ink-muted hover:ink"
      >
        Or visit $WORLD →
      </Link>
    </div>
  );
}
