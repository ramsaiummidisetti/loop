"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import FeedbackImport from "@/components/feedback-import";
import SemanticSearch from "@/components/semantic-search";
import BulkEmbedding from "@/components/bulk-embedding";

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
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export default function FeedbackListPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [search, setSearch] = useState("");
  const [channel, setChannel] = useState("");
  const [status, setStatus] = useState("");
  const [sentiment, setSentiment] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadFeedback(page = 1) {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (channel) {
        params.set("channel", channel);
      }

      if (status) {
        params.set("status", status);
      }

      if (sentiment) {
        params.set("sentiment", sentiment);
      }

      params.set("page", String(page));
      params.set("limit", "10");

      const response = await fetch(`/api/feedback?${params.toString()}`);

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to load feedback");
        return;
      }

      setFeedback(data.feedback);
      setPagination(data.pagination);
    } catch {
      setError("Something went wrong while loading feedback.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFeedback(1);
  }, [channel, status, sentiment]);

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    loadFeedback(1);
  }

  return (
  <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
    <div className="mx-auto max-w-7xl">

      {/* Page Header */}
      <header className="mb-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-md bg-slate-900 px-2.5 py-1 text-xs font-bold tracking-wide text-white">
                LOOP
              </span>

              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Feedback Intelligence
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-950">
              Feedback
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Search, review, analyze, and manage customer feedback from your
              workspace.
            </p>
          </div>

          <Link
            href="/feedback/new"
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
          >
            + Add Feedback
          </Link>
        </div>
      </header>

      {/* Feedback Tools */}
      <div className="mb-7 space-y-4">
        <FeedbackImport onImportComplete={() => loadFeedback(1)} />

        <BulkEmbedding />

        <SemanticSearch />
      </div>

      {/* Search & Filters */}
      <section className="mb-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-slate-950">
            Search & Filters
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Narrow down feedback by content, source, workflow status, or sentiment.
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto_auto]"
        >
          {/* Search */}
          <div>
            <label
              htmlFor="search"
              className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Search feedback
            </label>

            <input
              id="search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search feedback, customer, reference..."
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:bg-white focus:border-slate-500 focus:bg-white focus:ring-4 focus:ring-slate-100"
            />
          </div>

          {/* Source */}
          <div>
            <label
              htmlFor="channel"
              className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Source
            </label>

            <select
              id="channel"
              value={channel}
              onChange={(event) => setChannel(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-700 outline-none transition hover:border-slate-400 focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
            >
              <option value="">All sources</option>
              <option value="web">Web</option>
              <option value="email">Email</option>
              <option value="support">Support</option>
              <option value="survey">Survey</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label
              htmlFor="status"
              className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Status
            </label>

            <select
              id="status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-700 outline-none transition hover:border-slate-400 focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
            >
              <option value="">All statuses</option>
              <option value="NEW">New</option>
              <option value="REVIEWED">Reviewed</option>
              <option value="ACTIONED">Actioned</option>
            </select>
          </div>

          {/* Sentiment */}
          <div>
            <label
              htmlFor="sentiment"
              className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Sentiment
            </label>

            <select
              id="sentiment"
              value={sentiment}
              onChange={(event) => setSentiment(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-700 outline-none transition hover:border-slate-400 focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
            >
              <option value="">All sentiments</option>
              <option value="POS">Positive</option>
              <option value="NEU">Neutral</option>
              <option value="NEG">Negative</option>
            </select>
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 lg:w-auto"
            >
              Search
            </button>
          </div>
        </form>
      </section>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="mb-7 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"
        >
          <span className="font-semibold">Error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Feedback List */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* List Header */}
        <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-950">
              Feedback Inbox
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {pagination.total}{" "}
              {pagination.total === 1 ? "feedback entry" : "feedback entries"}
            </p>
          </div>

          {!loading && pagination.total > 0 && (
            <span className="inline-flex w-fit items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              Page {pagination.page} of {pagination.totalPages}
            </span>
          )}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />

            <p className="text-sm font-medium text-slate-700">
              Loading feedback
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Please wait while your feedback is loaded.
            </p>
          </div>
        ) : feedback.length === 0 ? (
          /* Empty State */
          <div className="px-5 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-lg">
              —
            </div>

            <h3 className="mt-4 text-base font-semibold text-slate-900">
              No feedback found
            </h3>

            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
              There are no feedback entries matching your current search or
              filters.
            </p>

            <Link
              href="/feedback/new"
              className="mt-5 inline-flex items-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              + Add Feedback
            </Link>
          </div>
        ) : (
          /* Feedback Items */
          <div className="divide-y divide-slate-200">
            {feedback.map((item) => (
              <article
                key={item.id}
                className="group p-5 transition hover:bg-slate-50 sm:p-6"
              >
                <Link
                  href={`/dashboard/feedback/${item.id}`}
                  className="block rounded-lg outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                    <div className="min-w-0 flex-1">

                      {/* Content */}
                      <p className="text-base font-medium leading-7 text-slate-900 transition group-hover:text-slate-950">
                        {item.content}
                      </p>

                      {/* Badges */}
                      <div className="mt-4 flex flex-wrap gap-2">

                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-700">
                          {item.channel}
                        </span>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            item.status === "NEW"
                              ? "bg-blue-50 text-blue-700"
                              : item.status === "REVIEWED"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {item.status}
                        </span>

                        {item.sentiment && (
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              item.sentiment === "POS"
                                ? "bg-emerald-50 text-emerald-700"
                                : item.sentiment === "NEG"
                                  ? "bg-rose-50 text-rose-700"
                                  : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {item.sentiment === "POS"
                              ? "Positive"
                              : item.sentiment === "NEG"
                                ? "Negative"
                                : "Neutral"}
                          </span>
                        )}

                        {item.sentimentScore !== null && (
                          <span className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-500">
                            Score {(item.sentimentScore * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>

                      {/* Metadata */}
                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                        {item.customerLabel && (
                          <span>
                            <span className="font-medium text-slate-600">
                              Customer:
                            </span>{" "}
                            {item.customerLabel}
                          </span>
                        )}

                        {item.sourceRef && (
                          <span>
                            <span className="font-medium text-slate-600">
                              Reference:
                            </span>{" "}
                            {item.sourceRef}
                          </span>
                        )}

                        <span>
                          {new Date(item.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* View Action */}
                    <div className="flex shrink-0 items-center text-sm font-semibold text-slate-400 transition group-hover:text-slate-900">
                      View details
                      <span className="ml-2 transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              disabled={pagination.page <= 1 || loading}
              onClick={() => loadFeedback(pagination.page - 1)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Previous
            </button>

            <p className="text-center text-sm text-slate-500">
              Page{" "}
              <span className="font-semibold text-slate-900">
                {pagination.page}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-900">
                {pagination.totalPages}
              </span>
            </p>

            <button
              type="button"
              disabled={
                pagination.page >= pagination.totalPages || loading
              }
              onClick={() => loadFeedback(pagination.page + 1)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        )}
      </section>
    </div>
  </main>
);
}