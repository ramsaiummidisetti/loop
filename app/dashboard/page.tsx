import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import DashboardCharts from "@/components/dashboard-charts";
import LogoutButton from "@/components/logout-button";
import InsightsPanel from "@/components/insights-panel";

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

async function getDashboardMetrics(
  workspaceId: string
): Promise<DashboardMetrics> {
  const [
    total,
    newCount,
    reviewed,
    actioned,
    positive,
    neutral,
    negative,
  ] = await Promise.all([
    db.feedback.count({
      where: {
        workspaceId,
      },
    }),

    db.feedback.count({
      where: {
        workspaceId,
        status: "NEW",
      },
    }),

    db.feedback.count({
      where: {
        workspaceId,
        status: "REVIEWED",
      },
    }),

    db.feedback.count({
      where: {
        workspaceId,
        status: "ACTIONED",
      },
    }),

    db.feedback.count({
      where: {
        workspaceId,
        sentiment: "POS",
      },
    }),

    db.feedback.count({
      where: {
        workspaceId,
        sentiment: "NEU",
      },
    }),

    db.feedback.count({
      where: {
        workspaceId,
        sentiment: "NEG",
      },
    }),
  ]);

  return {
    total,
    status: {
      new: newCount,
      reviewed,
      actioned,
    },
    sentiment: {
      positive,
      neutral,
      negative,
    },
  };
}
export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  let metrics: DashboardMetrics;

  try {
    metrics = await getDashboardMetrics(session.user.workspaceId);
  } catch {
    metrics = {
      total: 0,
      status: {
        new: 0,
        reviewed: 0,
        actioned: 0,
      },
      sentiment: {
        positive: 0,
        neutral: 0,
        negative: 0,
      },
    };
  }

  return (
  <main className="min-h-screen bg-slate-50">
        {/* Header */}
      
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 sm:px-6 lg:px-8">

          {/* LOOP Logo */}
          <a
            href="/dashboard"
            className="flex shrink-0 items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-sm font-bold text-white shadow-lg shadow-blue-600/20">
              L
            </div>

            <div className="hidden sm:block">
              <p className="text-sm font-bold tracking-wide text-slate-950">
                LOOP
              </p>

              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Feedback Intelligence
              </p>
            </div>
          </a>

          {/* Navigation */}
          <nav className="hidden flex-1 items-center gap-1 lg:flex">
            <a
              href="/dashboard"
              className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-100"
            >
              Dashboard
            </a>

            <a
              href="/dashboard/feedback"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600"
            >
              Feedback
            </a>

            <a
              href="/dashboard/feedback#semantic-search"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-violet-50 hover:text-violet-600"
            >
              Search
            </a>
               <a
              href="/dashboard/ask-loop"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Ask LOOP
            </a>
            <a
              href="/dashboard/theme-trends"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Theme Trends
            </a>
            <a
            href="/dashboard/reports"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            Reports
          </a>
            <a
              href="/dashboard#insights"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-blue-50 hover:text-blue-600"
            >
              Insights
            </a>
            {session.user.role === "ADMIN" && (
            <a
              href="/dashboard/members"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600"
            >
              Members
            </a>
          )}
          </nav>

          {/* User Actions */}
          <div className="ml-auto flex shrink-0 items-center gap-3">
            {/* Role */}
            <div className="hidden rounded-full border border-indigo-100 bg-gradient-to-r from-blue-50 to-violet-50 px-3 py-1.5 text-xs font-bold text-indigo-700 sm:block">
              {session.user.role}
            </div>

            <LogoutButton />
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="border-t border-slate-100 bg-slate-50/90 lg:hidden">
          <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2 sm:px-6">
            <a
              href="/dashboard"
              className="whitespace-nowrap rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600"
            >
              Dashboard
            </a>

            <a
              href="/dashboard/feedback"
              className="whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600"
            >
              Feedback
            </a>

            <a
              href="/dashboard/feedback#semantic-search"
              className="whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-violet-50 hover:text-violet-600"
            >
              Search
            </a>
            <a
              href="/dashboard/ask-loop"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Ask LOOP
            </a>
            <a
              href="/dashboard/theme-trends"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Theme Trends
            </a>
            <a
            href="/dashboard/reports"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            Reports
          </a>
            <a
              href="/dashboard#insights"
              className="whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-blue-50 hover:text-blue-600"
            >
              Insights
            </a>
          </nav>
        </div>
      </header>

    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Welcome */}
      <section className="relative mb-8 overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-7 text-white shadow-xl shadow-indigo-900/10 sm:p-9">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-violet-300/20 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-center">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-blue-50">
                Dashboard
              </span>

              <span className="h-1 w-1 rounded-full bg-blue-200" />

              <span className="text-xs text-blue-100">
                Customer intelligence overview
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Welcome back,{" "}
              {session.user.name || session.user.email}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
              Monitor customer feedback, understand sentiment, and turn
              feedback into actionable insights.
            </p>
          </div>

          <a
            href="/dashboard/feedback"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
          >
            View Feedback
            <span className="ml-2">→</span>
          </a>
        </div>
      </section>

      {/* Main Metrics */}
      <section className="mb-8">
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
            Overview
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-950">
            Feedback Overview
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Current feedback workflow status.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Total Feedback",
              value: metrics.total,
              icon: "◉",
              iconClass: "bg-blue-100 text-blue-700",
              accent: "bg-blue-600",
            },
            {
              label: "New",
              value: metrics.status.new,
              icon: "✦",
              iconClass: "bg-violet-100 text-violet-700",
              accent: "bg-violet-600",
            },
            {
              label: "Reviewed",
              value: metrics.status.reviewed,
              icon: "✓",
              iconClass: "bg-amber-100 text-amber-700",
              accent: "bg-amber-500",
            },
            {
              label: "Actioned",
              value: metrics.status.actioned,
              icon: "↗",
              iconClass: "bg-emerald-100 text-emerald-700",
              accent: "bg-emerald-500",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5"
            >
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                    {item.label}
                  </p>

                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold ${item.iconClass}`}
                  >
                    {item.icon}
                  </span>
                </div>

                <p className="mt-5 text-3xl font-bold tracking-tight text-slate-950">
                  {item.value}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Feedback records
                </p>
              </div>

              <div
                className={`h-1 w-0 ${item.accent} transition-all duration-300 group-hover:w-full`}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Sentiment */}
      <section className="mb-8">
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
            AI Analysis
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-950">
            Customer Sentiment
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Feedback sentiment after AI analysis.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-600">
                Positive
              </p>

              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-sm font-bold text-emerald-700">
                ↗
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold text-slate-950">
              {metrics.sentiment.positive}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Positive feedback
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                Neutral
              </p>

              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600">
                →
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold text-slate-950">
              {metrics.sentiment.neutral}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Neutral feedback
            </p>
          </div>

          <div className="rounded-2xl border border-rose-100 bg-gradient-to-br from-white to-rose-50 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-rose-600">
                Negative
              </p>

              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-sm font-bold text-rose-700">
                ↘
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold text-slate-950">
              {metrics.sentiment.negative}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Negative feedback
            </p>
          </div>
        </div>
      </section>

      {/* Insights */}
      <section id="insights" className="mb-8 scroll-mt-24">
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
            Intelligence
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-950">
            AI Insights
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Patterns and observations from your customer feedback.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-violet-50 shadow-sm">
          <div className="p-1">
            <InsightsPanel />
          </div>
        </div>
      </section>

      {/* Analytics */}
      <section className="mb-8">
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-600">
            Analytics
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-950">
            Feedback Analytics
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Visualize feedback status, sentiment, and trends.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
          <DashboardCharts metrics={metrics} />
        </div>
      </section>

      {/* Workspace */}
      <section>
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
            Workspace
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-950">
            Workspace Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Account and workspace details.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-sm font-bold text-blue-700">
                ID
              </span>

              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                Workspace ID
              </p>
            </div>

            <p className="mt-4 break-all font-mono text-xs leading-5 text-slate-600">
              {session.user.workspaceId}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-violet-200 hover:shadow-md">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-sm font-bold text-violet-700">
                R
              </span>

              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                Role
              </p>
            </div>

            <div className="mt-4">
              <span className="inline-flex rounded-full bg-gradient-to-r from-violet-50 to-blue-50 px-3.5 py-1.5 text-xs font-bold text-violet-700 ring-1 ring-violet-100">
                {session.user.role}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-sm font-bold text-emerald-700">
                @
              </span>

              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                Account
              </p>
            </div>

            <p className="mt-4 break-all text-sm font-semibold text-slate-700">
              {session.user.email}
            </p>
          </div>
        </div>
      </section>
    </div>
  </main>
);
}