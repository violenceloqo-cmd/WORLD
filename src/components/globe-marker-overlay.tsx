"use client";

import { ArrowUpRight, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type RefObject } from "react";
import { ButtonLink, ChangePct } from "@/components/ui";
import {
  formatCompactInt,
  formatPrice,
  formatUsd,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type { GlobeRotationRef } from "@/components/globe";

export type GlobeMarker = {
  iso: string;
  name: string;
  ticker: string;
  flagEmoji: string;
  colors: [string, string];
  lat: number;
  lng: number;
  /** 0..1 — drives marker size. */
  weight?: number;
  priceUsd: number | null;
  marketCapUsd: number | null;
  change24hPct: number | null;
  holders: number | null;
  pumpFunUrl: string | null;
};

type Props = {
  markers: GlobeMarker[];
  rotationRef: RefObject<GlobeRotationRef>;
};

type MarkerScreenState = {
  x: number;          // % from left
  y: number;          // % from top
  depth: number;      // 0..1 (1 = closest to viewer)
  visible: boolean;
};

/**
 * Renders invisible, absolutely-positioned hit-buttons that follow the
 * underlying cobe globe's rotation. Hover shows a flag/ticker/market-cap
 * tooltip; click opens a small popover card with links to the coin page
 * and pump.fun.
 *
 * The overlay reads `phi`/`theta` from `rotationRef` (written by cobe's
 * onRender on every frame) and projects each marker's lat/lng with the
 * standard orthographic globe projection.
 */
export function GlobeMarkerOverlay({ markers, rotationRef }: Props) {
  // Per-marker DOM refs keyed by iso, so we can mutate transform/opacity
  // every frame without re-rendering React.
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [hoveredIso, setHoveredIso] = useState<string | null>(null);
  const [openIso, setOpenIso] = useState<string | null>(null);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const rot = rotationRef.current;
      if (!rot) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const { phi, theta } = rot;
      const sinT = Math.sin(theta);
      const cosT = Math.cos(theta);

      for (const m of markers) {
        const el = buttonRefs.current[m.iso];
        if (!el) continue;
        const state = projectMarker(m.lat, m.lng, phi, theta, sinT, cosT);
        applyMarkerStyles(el, state);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [markers, rotationRef]);

  // Close popover on Escape.
  useEffect(() => {
    if (!openIso) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenIso(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIso]);

  const openMarker = openIso ? markers.find((m) => m.iso === openIso) ?? null : null;
  const hoveredMarker = hoveredIso ? markers.find((m) => m.iso === hoveredIso) ?? null : null;

  return (
    <div
      className="pointer-events-none absolute inset-0"
      aria-hidden={false}
    >
      {markers.map((m) => {
        const label = `${m.ticker} — ${m.name}${
          m.marketCapUsd ? `, ${formatUsd(m.marketCapUsd)} market cap` : ""
        }`;
        return (
          <button
            key={m.iso}
            ref={(el) => {
              buttonRefs.current[m.iso] = el;
            }}
            type="button"
            aria-label={label}
            onPointerEnter={() => setHoveredIso(m.iso)}
            onPointerLeave={() =>
              setHoveredIso((prev) => (prev === m.iso ? null : prev))
            }
            onFocus={() => setHoveredIso(m.iso)}
            onBlur={() =>
              setHoveredIso((prev) => (prev === m.iso ? null : prev))
            }
            onClick={(e) => {
              e.stopPropagation();
              setOpenIso(m.iso);
            }}
            className="globe-marker-hit pointer-events-auto"
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 22,
              height: 22,
              marginLeft: -11,
              marginTop: -11,
              padding: 0,
              borderRadius: 9999,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              opacity: 0,
              transform: "translate3d(0,0,0)",
              transition: "opacity 120ms linear",
            }}
          >
            <span
              aria-hidden
              className="block h-full w-full rounded-full"
              style={{
                background: m.colors[0],
                boxShadow: `0 0 0 2px ${m.colors[1]}, 0 0 0 3px rgba(255,255,255,0.85)`,
                opacity: 0.0,
                transition: "opacity 120ms linear, transform 120ms ease-out",
              }}
              data-marker-dot
            />
          </button>
        );
      })}

      {/* Hover tooltip — follows the hovered marker's position via rAF */}
      {hoveredMarker && openIso === null ? (
        <HoverTooltip marker={hoveredMarker} rotationRef={rotationRef} />
      ) : null}

      {/* Click popover — small floating card */}
      {openMarker ? (
        <Popover
          marker={openMarker}
          onClose={() => setOpenIso(null)}
          rotationRef={rotationRef}
        />
      ) : null}
    </div>
  );
}

