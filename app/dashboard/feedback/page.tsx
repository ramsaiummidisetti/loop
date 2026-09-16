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
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              LOOP
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Feedback
            </h1>

            <p className="mt-2 text-slate-600">
              Search and review customer feedback from your workspace.
            </p>
          </div>

          <Link
            href="/feedback/new"
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            + Add Feedback
          </Link>
        </header>
        <FeedbackImport onImportComplete={() => loadFeedback(1)} />
        <BulkEmbedding />
        <SemanticSearch />
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <form
            onSubmit={handleSearch}
            className="grid gap-4 lg:grid-cols-[1fr_auto_auto_auto_auto]"
          >
            <div>
              <label
                htmlFor="search"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Search
              </label>

              <input
                id="search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search feedback, customer, reference..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label
                htmlFor="channel"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Source
              </label>

              <select
                id="channel"
                value={channel}
                onChange={(event) => setChannel(event.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              >
                <option value="">All sources</option>
                <option value="web">Web</option>
                <option value="email">Email</option>
                <option value="support">Support</option>
                <option value="survey">Survey</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="status"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Status
              </label>

              <select
                id="status"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              >
                <option value="">All statuses</option>
                <option value="NEW">New</option>
                <option value="REVIEWED">Reviewed</option>
                <option value="ACTIONED">Actioned</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="sentiment"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Sentiment
              </label>

              <select
                id="sentiment"
                value={sentiment}
                onChange={(event) => setSentiment(event.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              >
                <option value="">All sentiments</option>
                <option value="POS">Positive</option>
                <option value="NEU">Neutral</option>
                <option value="NEG">Negative</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 lg:w-auto"
              >
                Search
              </button>
            </div>
          </form>
        </section>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <p className="text-sm text-slate-500">
              {pagination.total} feedback{" "}
              {pagination.total === 1 ? "entry" : "entries"}
            </p>
          </div>

          {loading ? (
            <div className="px-5 py-12 text-center text-sm text-slate-500">
              Loading feedback...
            </div>
          ) : feedback.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="font-medium text-slate-900">
                No feedback found
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Try changing your search or filters.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {feedback.map((item) => (
                <article
                  key={item.id}
                  className="p-5 transition hover:bg-slate-50" >
                <Link
                href={`/dashboard/feedback/${item.id}`}
                className="block"
                >
                     <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-base leading-7 text-slate-900">
                        {item.content}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
                          {item.channel}
                        </span>

                        <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
                          {item.status}
                        </span>

                        {item.sentiment && (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
                            {item.sentiment}
                          </span>
                        )}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
                        {item.customerLabel && (
                          <span>Customer: {item.customerLabel}</span>
                        )}

                        {item.sourceRef && (
                          <span>Reference: {item.sourceRef}</span>
                        )}

                        <span>
                          {new Date(item.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
                 
                </article>
              ))}
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
              <button
                type="button"
                disabled={pagination.page <= 1 || loading}
                onClick={() => loadFeedback(pagination.page - 1)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <p className="text-sm text-slate-500">
                Page {pagination.page} of {pagination.totalPages}
              </p>

              <button
                type="button"
                disabled={
                  pagination.page >= pagination.totalPages || loading
                }
                onClick={() => loadFeedback(pagination.page + 1)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}