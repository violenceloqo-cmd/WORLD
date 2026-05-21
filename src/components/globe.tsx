"use client";

import createGlobe from "cobe";
import { useEffect, useRef } from "react";
import { GlobeMarkerOverlay, type GlobeMarker } from "@/components/globe-marker-overlay";

export type GlobePoint = {
  lat: number;
  lng: number;
  /** 0..1 — used for marker size weight. */
  weight?: number;
  color?: [number, number, number]; // 0..1
};

/**
 * Shared rotation state read by the HTML overlay every frame to project
 * markers to screen coordinates. `cobe` writes to this on each render tick.
 */
export type GlobeRotationRef = {
  phi: number;
  theta: number;
};

type Props = {
  /** Pixel size of the canvas (square). */
  size?: number;
  /**
   * Ambient/background dots painted by cobe. Use `markers` for interactive
   * country coins; the two can be combined.
   */
  points?: GlobePoint[];
  /**
   * Interactive country markers — paints a dot via cobe and renders an
   * absolutely-positioned hit-button overlay aligned with it.
   */
  markers?: GlobeMarker[];
  /** Optional starting longitude phi (radians). */
  initialPhi?: number;
  className?: string;
};

/**
 * Lightweight 3D globe via `cobe`. Auto-rotates, draggable horizontally,
 * markers sized by `weight`. No Three.js — keeps bundle small.
 *
 * When `markers` are provided, an HTML overlay is rendered on top of the
 * canvas with invisible hit-buttons that follow the rotation. Hover shows a
 * tooltip; click opens a popover with links to the coin page and pump.fun.
 */
export function Globe({
  size = 600,
  points = [],
  markers = [],
  initialPhi = 0,
  className,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerRef = useRef<{
    x: number;
    pressing: boolean;
    targetPhi: number;
  }>({ x: 0, pressing: false, targetPhi: initialPhi });
  // Rotation state shared with the overlay. Updated every cobe render tick.
  const rotationRef = useRef<GlobeRotationRef>({ phi: initialPhi, theta: 0.28 });

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    let phi = initialPhi;
    let width = 0;

    const onResize = () => {
      width = canvas.offsetWidth;
    };
    onResize();

    const theta = 0.28;

    const ambientMarkers = points.map((p) => ({
      location: [p.lat, p.lng] as [number, number],
      size: 0.025 + Math.min(0.06, (p.weight ?? 0) * 0.06),
    }));
    const coinMarkers = markers.map((m) => ({
      location: [m.lat, m.lng] as [number, number],
      size: 0.03 + Math.min(0.05, (m.weight ?? 0.5) * 0.05),
    }));
    const allMarkers = [...ambientMarkers, ...coinMarkers];

    const globe = createGlobe(canvas, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: initialPhi,
      theta,
      dark: 0,
      diffuse: 1.05,
      mapSamples: 16_000,
      mapBrightness: 6,
      baseColor: [0.96, 0.94, 0.88],     // paper
      markerColor: [0.054, 0.302, 0.643], // accent blue
      glowColor: [0.96, 0.94, 0.88],
      markers: allMarkers,
      onRender: (state) => {
        if (!pointerRef.current.pressing) {
          phi += 0.0025;
        }
        const effectivePhi = phi + pointerRef.current.targetPhi;
        state.phi = effectivePhi;
        state.width = width * 2;
        state.height = width * 2;
        rotationRef.current.phi = effectivePhi;
        rotationRef.current.theta = theta;
      },
    });

    const onPointerDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      pointerRef.current.pressing = true;
      pointerRef.current.x = e.clientX;
    };
    const onPointerUp = () => {
      pointerRef.current.pressing = false;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!pointerRef.current.pressing) return;
      const delta = e.clientX - pointerRef.current.x;
      pointerRef.current.targetPhi += delta / 200;
      pointerRef.current.x = e.clientX;
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointermove", onPointerMove);
    window.addEventListener("resize", onResize);

    return () => {
      globe.destroy();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", onResize);
    };
  }, [points, markers, initialPhi]);

  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "1 / 1",
        maxWidth: size,
        contain: "layout paint size",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          cursor: "grab",
          touchAction: "pan-y",
        }}
        aria-label="Interactive globe of country coins"
      />
      {markers.length > 0 ? (
        <GlobeMarkerOverlay markers={markers} rotationRef={rotationRef} />
      ) : null}
    </div>
  );
}
