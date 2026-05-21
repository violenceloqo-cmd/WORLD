"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Props = {
  values: number[];
  width?: number;
  height?: number;
  positive?: boolean | null;
  className?: string;
};

/**
 * Minimal SVG sparkline. Uses the brand emerald/crimson based on the
 * `positive` hint. Falls back to a neutral dashed baseline when empty.
 */
export function Sparkline({
  values,
  width = 96,
  height = 28,
  positive,
  className,
}: Props) {
  if (!values || values.length < 2) {
    return (
      <svg
        width={width}
        height={height}
        className={cn("text-[var(--color-rule)]", className)}
        viewBox={`0 0 ${width} ${height}`}
      >
        <line
          x1={0}
          x2={width}
          y1={height / 2}
          y2={height / 2}
          stroke="currentColor"
          strokeDasharray="2 3"
          strokeWidth={1}
        />
      </svg>
    );
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = width / (values.length - 1);
  const points = values
    .map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / range) * height;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  const color =
    positive === true
      ? "var(--color-emerald)"
      : positive === false
        ? "var(--color-crimson)"
        : "var(--color-ink-muted)";

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
    >
      <motion.polyline
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </svg>
  );
}
