"use client";

import { useEffect, useState } from "react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type DashboardMetrics = {
  total: number;
  status: {
    new: number;
    reviewed: number;
    actioned: number;
  };
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
};

type DashboardChartsProps = {
  metrics: DashboardMetrics;
};

type TrendPoint = {
  date: string;
  count: number;
};

export default function DashboardCharts({
  metrics,
}: DashboardChartsProps) {
      const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [trendError, setTrendError] = useState("");

  useEffect(() => {
    async function loadTrend() {
      try {
        const response = await fetch("/api/dashboard/trend");

        const data: {
          trend?: TrendPoint[];
          error?: string;
        } = await response.json();

        if (!response.ok) {
          setTrendError(data.error || "Unable to load trend");
          return;
        }

        setTrend(data.trend ?? []);
      } catch {
        setTrendError("Unable to load feedback trend");
      }
    }

    loadTrend();
  }, []);
  const statusData = [
    {
      name: "New",
      value: metrics.status.new,
    },
    {
      name: "Reviewed",
      value: metrics.status.reviewed,
    },
    {
      name: "Actioned",
      value: metrics.status.actioned,
    },
  ];

  const sentimentData = [
    {
      name: "Positive",
      value: metrics.sentiment.positive,
    },
    {
      name: "Neutral",
      value: metrics.sentiment.neutral,
    },
    {
      name: "Negative",
      value: metrics.sentiment.negative,
    },
  ];

  const sentimentColors = [
    "#16a34a",
    "#64748b",
    "#dc2626",
  ];

  return (
    <section className="mt-8">
      <h2 className="mb-4 text-xl font-semibold text-slate-900">
        Analytics
      </h2>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Feedback Status */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">
            Feedback by Status
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Current feedback workflow status.
          </p>

          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={statusData}
                margin={{
                  top: 10,
                  right: 10,
                  left: 0,
                  bottom: 10,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="name" />

                <YAxis allowDecimals={false} />

                <Tooltip />

                <Bar
                  dataKey="value"
                  name="Feedback"
                  fill="#0f172a"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sentiment */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">
            Sentiment Distribution
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Feedback sentiment after analysis.
          </p>

          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {sentimentData.map((entry, index) => (
                    <Cell
                      key={`sentiment-${entry.name}`}
                      fill={sentimentColors[index]}
                    />
                  ))}
                </Pie>

                <Tooltip />

                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
           </div>

      {/* Feedback Trend */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">
          Feedback Trend
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Number of feedback entries created over time.
        </p>

        {trendError ? (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {trendError}
          </div>
        ) : trend.length === 0 ? (
          <div className="mt-6 flex h-72 items-center justify-center text-sm text-slate-500">
            No feedback trend data available.
          </div>
        ) : (
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trend}
                margin={{
                  top: 10,
                  right: 10,
                  left: 0,
                  bottom: 10,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="date" />

                <YAxis allowDecimals={false} />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="count"
                  name="Feedback"
                  stroke="#0f172a"
                  strokeWidth={2}
                  dot
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </section>
  );
}
  