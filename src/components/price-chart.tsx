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
      ? "#34D399"
      : positive === false
        ? "#F2576B"
        : "#38D6E6";
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
            tick={{ fill: "#8EA0C2", fontSize: 10 }}
            tickLine={false}
            axisLine={{ stroke: "#283448" }}
            tickFormatter={(t) =>
              new Date(t).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            }
          />
          <YAxis
            dataKey="v"
            tick={{ fill: "#8EA0C2", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatValue(v)}
            width={isMarketCap ? 72 : 56}
          />
          <Tooltip
            cursor={{ stroke: "#283448", strokeDasharray: "3 3" }}
            contentStyle={{
              background: "#0D1424",
              border: "1px solid #283448",
              borderRadius: 6,
              fontSize: 12,
              color: "#EAF1FF",
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
