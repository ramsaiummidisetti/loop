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
      <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-6">
        <div className="mx-auto max-w-7xl">

        {/* Header */}
    <header className="mb-7 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="relative">
        <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-indigo-100 blur-3xl" />
        <div className="absolute -bottom-20 right-32 h-40 w-40 rounded-full bg-blue-100 blur-3xl" />

        <div className="relative flex flex-col gap-5 p-5 sm:p-6">
          
          {/* Top Navigation */}
          <div className="flex items-center justify-between gap-4">
            
            {/* LOOP Logo */}
            <Link
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
            </Link>

            {/* Navigation */}
            <nav className="hidden items-center gap-1 lg:flex">
              <Link
                href="/dashboard"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-blue-50 hover:text-blue-600"
              >
                Dashboard
              </Link>

              <Link
                href="/dashboard/feedback"
                className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-600"
              >
                Feedback
              </Link>

              <Link
                href="/dashboard/feedback#semantic-search"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-violet-50 hover:text-violet-600"
              >
                Search
              </Link>

              <Link
                href="/dashboard#insights"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600"
              >
                Insights
              </Link>
            </nav>

            {/* Add Feedback */}
            <Link
              href="/feedback/new"
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
            >
              + Add Feedback
            </Link>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex gap-1 overflow-x-auto border-t border-slate-100 pt-4 lg:hidden">
            <Link
              href="/dashboard"
              className="whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-blue-600"
            >
              Dashboard
            </Link>

            <Link
              href="/dashboard/feedback"
              className="whitespace-nowrap rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-600"
            >
              Feedback
            </Link>

            <Link
              href="/dashboard/feedback#semantic-search"
              className="whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-violet-50 hover:text-violet-600"
            >
              Search
            </Link>

            <Link
              href="/dashboard#insights"
              className="whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600"
            >
              Insights
            </Link>
          </nav>

          {/* Page Title */}
          <div className="pt-1">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 px-3 py-1.5 text-xs font-black tracking-wide text-white shadow-md">
                LOOP
              </span>

              <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">
                Feedback Intelligence
              </span>
            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              Feedback Inbox
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Search, review, analyze, and manage customer feedback from your
              workspace.
            </p>
          </div>
        </div>
      </div>
    </header>

      {/* AI Tools */}
      <div
          id="semantic-search"
          className="mb-7 space-y-4 scroll-mt-24"
        >
          <FeedbackImport onImportComplete={() => loadFeedback(1)} />

          <BulkEmbedding />

          <SemanticSearch />
        </div>

      {/* Search & Filters */}
      <section className="mb-7 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 text-lg">
            🔎
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-950">
              Search & Filters
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Narrow down feedback by content, source, workflow status, or
              sentiment.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSearch}
          className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto_auto]"
        >
          {/* Search */}
          <div>
            <label
              htmlFor="search"
              className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500"
            >
              Search feedback
            </label>

            <input
              id="search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search feedback, customer, reference..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:bg-white focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
            />
          </div>

          {/* Source */}
          <div>
            <label
              htmlFor="channel"
              className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500"
            >
              Source
            </label>

            <select
              id="channel"
              value={channel}
              onChange={(event) => setChannel(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-700 outline-none transition hover:border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
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
              className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500"
            >
              Status
            </label>

            <select
              id="status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-700 outline-none transition hover:border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
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
              className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500"
            >
              Sentiment
            </label>

            <select
              id="sentiment"
              value={sentiment}
              onChange={(event) => setSentiment(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-700 outline-none transition hover:border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            >
              <option value="">All sentiments</option>
              <option value="POS">Positive</option>
              <option value="NEU">Neutral</option>
              <option value="NEG">Negative</option>
            </select>
          </div>

          {/* Search */}
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-indigo-100 transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 lg:w-auto"
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
          className="mb-7 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700"
        >
          <span className="font-bold">Error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Feedback List */}
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

        {/* List Header */}
        <div className="flex flex-col gap-3 border-b border-slate-200 bg-gradient-to-r from-white to-slate-50 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                💬
              </div>

              <h2 className="text-base font-bold text-slate-950">
                Customer Feedback
              </h2>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              {pagination.total}{" "}
              {pagination.total === 1
                ? "feedback entry"
                : "feedback entries"}
            </p>
          </div>

          {!loading && pagination.total > 0 && (
            <span className="inline-flex w-fit items-center rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700">
              Page {pagination.page} of {pagination.totalPages}
            </span>
          )}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-2 border-indigo-100 border-t-indigo-600" />

            <p className="text-sm font-semibold text-slate-700">
              Loading feedback
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Please wait while your feedback is loaded.
            </p>
          </div>
        ) : feedback.length === 0 ? (
          /* Empty State */
          <div className="px-5 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-violet-50 text-xl">
              💬
            </div>

            <h3 className="mt-4 text-base font-bold text-slate-900">
              No feedback found
            </h3>

            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
              There are no feedback entries matching your current search or
              filters.
            </p>

            <Link
              href="/feedback/new"
              className="mt-5 inline-flex items-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              + Add Feedback
            </Link>
          </div>
        ) : (
          /* Feedback Items */
          <div className="divide-y divide-slate-100">
            {feedback.map((item) => (
              <article
                key={item.id}
                className="group p-5 transition hover:bg-gradient-to-r hover:from-blue-50/40 hover:to-violet-50/30 sm:p-6"
              >
                <Link
                  href={`/dashboard/feedback/${item.id}`}
                  className="block rounded-xl outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                    <div className="min-w-0 flex-1">
                      {/* Content */}
                      <p className="text-base font-semibold leading-7 text-slate-900">
                        {item.content}
                      </p>

                      {/* Badges */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold capitalize text-slate-700">
                          {item.channel}
                        </span>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-bold ${
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
                            className={`rounded-full px-2.5 py-1 text-xs font-bold ${
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
                          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-600">
                            Score {(item.sentimentScore * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>

                      {/* Metadata */}
                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                        {item.customerLabel && (
                          <span>
                            <span className="font-semibold text-slate-600">
                              Customer:
                            </span>{" "}
                            {item.customerLabel}
                          </span>
                        )}

                        {item.sourceRef && (
                          <span>
                            <span className="font-semibold text-slate-600">
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

                    {/* View */}
                    <div className="flex shrink-0 items-center text-sm font-bold text-slate-400 transition group-hover:text-indigo-600">
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
          <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              disabled={pagination.page <= 1 || loading}
              onClick={() => loadFeedback(pagination.page - 1)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Previous
            </button>

            <p className="text-center text-sm text-slate-500">
              Page{" "}
              <span className="font-bold text-slate-900">
                {pagination.page}
              </span>{" "}
              of{" "}
              <span className="font-bold text-slate-900">
                {pagination.totalPages}
              </span>
            </p>

            <button
              type="button"
              disabled={
                pagination.page >= pagination.totalPages || loading
              }
              onClick={() => loadFeedback(pagination.page + 1)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-40"
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