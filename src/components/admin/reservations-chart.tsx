"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type DataPoint = {
  month: string;
  count: number;
};

export default function ReservationsChart({ data }: { data: DataPoint[] }) {
  const formattedData = data.map((item) => ({
    ...item,
    month: new Date(item.month).toLocaleDateString("fr-FR", {
      month: "short",
    }),
  }));

  if (formattedData.length === 0) {
    return <p className="de-empty">Aucune donnée disponible.</p>;
  }

  return (
    <div style={{ width: "100%", height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData}>
          <CartesianGrid
            stroke="var(--blue-border)"
            strokeDasharray="3 3"
            vertical={false}
          />

          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--text-muted)", fontSize: 12 }}
            dy={8}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--text-muted)", fontSize: 12 }}
            allowDecimals={false}
            width={40}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--blue-border)",
              borderRadius: "0.5rem",
              color: "var(--foreground)",
              fontSize: "0.875rem",
            }}
            itemStyle={{ color: "var(--blue-soft)" }}
            labelStyle={{ color: "var(--text-muted)", marginBottom: 4 }}
            formatter={(value) => [value, "Réservations"]}
          />

          <Line
            type="monotone"
            dataKey="count"
            stroke="var(--blue-soft)"
            strokeWidth={2.5}
            dot={{
              r: 4,
              fill: "var(--blue-soft)",
              stroke: "var(--blue)",
              strokeWidth: 2,
            }}
            activeDot={{
              r: 6,
              fill: "var(--blue)",
              stroke: "var(--blue-soft)",
              strokeWidth: 2,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
