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
  <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
    <div className="mx-auto max-w-5xl">

      {/* Top navigation */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/dashboard/feedback"
          className="inline-flex items-center rounded-lg px-2 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-900"
        >
          ← Back to Feedback
        </Link>

        <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:inline-flex">
          Feedback Details
        </span>
      </div>

      {/* Header */}
      <header className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-slate-900 px-2.5 py-1 text-xs font-bold tracking-wide text-white">
                LOOP
              </span>

              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Feedback Intelligence
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
              Feedback Details
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Review customer feedback, sentiment, themes, and workflow status.
            </p>
          </div>

          <span
            className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${
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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">

        {/* Main content */}
        <div className="space-y-6">

          {/* Feedback */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Customer Feedback
                </p>

                <h2 className="mt-1 text-base font-semibold text-slate-950">
                  Feedback content
                </h2>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-600">
                {feedback.channel}
              </span>
            </div>

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-5">
              <p className="whitespace-pre-wrap text-base leading-7 text-slate-900 sm:text-lg">
                {feedback.content}
              </p>
            </div>
          </section>

          {/* AI Analysis */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                AI Analysis
              </p>

              <h2 className="mt-1 text-lg font-semibold text-slate-950">
                Sentiment & Themes
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Analyze this feedback and extract useful themes.
              </p>
            </div>

            {/* Sentiment summary */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Sentiment
                </p>

                <div className="mt-3 flex items-center gap-3">
                  <span
                    className={`inline-flex rounded-full px-3 py-1.5 text-sm font-semibold ${
                      feedback.sentiment === "POS"
                        ? "bg-emerald-50 text-emerald-700"
                        : feedback.sentiment === "NEG"
                          ? "bg-rose-50 text-rose-700"
                          : feedback.sentiment === "NEU"
                            ? "bg-slate-200 text-slate-700"
                            : "bg-white text-slate-500"
                    }`}
                  >
                    {feedback.sentiment === "POS"
                      ? "Positive"
                      : feedback.sentiment === "NEG"
                        ? "Negative"
                        : feedback.sentiment === "NEU"
                          ? "Neutral"
                          : "Not analyzed"}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Confidence Score
                </p>

                <p className="mt-3 text-2xl font-bold text-slate-950">
                  {feedback.sentimentScore !== null
                    ? `${(feedback.sentimentScore * 100).toFixed(0)}%`
                    : "—"}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <AnalyzeSentimentButton
                feedbackId={feedback.id}
                initialSentiment={feedback.sentiment}
                initialScore={feedback.sentimentScore}
              />
            </div>

            {/* Themes */}
            <div className="mt-7 border-t border-slate-200 pt-6">
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Themes
                </p>

                <h3 className="mt-1 text-base font-semibold text-slate-950">
                  Extracted themes
                </h3>
              </div>

              <ExtractThemesButton
                feedbackId={feedback.id}
                initialThemes={feedback.themes}
              />
            </div>
          </section>

          {/* Feedback information */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Metadata
              </p>

              <h2 className="mt-1 text-lg font-semibold text-slate-950">
                Feedback Information
              </h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Source
                </p>

                <p className="mt-2 font-semibold capitalize text-slate-900">
                  {feedback.channel}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Customer
                </p>

                <p className="mt-2 font-semibold text-slate-900">
                  {feedback.customerLabel || "Not provided"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Source Reference
                </p>

                <p className="mt-2 break-all font-medium text-slate-900">
                  {feedback.sourceRef || "Not provided"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Created
                </p>

                <p className="mt-2 font-medium text-slate-900">
                  {new Date(feedback.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Right sidebar */}
        <aside className="space-y-6">

          {/* Workflow */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Workflow
              </p>

              <h2 className="mt-1 text-lg font-semibold text-slate-950">
                Status
              </h2>
            </div>

            {canModify ? (
              <>
                <label
                  htmlFor="status"
                  className="mt-5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Update status
                </label>

                <select
                  id="status"
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  disabled={updating}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-700 outline-none transition hover:border-slate-400 focus:border-slate-500 focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="NEW">New</option>
                  <option value="REVIEWED">Reviewed</option>
                  <option value="ACTIONED">Actioned</option>
                </select>

                <button
                  type="button"
                  onClick={updateStatus}
                  disabled={updating || status === feedback.status}
                  className="mt-3 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {updating ? "Updating..." : "Update Status"}
                </button>

                <p className="mt-3 text-xs leading-5 text-slate-500">
                  Your role:{" "}
                  <span className="font-semibold text-slate-700">
                    {role}
                  </span>
                </p>
              </>
            ) : (
              <>
                <div className="mt-5 rounded-xl bg-slate-50 p-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
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

          {/* Danger zone */}
          {canModify && (
            <section className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-red-500">
                Danger Zone
              </p>

              <h2 className="mt-1 text-base font-semibold text-slate-950">
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
                className="mt-4 w-full rounded-xl border border-red-300 bg-white px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updating ? "Deleting..." : "Delete Feedback"}
              </button>
            </section>
          )}

          {/* Feedback ID */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Record
            </p>

            <p className="mt-1 text-base font-semibold text-slate-950">
              Feedback ID
            </p>

            <p className="mt-3 break-all rounded-lg bg-slate-50 p-3 font-mono text-xs leading-5 text-slate-600">
              {feedback.id}
            </p>
          </section>
        </aside>
      </div>

      {/* Messages */}
      {error && (
        <div
          role="alert"
          className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"
        >
          <span className="font-semibold">Error:</span> {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700"
        >
          <span className="font-semibold">Success:</span> {success}
        </div>
      )}
    </div>
  </main>
);
}