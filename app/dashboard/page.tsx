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
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white shadow-sm">
                L
              </div>

              <div>
                <p className="text-sm font-bold tracking-wide text-slate-900">
                  LOOP
                </p>
                <p className="text-xs text-slate-500">
                  Feedback Intelligence Platform
                </p>
              </div>
            </div>
          </div>

          <LogoutButton />
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome */}
        <section className="mb-8">
          <div className="flex flex-col justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Dashboard
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Welcome back, {session.user.name || session.user.email}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Monitor customer feedback, understand sentiment, and turn
                feedback into actionable insights.
              </p>
            </div>

            <a
              href="/dashboard/feedback"
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
            >
              View Feedback
              <span className="ml-2">→</span>
            </a>
          </div>
        </section>

        {/* Main Metrics */}
        <section className="mb-8">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900">
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
              },
              {
                label: "New",
                value: metrics.status.new,
              },
              {
                label: "Reviewed",
                value: metrics.status.reviewed,
              },
              {
                label: "Actioned",
                value: metrics.status.actioned,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="text-sm font-medium text-slate-500">
                  {item.label}
                </p>

                <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                  {item.value}
                </p>

                <div className="mt-4 h-1 w-10 rounded-full bg-slate-900 transition-all group-hover:w-16" />
              </div>
            ))}
          </div>
        </section>

        {/* Sentiment */}
        <section className="mb-8">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              Sentiment
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Feedback sentiment after analysis.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
              <p className="text-sm font-medium text-slate-500">
                Positive
              </p>
              <p className="mt-3 text-3xl font-bold text-emerald-600">
                {metrics.sentiment.positive}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
              <p className="text-sm font-medium text-slate-500">
                Neutral
              </p>
              <p className="mt-3 text-3xl font-bold text-slate-600">
                {metrics.sentiment.neutral}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
              <p className="text-sm font-medium text-slate-500">
                Negative
              </p>
              <p className="mt-3 text-3xl font-bold text-rose-600">
                {metrics.sentiment.negative}
              </p>
            </div>
          </div>
        </section>

        {/* Insights */}
        <section className="mb-8">
          <InsightsPanel />
        </section>

        {/* Analytics */}
        <section className="mb-8">
          <DashboardCharts metrics={metrics} />
        </section>

        {/* Workspace */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              Workspace
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Account and workspace information.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Workspace ID
              </p>

              <p className="mt-3 break-all font-mono text-xs leading-5 text-slate-700">
                {session.user.workspaceId}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Role
              </p>

              <div className="mt-3">
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                  {session.user.role}
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Account
              </p>

              <p className="mt-3 break-all text-sm font-semibold text-slate-700">
                {session.user.email}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}