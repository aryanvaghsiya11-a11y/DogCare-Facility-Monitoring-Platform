"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTrends } from "@/features/manager/queries";

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value?: number | string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-sm py-xs text-sm shadow-card">
      <p className="font-medium text-slate-900">{label}</p>
      <p className="text-brand-600">{payload[0]?.value} incidents</p>
    </div>
  );
}

export function TrendCharts() {
  const { data } = useTrends();
  const points = data ?? [];

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={points} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#16b57c" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#16b57c" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis
          dataKey="day"
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#16b57c", strokeDasharray: "4 4" }} />
        <Area
          type="monotone"
          dataKey="incidents"
          stroke="#0a9363"
          strokeWidth={2}
          fill="url(#trendFill)"
          activeDot={{ r: 4, fill: "#0a9363", stroke: "#fff", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
