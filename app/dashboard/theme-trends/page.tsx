"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type TrendPoint = {
  date: string;
  count: number;
};

type ThemeTrend = {
  themeId: string;
  themeName: string;
  total: number;
  changePercent: number;
  trend: "UP" | "DOWN" | "STABLE";
  points: TrendPoint[];
};

type ThemeTrendsResponse = {
  trends: ThemeTrend[];
  spikes: ThemeTrend[];
};

export default function ThemeTrendsPage() {
  const [data, setData] = useState<ThemeTrendsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTrends() {
      try {
        const response = await fetch("/api/theme-trends", {
          cache: "no-store",
        });

        const result: unknown = await response.json();

        if (!response.ok) {
          throw new Error("Unable to load theme trends.");
        }

        setData(result as ThemeTrendsResponse);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load theme trends.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadTrends();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a
            href="/dashboard"
            className="flex items-center gap-2.5 font-bold tracking-tight"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/20">
              <Sparkles size={18} />
            </span>
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              LOOP
            </span>
          </a>

          <nav className="hidden items-center gap-1 md:flex">
            <a
              href="/dashboard"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Dashboard
            </a>
            <a
              href="/dashboard/feedback"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Feedback
            </a>
            <a
              href="/dashboard/ask-loop"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Ask LOOP
            </a>
            <a
              href="/dashboard/theme-trends"
              className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700"
            >
              Theme Trends
            </a>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-7 text-white shadow-xl sm:p-10">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

          <div className="relative">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
              <TrendingUp size={25} />
            </div>

            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-100">
              Feedback Intelligence
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Theme Trends & Spikes
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
              Track how customer feedback themes change over time and identify
              themes experiencing unusual increases.
            </p>
          </div>
        </section>

        {loading && (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
            <p className="mt-4 text-sm text-slate-500">
              Loading theme trends...
            </p>
          </div>
        )}

        {error && !loading && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
            {error}
          </div>
        )}

        {data && !loading && !error && (
          <>
            <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500">
                    Themes tracked
                  </span>
                  <BarChart3 className="text-blue-600" size={20} />
                </div>
                <p className="mt-3 text-3xl font-bold text-slate-900">
                  {data.trends.length}
                </p>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-amber-700">
                    Detected spikes
                  </span>
                  <AlertTriangle className="text-amber-600" size={20} />
                </div>
                <p className="mt-3 text-3xl font-bold text-amber-900">
                  {data.spikes.length}
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-emerald-700">
                    Growing themes
                  </span>
                  <TrendingUp className="text-emerald-600" size={20} />
                </div>
                <p className="mt-3 text-3xl font-bold text-emerald-900">
                  {data.trends.filter((item) => item.trend === "UP").length}
                </p>
              </div>
            </section>

            <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Trend Analysis
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Theme volume over time
                </h2>
              </div>

              {data.trends.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
                  <BarChart3 className="mx-auto text-slate-400" size={28} />
                  <p className="mt-3 text-sm font-medium text-slate-700">
                    No theme trend data available yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {data.trends.map((theme) => (
                    <div key={theme.themeId}>
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-slate-900">
                            {theme.themeName}
                          </h3>
                          <p className="text-xs text-slate-500">
                            {theme.total} feedback items
                          </p>
                        </div>

                        <div
                          className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                            theme.trend === "UP"
                              ? "bg-emerald-50 text-emerald-700"
                              : theme.trend === "DOWN"
                                ? "bg-rose-50 text-rose-700"
                                : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {theme.trend === "UP" && <ArrowUpRight size={14} />}
                          {theme.trend === "DOWN" && (
                            <ArrowDownRight size={14} />
                          )}
                          {theme.changePercent > 0 ? "+" : ""}
                          {theme.changePercent}%
                        </div>
                      </div>

                      <div className="h-56 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={theme.points}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" fontSize={11} />
                            <YAxis allowDecimals={false} fontSize={11} />
                            <Tooltip />
                            <Line
                              type="monotone"
                              dataKey="count"
                              strokeWidth={2.5}
                              dot={{ r: 3 }}
                              activeDot={{ r: 5 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="mt-6 rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                    Attention Required
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-slate-900">
                    Theme spikes
                  </h2>
                </div>
              </div>

              {data.spikes.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-amber-200 bg-white/70 p-8 text-center">
                  <p className="text-sm font-medium text-slate-700">
                    No significant theme spikes detected.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {data.spikes.map((theme) => (
                    <div
                      key={theme.themeId}
                      className="rounded-2xl border border-amber-200 bg-white p-5"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-semibold text-slate-900">
                          {theme.themeName}
                        </h3>
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">
                          +{theme.changePercent}%
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-slate-600">
                        This theme has increased significantly compared with
                        its previous period.
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}