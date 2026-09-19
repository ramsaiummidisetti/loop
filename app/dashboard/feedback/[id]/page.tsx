"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AnalyzeSentimentButton from "./components/analyze-sentiment-button";
import ExtractThemesButton from "./components/extract-themes-button";
import { useParams, useRouter } from "next/navigation";

type FeedbackTheme = {
  id: string;
  name: string;
  description: string;
  color: string;
  confidence: number;
};

type Feedback = {
  id: string;
  content: string;
  channel: string;
  sourceRef: string | null;
  customerLabel: string | null;
  sentiment: "POS" | "NEU" | "NEG" | null;
  sentimentScore: number | null;
  status: "NEW" | "REVIEWED" | "ACTIONED";
  createdAt: string;
  themes: FeedbackTheme[];
};

export default function FeedbackDetailPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [status, setStatus] = useState("");
  const [role, setRole] = useState("");

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadSession() {
    try {
      const response = await fetch("/api/auth/session");

      if (!response.ok) {
        setRole("");
        return;
      }

      const data = await response.json();

      setRole(data?.user?.role || "");
    } catch {
      setRole("");
    }
  }

  async function loadFeedback() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/feedback/${id}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to load feedback");
        return;
      }

      setFeedback(data.feedback);
      setStatus(data.feedback.status);
    } catch {
      setError("Something went wrong while loading feedback.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) {
      loadFeedback();
      loadSession();
    }
  }, [id]);

  async function updateStatus() {
    if (!feedback || !status) {
      return;
    }

    setUpdating(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/feedback/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to update status");
        return;
      }

      setFeedback(data.feedback);
      setStatus(data.feedback.status);
      setSuccess("Status updated successfully.");
    } catch {
      setError("Something went wrong while updating status.");
    } finally {
      setUpdating(false);
    }
  }

  async function deleteFeedback() {
    if (!feedback) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this feedback? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    setUpdating(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/feedback/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to delete feedback");
        return;
      }

      router.push("/dashboard/feedback");
      router.refresh();
    } catch {
      setError("Something went wrong while deleting feedback.");
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-3xl text-center text-sm text-slate-500">
          Loading feedback...
        </div>
      </main>
    );
  }

  if (!feedback) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/dashboard/feedback"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            ← Back to Feedback
          </Link>

          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error || "Feedback not found."}
          </div>
        </div>
      </main>
    );
  }

  const canModify = role === "ADMIN" || role === "ANALYST";
