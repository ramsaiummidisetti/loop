"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  CalendarDays,
  FileText,
  Loader2,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";


type ReportStats = {
  totalFeedback: number;
  positive: number;
  neutral: number;
  negative: number;
  positivePercent: number;
  negativePercent: number;
  topThemes: Array<{
    name: string;
    count: number;
  }>;
  quotes: Array<{
    content: string;
    channel: string;
    sentiment: string | null;
  }>;
};

type ReportContent = {
  stats: ReportStats;
  narrative: string;
  recommendedActions: string[];
};

type Report = {
  id: string;
  title: string;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
  generatedBy: string;
  content?: ReportContent;
};

type ReportsResponse = {
  reports: Report[];
};

type GeneratedReportResponse = {
  id: string;
  title: string;
  periodStart: string;
  periodEnd: string;
  content: ReportContent;
  createdAt: string;
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString();
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function getMonthStart(): string {
  const date = new Date();
  date.setDate(1);
  return date.toISOString().slice(0, 10);
}

export default function ReportsPage() {
  const { data: session } = useSession();
  const [periodStart, setPeriodStart] = useState(getMonthStart);
  const [periodEnd, setPeriodEnd] = useState(getToday);

  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] =
    useState<Report | null>(null);

  const [loadingReports, setLoadingReports] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadReports() {
      try {
        const response = await fetch("/api/reports", {
          cache: "no-store",
        });

        const data: unknown = await response.json();

        if (!response.ok) {
          throw new Error("Unable to load saved reports.");
        }

        const parsed = data as ReportsResponse;
        setReports(parsed.reports);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load saved reports.",
        );
      } finally {
        setLoadingReports(false);
      }
    }

    void loadReports();
  }, []);

  async function handleGenerateReport(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setSelectedReport(null);

    if (periodStart > periodEnd) {
      setError("Start date must be before or equal to the end date.");
      return;
    }

    setGenerating(true);

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          periodStart,
          periodEnd,
        }),
      });

      const data: unknown = await response.json();

      if (!response.ok) {
        const message =
          typeof data === "object" &&
          data !== null &&
          "message" in data &&
          typeof data.message === "string"
            ? data.message
            : "Unable to generate report.";

        throw new Error(message);
      }

      const generated = data as GeneratedReportResponse;

      const newReport: Report = {
        id: generated.id,
        title: generated.title,
        periodStart: generated.periodStart,
        periodEnd: generated.periodEnd,
        createdAt: generated.createdAt,
        generatedBy: "",
        content: generated.content,
      };

      setSelectedReport(newReport);
      setReports((current) => [newReport, ...current]);
      setSuccess("VoC report generated and saved successfully.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to generate report.",
      );
    } finally {
      setGenerating(false);
    }
  }

  async function viewReport(report: Report) {
    setError("");
    setSuccess("");

    if (report.content) {
      setSelectedReport(report);
      return;
    }

    try {
      const response = await fetch(`/api/reports/${report.id}`, {
        cache: "no-store",
      });

      const data: unknown = await response.json();

      if (!response.ok) {
        throw new Error("Unable to load this report.");
      }

      if (
        typeof data !== "object" ||
        data === null ||
        !("report" in data)
      ) {
        throw new Error("Invalid report response.");
      }

      const payload = data as {
      report: {
        id: string;
        title: string;
        periodStart: string;
        periodEnd: string;
        contentJson: ReportContent;
        createdAt: string;
        generatedBy: string;
      };
    };

    const fullReport: Report = {
      id: payload.report.id,
      title: payload.report.title,
      periodStart: payload.report.periodStart,
      periodEnd: payload.report.periodEnd,
      createdAt: payload.report.createdAt,
      generatedBy: payload.report.generatedBy,
      content: payload.report.contentJson,
    };

    setSelectedReport(fullReport);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load this report.",
      );
    }
  }
    async function deleteReport(report: Report) {
    const confirmed = window.confirm(
      `Delete "${report.title}"?\n\nThis action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/reports/${report.id}`, {
        method: "DELETE",
      });

      const data: unknown = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data === "object" &&
            data !== null &&
            "message" in data &&
            typeof data.message === "string"
            ? data.message
            : "Unable to delete this report.",
        );
      }

      setReports((currentReports) =>
        currentReports.filter((item) => item.id !== report.id),
      );

      setSelectedReport((currentReport) =>
        currentReport?.id === report.id ? null : currentReport,
      );

      setSuccess("Report deleted successfully.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to delete this report.",
      );
    }
  }
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
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Theme Trends
            </a>

            <a
              href="/dashboard/reports"
              className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700"
            >
              Reports
            </a>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-7 text-white shadow-xl shadow-blue-500/10 sm:p-10">
          <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />

          <div className="relative">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
              <FileText size={24} />
            </div>

            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-100">
              Voice of Customer
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              VoC Reports
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
              Turn your customer feedback into a structured report with
              sentiment, themes, representative feedback, and recommended
              actions.
            </p>
          </div>
        </section>

        {error && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
            {success}
          </div>
        )}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Generate
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Create a Voice-of-Customer report
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Select the period you want LOOP to analyze.
            </p>
          </div>

          <form
            onSubmit={handleGenerateReport}
            className="grid gap-5 md:grid-cols-[1fr_1fr_auto]"
          >
            <div>
              <label
                htmlFor="period-start"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Start date
              </label>

              <div className="relative">
                <CalendarDays
                  size={17}
                  className="absolute left-3 top-3.5 text-slate-400"
                />

                <input
                  id="period-start"
                  type="date"
                  value={periodStart}
                  onChange={(event) =>
                    setPeriodStart(event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pl-10 text-sm text-slate-900 outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="period-end"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                End date
              </label>

              <div className="relative">
                <CalendarDays
                  size={17}
                  className="absolute left-3 top-3.5 text-slate-400"
                />

                <input
                  id="period-end"
                  type="date"
                  value={periodEnd}
                  onChange={(event) =>
                    setPeriodEnd(event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pl-10 text-sm text-slate-900 outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={generating}
              className="self-end inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {generating ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={17} />
                  Generate Report
                </>
              )}
            </button>
          </form>
        </section>

        {selectedReport?.content && (
          <section className="mt-6 space-y-6">
            <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-violet-50 p-6 shadow-sm sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Generated Report
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                {selectedReport.title}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {formatDate(selectedReport.periodStart)} —{" "}
                {formatDate(selectedReport.periodEnd)}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Total feedback</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {selectedReport.content.stats.totalFeedback}
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
                <div className="flex items-center gap-2 text-emerald-700">
                  <TrendingUp size={17} />
                  <p className="text-sm font-medium">Positive</p>
                </div>

                <p className="mt-2 text-3xl font-bold text-emerald-900">
                  {selectedReport.content.stats.positivePercent}%
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Neutral</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {selectedReport.content.stats.neutral}
                </p>
              </div>

              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
                <div className="flex items-center gap-2 text-rose-700">
                  <TrendingDown size={17} />
                  <p className="text-sm font-medium">Negative</p>
                </div>

                <p className="mt-2 text-3xl font-bold text-rose-900">
                  {selectedReport.content.stats.negativePercent}%
                </p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">
                  Executive Summary
                </p>

                <p className="mt-4 text-sm leading-7 text-slate-700">
                  {selectedReport.content.narrative}
                </p>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Top Themes
                </p>

                <div className="mt-4 space-y-3">
                  {selectedReport.content.stats.topThemes.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No themes were assigned during this period.
                    </p>
                  ) : (
                    selectedReport.content.stats.topThemes.map((theme) => (
                      <div
                        key={theme.name}
                        className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                      >
                        <span className="text-sm font-medium text-slate-700">
                          {theme.name}
                        </span>

                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                          {theme.count}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">
                Representative Feedback
              </p>

              <div className="mt-5 space-y-4">
                {selectedReport.content.stats.quotes.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No representative feedback is available.
                  </p>
                ) : (
                  selectedReport.content.stats.quotes.map((quote, index) => (
                    <blockquote
                      key={`${quote.content}-${index}`}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                    >
                      <p className="text-sm leading-6 text-slate-700">
                        “{quote.content}”
                      </p>

                      <footer className="mt-3 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-white px-2.5 py-1 font-medium text-slate-500">
                          {quote.channel}
                        </span>

                        {quote.sentiment && (
                          <span className="rounded-full bg-white px-2.5 py-1 font-semibold text-slate-600">
                            {quote.sentiment}
                          </span>
                        )}
                      </footer>
                    </blockquote>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                Recommended Actions
              </p>

              <div className="mt-5 space-y-3">
                {selectedReport.content.recommendedActions.map(
                  (action, index) => (
                    <div
                      key={action}
                      className="flex gap-3 rounded-xl border border-amber-100 bg-white p-4"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-800">
                        {index + 1}
                      </span>

                      <p className="text-sm leading-6 text-slate-700">
                        {action}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </section>
          </section>
        )}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              History
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Saved Reports
            </h2>
          </div>

          {loadingReports ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="animate-spin text-blue-600" size={25} />
            </div>
          ) : reports.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
              <FileText
                className="mx-auto text-slate-400"
                size={28}
              />

              <p className="mt-3 text-sm font-medium text-slate-700">
                No saved reports yet.
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Generate your first VoC report above.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50/30 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {report.title}
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      {formatDate(report.periodStart)} —{" "}
                      {formatDate(report.periodEnd)}
                      {" · "}
                      Created {formatDate(report.createdAt)}
                    </p>
                  </div>

                                   <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void viewReport(report)}
                      className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                    >
                      View Report
                    </button>

                    {session?.user?.role === "ADMIN" && (
                      <button
                        type="button"
                        onClick={() => void deleteReport(report)}
                        className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}