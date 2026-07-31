"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type MonthlyData = { month: string; revenue?: number; commission?: number };

type VehicleBarData = {
  label: string;
  revenue: number;
};

const tooltipStyle = {
  backgroundColor: "var(--surface)",
  border: "1px solid var(--blue-border)",
  borderRadius: "0.5rem",
  color: "var(--foreground)",
  fontSize: "0.875rem",
};

function formatMonthLabel(month: string) {
  return new Date(month).toLocaleDateString("fr-FR", { month: "short" });
}

function EmptyChart() {
  return <p className="de-empty">Aucune donnée disponible.</p>;
}

export function FinanceRevenueChart({ data }: { data: MonthlyData[] }) {
  const formattedData = data.map((item) => ({
    ...item,
    month: formatMonthLabel(item.month),
  }));

  if (formattedData.length === 0) return <EmptyChart />;

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
            tickFormatter={(v) => `${v} €`}
            width={60}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            itemStyle={{ color: "var(--blue-soft)" }}
            labelStyle={{ color: "var(--text-muted)", marginBottom: 4 }}
            formatter={(value) => [`${value} €`, "Chiffre d'affaires"]}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="var(--blue)"
            strokeWidth={2.5}
            dot={{
              r: 4,
              fill: "var(--blue)",
              stroke: "var(--blue-soft)",
              strokeWidth: 2,
            }}
            activeDot={{
              r: 6,
              fill: "var(--blue-soft)",
              stroke: "var(--blue)",
              strokeWidth: 2,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function FinanceCommissionChart({ data }: { data: MonthlyData[] }) {
  const formattedData = data.map((item) => ({
    ...item,
    month: formatMonthLabel(item.month),
  }));

  if (formattedData.length === 0) return <EmptyChart />;

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
            tickFormatter={(v) => `${v} €`}
            width={60}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            itemStyle={{ color: "var(--blue-soft)" }}
            labelStyle={{ color: "var(--text-muted)", marginBottom: 4 }}
            formatter={(value) => [`${value} €`, "Commission DreamEffect"]}
          />
          <Line
            type="monotone"
            dataKey="commission"
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

export function FinanceVehicleComparisonChart({
  data,
}: {
  data: VehicleBarData[];
}) {
  if (data.length === 0) return <EmptyChart />;

  const height = Math.max(260, data.length * 48);

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
          <CartesianGrid
            stroke="var(--blue-border)"
            strokeDasharray="3 3"
            horizontal={false}
          />
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--text-muted)", fontSize: 12 }}
            tickFormatter={(v) => `${v} €`}
          />
          <YAxis
            type="category"
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--text-muted)", fontSize: 12 }}
            width={100}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            itemStyle={{ color: "var(--blue-soft)" }}
            labelStyle={{ color: "var(--text-muted)", marginBottom: 4 }}
            formatter={(value) => [`${value} €`, "CA généré"]}
          />
          <Bar
            dataKey="revenue"
            fill="var(--blue)"
            radius={[0, 4, 4, 0]}
            maxBarSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