function projectMarker(
  lat: number,
  lng: number,
  phi: number,
  _theta: number,
  sinT: number,
  cosT: number,
): MarkerScreenState {
  // cobe rotates such that increasing phi moves the visible meridian east.
  // Empirically the longitude offset that lines up with cobe's marker
  // placement is `lng_rad + phi` (not minus). This matches what cobe does
  // internally for its `location: [lat, lng]` markers.
  const lambda = (lng * Math.PI) / 180 + phi;
  const phiLat = (lat * Math.PI) / 180;
  const sinLat = Math.sin(phiLat);
  const cosLat = Math.cos(phiLat);
  const sinLam = Math.sin(lambda);
  const cosLam = Math.cos(lambda);

  // Orthographic projection with tilt `theta`.
  const cosC = cosT * cosLat * cosLam + sinT * sinLat;
  const xNorm = cosLat * sinLam;
  const yNorm = sinT * cosLat * cosLam - cosT * sinLat;

  // Radius factor — markers sit slightly inside the visible disk so they
  // don't get clipped at the edge.
  const radius = 0.46;
  const x = 50 + xNorm * radius * 100;
  const y = 50 + yNorm * radius * 100;

  return {
    x,
    y,
    depth: Math.max(0, cosC),
    visible: cosC > 0.05,
  };
}

function applyMarkerStyles(el: HTMLButtonElement, state: MarkerScreenState) {
  el.style.left = `${state.x}%`;
  el.style.top = `${state.y}%`;
  el.style.opacity = state.visible ? "1" : "0";
  el.style.pointerEvents = state.visible ? "auto" : "none";

  const dot = el.querySelector<HTMLSpanElement>("[data-marker-dot]");
  if (dot) {
    // Fade + slight scale based on depth so dots near the rim recede.
    const o = state.visible ? 0.35 + state.depth * 0.55 : 0;
    const s = 0.7 + state.depth * 0.35;
    dot.style.opacity = String(o);
    dot.style.transform = `scale(${s.toFixed(3)})`;
  }
}

