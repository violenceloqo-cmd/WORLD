"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatPrice, formatUsd } from "@/lib/format";

type Point = { t: number; v: number };

type Props = {
  data: Point[];
  positive?: boolean | null;
  /** What the Y-axis and tooltip represent. */
  metric?: "price" | "marketCap";
};

export function PriceChart({ data, positive, metric = "marketCap" }: Props) {
  const isMarketCap = metric === "marketCap";
  const formatValue = isMarketCap ? formatUsd : formatPrice;
  const tooltipLabel = isMarketCap ? "Market cap" : "Price";
  const gradientId = isMarketCap ? "fillMarketCap" : "fillPrice";
  const color =
    positive === true
      ? "#1F7A4D"
      : positive === false
        ? "#C0392B"
        : "#0B1733";
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.18} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="t"
            type="number"
            scale="time"
            domain={["dataMin", "dataMax"]}
            tick={{ fill: "#4B5A7A", fontSize: 10 }}
            tickLine={false}
            axisLine={{ stroke: "#C7BFAA" }}
            tickFormatter={(t) =>
              new Date(t).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            }
          />
          <YAxis
            dataKey="v"
            tick={{ fill: "#4B5A7A", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatValue(v)}
            width={isMarketCap ? 72 : 56}
          />
          <Tooltip
            cursor={{ stroke: "#C7BFAA", strokeDasharray: "3 3" }}
            contentStyle={{
              background: "#F5F1E8",
              border: "1px solid #C7BFAA",
              borderRadius: 6,
              fontSize: 12,
              color: "#0B1733",
            }}
            formatter={(value: number) => [formatValue(value), tooltipLabel]}
            labelFormatter={(t: number) =>
              new Date(t).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
              })
            }
          />
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.6}
            fill={`url(#${gradientId})`}
            animationDuration={600}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