return (
  <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-6">
    <div className="mx-auto max-w-6xl">

      {/* Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/dashboard/feedback"
          className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-indigo-600 hover:shadow-sm"
        >
          ← Back to Feedback
        </Link>

        <span className="hidden rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-indigo-600 sm:inline-flex">
          Feedback Details
        </span>
      </div>

      {/* Header */}
      <header className="relative mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-indigo-100 blur-3xl" />
        <div className="absolute -bottom-20 right-48 h-40 w-40 rounded-full bg-blue-100 blur-3xl" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 px-3 py-1.5 text-xs font-black tracking-wide text-white shadow-md">
                LOOP
              </span>

              <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">
                Feedback Intelligence
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              Feedback Details
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Review customer feedback, sentiment, themes, and workflow status.
            </p>
          </div>

          <span
            className={`inline-flex w-fit rounded-full px-3.5 py-2 text-xs font-bold ${
              feedback.status === "NEW"
                ? "bg-blue-50 text-blue-700"
                : feedback.status === "REVIEWED"
                  ? "bg-amber-50 text-amber-700"
                  : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {feedback.status}
          </span>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_310px]">

        {/* Main Content */}
        <div className="space-y-6">

          {/* Customer Feedback */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-500">
                  Customer Voice
                </p>

                <h2 className="mt-1 text-lg font-bold text-slate-950">
                  Feedback Content
                </h2>
              </div>

              <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold capitalize text-indigo-700">
                {feedback.channel}
              </span>
            </div>

            <div className="mt-5 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/70 via-white to-violet-50/50 p-6">
              <p className="whitespace-pre-wrap text-base leading-8 text-slate-800 sm:text-lg">
                {feedback.content}
              </p>
            </div>
          </section>

          {/* AI Analysis */}
          <section className="overflow-hidden rounded-3xl border border-indigo-100 bg-white shadow-sm">

            {/* AI Header */}
            <div className="relative overflow-hidden border-b border-indigo-100 bg-gradient-to-r from-blue-50 via-indigo-50 to-violet-50 px-6 py-6 sm:px-7">
              <div className="absolute -right-10 -top-16 h-36 w-36 rounded-full bg-violet-200/40 blur-3xl" />

              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-lg text-white shadow-md">
                      ✦
                    </span>

                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-500">
                        AI Analysis
                      </p>

                      <h2 className="mt-1 text-xl font-black text-slate-950">
                        Sentiment & Themes
                      </h2>
                    </div>
                  </div>

                  <p className="mt-4 max-w-xl text-sm leading-6 text-slate-500">
                    Analyze this feedback to understand customer sentiment and
                    identify the main themes discussed.
                  </p>
                </div>

                <span className="w-fit rounded-full border border-indigo-100 bg-white/80 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-indigo-600 shadow-sm">
                  AI Powered
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-7">

              {/* Sentiment Cards */}
              <div className="grid gap-4 sm:grid-cols-2">

                {/* Sentiment */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-indigo-200 hover:shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      Sentiment
                    </p>

                    <span className="text-lg text-indigo-400">
                      {feedback.sentiment === "POS"
                        ? "↗"
                        : feedback.sentiment === "NEG"
                          ? "↘"
                          : feedback.sentiment === "NEU"
                            ? "→"
                            : "—"}
                    </span>
                  </div>

                  <div className="mt-5">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${
                        feedback.sentiment === "POS"
                          ? "bg-emerald-50 text-emerald-700"
                          : feedback.sentiment === "NEG"
                            ? "bg-rose-50 text-rose-700"
                            : feedback.sentiment === "NEU"
                              ? "bg-slate-200 text-slate-700"
                              : "bg-white text-slate-500"
                      }`}
                    >
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          feedback.sentiment === "POS"
                            ? "bg-emerald-500"
                            : feedback.sentiment === "NEG"
                              ? "bg-rose-500"
                              : feedback.sentiment === "NEU"
                                ? "bg-slate-500"
                                : "bg-slate-300"
                        }`}
                      />

                      {feedback.sentiment === "POS"
                        ? "Positive"
                        : feedback.sentiment === "NEG"
                          ? "Negative"
                          : feedback.sentiment === "NEU"
                            ? "Neutral"
                            : "Not analyzed"}
                    </span>
                  </div>

                  <p className="mt-4 text-xs leading-5 text-slate-500">
                    {feedback.sentiment
                      ? "Sentiment has been analyzed for this feedback."
                      : "Run AI analysis to determine the customer sentiment."}
                  </p>
                </div>

                {/* Confidence */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-indigo-200 hover:shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      Confidence Score
                    </p>

                    <span className="text-sm font-bold text-indigo-400">
                      %
                    </span>
                  </div>

                  <p className="mt-4 text-3xl font-black tracking-tight text-slate-950">
                    {feedback.sentimentScore !== null
                      ? `${(feedback.sentimentScore * 100).toFixed(0)}%`
                      : "—"}
                  </p>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-600 transition-all duration-500"
                      style={{
                        width:
                          feedback.sentimentScore !== null
                            ? `${Math.max(
                                0,
                                Math.min(
                                  100,
                                  feedback.sentimentScore * 100
                                )
                              )}%`
                            : "0%",
                      }}
                    />
                  </div>

                  <p className="mt-3 text-xs leading-5 text-slate-500">
                    Confidence returned by the sentiment analysis.
                  </p>
                </div>
              </div>

              {/* Sentiment Action */}
              <div className="mt-6 rounded-2xl border border-indigo-100 bg-gradient-to-r from-blue-50/50 to-violet-50/50 p-1">
                <div className="rounded-xl bg-white p-5">
                  <AnalyzeSentimentButton
                    feedbackId={feedback.id}
                    initialSentiment={feedback.sentiment}
                    initialScore={feedback.sentimentScore}
                    onAnalysisComplete={(sentiment, score) => {
                      setFeedback((currentFeedback) => {
                        if (!currentFeedback) {
                          return currentFeedback;
                        }

                        return {
                          ...currentFeedback,
                          sentiment,
                          sentimentScore: score,
                        };
                      });
                    }}
                  />
                </div>
              </div>

              {/* Themes */}
              <div className="mt-7 border-t border-slate-200 pt-7">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-500">
                      AI Discovery
                    </p>

                    <h3 className="mt-1 text-lg font-black text-slate-950">
                      Extracted Themes
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Discover the main topics present in this feedback.
                    </p>
                  </div>

                  {feedback.themes.length > 0 && (
                    <span className="w-fit rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700">
                      {feedback.themes.length}{" "}
                      {feedback.themes.length === 1 ? "theme" : "themes"}
                    </span>
                  )}
                </div>

                <div className="mt-5">
                  <ExtractThemesButton
                    feedbackId={feedback.id}
                    initialThemes={feedback.themes}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Metadata */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="mb-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-500">
                Record Information
              </p>

              <h2 className="mt-1 text-lg font-black text-slate-950">
                Feedback Metadata
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Source
                </p>

                <p className="mt-2 font-bold capitalize text-slate-900">
                  {feedback.channel}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Customer
                </p>

                <p className="mt-2 font-bold text-slate-900">
                  {feedback.customerLabel || "Not provided"}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Source Reference
                </p>

                <p className="mt-2 break-all font-medium text-slate-900">
                  {feedback.sourceRef || "Not provided"}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Created
                </p>

                <p className="mt-2 font-medium text-slate-900">
                  {new Date(feedback.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">

          {/* Workflow */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                ✓
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-500">
                  Workflow
                </p>

                <h2 className="text-lg font-black text-slate-950">
                  Status
                </h2>
              </div>
            </div>

            {canModify ? (
              <>
                <label
                  htmlFor="status"
                  className="mt-6 block text-xs font-bold uppercase tracking-wide text-slate-500"
                >
                  Update status
                </label>

                <select
                  id="status"
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  disabled={updating}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-700 outline-none transition hover:bg-white focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="NEW">New</option>
                  <option value="REVIEWED">Reviewed</option>
                  <option value="ACTIONED">Actioned</option>
                </select>

                <button
                  type="button"
                  onClick={updateStatus}
                  disabled={updating || status === feedback.status}
                  className="mt-3 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-indigo-100 transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {updating ? "Updating..." : "Update Status"}
                </button>

                <p className="mt-3 text-xs leading-5 text-slate-500">
                  Your role:{" "}
                  <span className="font-bold text-indigo-600">
                    {role}
                  </span>
                </p>
              </>
            ) : (
              <>
                <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${
                      feedback.status === "NEW"
                        ? "bg-blue-50 text-blue-700"
                        : feedback.status === "REVIEWED"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {feedback.status}
                  </span>
                </div>

                <p className="mt-3 text-xs leading-5 text-slate-500">
                  Your VIEWER role has read-only access. You cannot update or
                  delete feedback.
                </p>
              </>
            )}
          </section>

          {/* Danger Zone */}
          {canModify && (
            <section className="rounded-3xl border border-rose-200 bg-white p-6 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-rose-500">
                Danger Zone
              </p>

              <h2 className="mt-1 text-base font-black text-slate-950">
                Delete feedback
              </h2>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Permanently remove this feedback entry. This action cannot be
                undone.
              </p>

              <button
                type="button"
                onClick={deleteFeedback}
                disabled={updating}
                className="mt-4 w-full rounded-xl border border-rose-300 bg-white px-4 py-3 text-sm font-bold text-rose-700 transition hover:bg-rose-50 focus:outline-none focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updating ? "Deleting..." : "Delete Feedback"}
              </button>
            </section>
          )}

          {/* Record */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-500">
              Record
            </p>

            <p className="mt-1 text-base font-black text-slate-950">
              Feedback ID
            </p>

            <p className="mt-3 break-all rounded-xl border border-slate-100 bg-slate-50 p-3 font-mono text-xs leading-5 text-slate-600">
              {feedback.id}
            </p>
          </section>
        </aside>
      </div>

      {/* Messages */}
      {error && (
        <div
          role="alert"
          className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700"
        >
          <span className="font-bold">Error:</span> {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700"
        >
          <span className="font-bold">Success:</span> {success}
        </div>
      )}
    </div>
  </main>
);
}