function HoverTooltip({
  marker,
  rotationRef,
}: {
  marker: GlobeMarker;
  rotationRef: RefObject<GlobeRotationRef>;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const rot = rotationRef.current;
      const el = ref.current;
      if (rot && el) {
        const sinT = Math.sin(rot.theta);
        const cosT = Math.cos(rot.theta);
        const s = projectMarker(marker.lat, marker.lng, rot.phi, rot.theta, sinT, cosT);
        el.style.left = `${s.x}%`;
        el.style.top = `${s.y}%`;
        el.style.opacity = s.visible ? "1" : "0";
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [marker.lat, marker.lng, rotationRef]);

  return (
    <div
      ref={ref}
      role="tooltip"
      className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-[calc(100%+10px)] rounded-[6px] bg-ink px-2.5 py-1.5 text-[11px] font-medium leading-tight text-[var(--color-paper)] shadow-[0_6px_18px_rgba(11,23,51,0.18)]"
      style={{ left: "50%", top: "50%", opacity: 0 }}
    >
      <div className="flex items-center gap-1.5">
        <span aria-hidden>{marker.flagEmoji}</span>
        <span className="font-mono tabular tracking-[0.04em]">
          ${marker.ticker}
        </span>
      </div>
      <div className="mt-0.5 text-[10px] uppercase tracking-[0.12em] opacity-80 tabular">
        {marker.marketCapUsd ? formatUsd(marker.marketCapUsd) : "pre-launch"}
      </div>
    </div>
  );
}

/**
 * Floating popover card anchored above/below the clicked marker.
 * Closes on outside click and Escape.
 */
function Popover({
  marker,
  onClose,
  rotationRef,
}: {
  marker: GlobeMarker;
  onClose: () => void;
  rotationRef: RefObject<GlobeRotationRef>;
}) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [openUpward, setOpenUpward] = useState(false);

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const card = cardRef.current;
      if (!card) return;
      if (card.contains(e.target as Node)) return;
      // Don't close if the click was on this marker's hit-button (the
      // pointerdown that re-opened the same popover).
      const target = e.target as HTMLElement | null;
      if (target?.closest?.(".globe-marker-hit")) return;
      onClose();
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [onClose]);

  // Follow the marker every frame so the popover doesn't drift off as the
  // globe keeps rotating.
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const rot = rotationRef.current;
      const el = cardRef.current;
      if (rot && el) {
        const sinT = Math.sin(rot.theta);
        const cosT = Math.cos(rot.theta);
        const s = projectMarker(marker.lat, marker.lng, rot.phi, rot.theta, sinT, cosT);
        el.style.left = `${s.x}%`;
        el.style.top = `${s.y}%`;
        // Hide popover if the marker rotated to the back.
        el.style.opacity = s.visible ? "1" : "0";
        el.style.pointerEvents = s.visible ? "auto" : "none";
        setOpenUpward((prev) => {
          const next = s.y > 55;
          return prev === next ? prev : next;
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [marker.lat, marker.lng, rotationRef]);

  return (
    <div
      ref={cardRef}
      role="dialog"
      aria-label={`${marker.name} ($${marker.ticker})`}
      className={cn(
        "pointer-events-auto absolute z-30 w-[260px] -translate-x-1/2 rounded-[10px] bg-paper p-4 ring-rule",
        "stamp-shadow",
        openUpward
          ? "-translate-y-[calc(100%+14px)]"
          : "translate-y-[14px]",
      )}
      style={{ left: "50%", top: "50%" }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full ink-muted hover:bg-paper-2 hover:ink"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>

      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] ring-rule"
          style={{
            backgroundColor: marker.colors[0],
          }}
        >
          <span className="text-base leading-none">{marker.flagEmoji}</span>
        </span>
        <div className="min-w-0">
          <div className="font-display text-lg font-semibold leading-tight tracking-tight">
            {marker.name}
          </div>
          <div className="ink-muted font-mono text-[11px] uppercase tracking-[0.14em]">
            ${marker.ticker}
          </div>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-[var(--color-rule-2)] pt-3">
        <PopStat label="Price" value={formatPrice(marker.priceUsd)} />
        <PopStat
          label="24h"
          value={<ChangePct value={marker.change24hPct} className="text-[13px]" />}
        />
        <PopStat label="Market cap" value={formatUsd(marker.marketCapUsd)} />
        <PopStat
          label="Holders"
          value={
            marker.holders === null ? "—" : formatCompactInt(marker.holders)
          }
        />
      </dl>

      <div className="mt-4 flex flex-col gap-2">
        <Link
          href={`/c/${marker.iso}`}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[6px] bg-ink px-4 py-2 text-[12px] font-medium uppercase tracking-[0.12em] text-[var(--color-paper)] hover:bg-[var(--color-ink-2)]"
          onClick={onClose}
        >
          Open coin page
          <ArrowUpRight className="h-4 w-4" aria-hidden />
        </Link>
        {marker.pumpFunUrl ? (
          <ButtonLink
            href={marker.pumpFunUrl}
            external
            variant="ghost"
            className="!min-h-10 !py-2 !text-[12px]"
          >
            pump.fun ↗
          </ButtonLink>
        ) : null}
      </div>
    </div>
  );
}

function PopStat({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="ink-muted text-[10px] font-medium uppercase tracking-[0.14em]">
        {label}
      </span>
      <span className="font-mono tabular text-sm font-medium ink">{value}</span>
    </div>
  );
}
