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
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              LOOP
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Dashboard
            </h1>

            <p className="mt-2 text-slate-600">
              Welcome back, {session.user.name || session.user.email}.
            </p>
          </div>

          <LogoutButton />
        </header>

        {/* Main Metrics */}
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Feedback Overview
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Total Feedback
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {metrics.total}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                New
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {metrics.status.new}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Reviewed
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {metrics.status.reviewed}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Actioned
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {metrics.status.actioned}
              </p>
            </div>
          </div>
        </section>

        {/* Sentiment */}
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Sentiment
          </h2>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Positive
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {metrics.sentiment.positive}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Neutral
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {metrics.sentiment.neutral}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Negative
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {metrics.sentiment.negative}
              </p>
            </div>
          </div>
        </section>
        <InsightsPanel />
      <DashboardCharts metrics={metrics} />
        {/* Account Information */}
        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Workspace
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Workspace ID
              </p>

              <p className="mt-2 break-all font-semibold text-slate-900">
                {session.user.workspaceId}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Role
              </p>

              <p className="mt-2 font-semibold text-slate-900">
                {session.user.role}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Account
              </p>

              <p className="mt-2 break-all font-semibold text-slate-900">
                {session.user.email}
              </p>
            </div>
          </div>
        </section>

        {/* Feedback Link */}
        <div className="mt-8">
          <a
            href="/dashboard/feedback"
            className="inline-flex rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            View All Feedback →
          </a>
        </div>
      </div>
    </main>
  );
}