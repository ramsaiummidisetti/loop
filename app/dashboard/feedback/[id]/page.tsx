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
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/dashboard/feedback"
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Back to Feedback
        </Link>

        <div className="mb-8 mt-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            LOOP
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Feedback Details
          </h1>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {/* Feedback content */}
          <div>
            <p className="text-sm font-medium text-slate-500">
              Feedback
            </p>

            <p className="mt-2 whitespace-pre-wrap text-lg leading-8 text-slate-900">
              {feedback.content}
            </p>
          </div>

          {/* Feedback information */}
          <div className="mt-8 grid gap-6 border-t border-slate-200 pt-6 sm:grid-cols-2">
            <div>
              <p className="text-sm text-slate-500">Source</p>

              <p className="mt-1 font-medium text-slate-900">
                {feedback.channel}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Customer</p>

              <p className="mt-1 font-medium text-slate-900">
                {feedback.customerLabel || "Not provided"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Source Reference
              </p>

              <p className="mt-1 font-medium text-slate-900">
                {feedback.sourceRef || "Not provided"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Created</p>

              <p className="mt-1 font-medium text-slate-900">
                {new Date(feedback.createdAt).toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Sentiment</p>

              <p className="mt-1 font-medium text-slate-900">
                {feedback.sentiment || "Not analyzed"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Sentiment Score
              </p>

              <p className="mt-1 font-medium text-slate-900">
                {feedback.sentimentScore ?? "Not analyzed"}
              </p>
            </div>
            <div className="mt-2 sm:col-span-2">
              <AnalyzeSentimentButton
                feedbackId={feedback.id}
                initialSentiment={feedback.sentiment}
                initialScore={feedback.sentimentScore}
              />
              <div className="mt-8 border-t border-slate-200 pt-6">
  <p className="text-sm font-medium text-slate-500">
    Themes
  </p>

  <div className="mt-3">
    <ExtractThemesButton
      feedbackId={feedback.id}
      initialThemes={feedback.themes}
    />
  </div>
</div>
            </div>
          </div>

          {/* Role-aware actions */}
          {canModify ? (
            <div className="mt-8 border-t border-slate-200 pt-6">
              <label
                htmlFor="status"
                className="block text-sm font-medium text-slate-700"
              >
                Status
              </label>

              <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                <select
                  id="status"
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  disabled={updating}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="NEW">New</option>
                  <option value="REVIEWED">Reviewed</option>
                  <option value="ACTIONED">Actioned</option>
                </select>

                <button
                  type="button"
                  onClick={updateStatus}
                  disabled={updating || status === feedback.status}
                  className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {updating ? "Updating..." : "Update Status"}
                </button>
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Your role: {role}. You can update feedback status.
              </p>

              {/* Delete */}
              <div className="mt-6 border-t border-slate-200 pt-6">
                <button
                  type="button"
                  onClick={deleteFeedback}
                  disabled={updating}
                  className="rounded-lg border border-red-300 bg-white px-5 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {updating ? "Deleting..." : "Delete Feedback"}
                </button>

                <p className="mt-2 text-xs text-slate-500">
                  Deleting feedback cannot be undone.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-8 border-t border-slate-200 pt-6">
              <p className="text-sm font-medium text-slate-700">
                Status
              </p>

              <p className="mt-2 font-medium text-slate-900">
                {feedback.status}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Your VIEWER role has read-only access. You cannot update
                or delete feedback.
              </p>
            </div>
          )}

          {/* Messages */}
          {error && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}

          {/* ID */}
          <div className="mt-8 border-t border-slate-200 pt-6">
            <p className="text-xs text-slate-500">
              Feedback ID
            </p>

            <p className="mt-1 break-all font-mono text-xs text-slate-600">
              {feedback.id}
            </p>
          </div>
        </section>
      </div>
      
    </main>
  );
}