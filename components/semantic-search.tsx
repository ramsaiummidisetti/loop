"use client";

import { useState } from "react";

type SearchResult = {
  id: string;
  content: string;
  channel: string;
  customerLabel: string | null;
  sentiment: "POS" | "NEU" | "NEG" | null;
  sentimentScore: number | null;
  status: "NEW" | "REVIEWED" | "ACTIONED";
  createdAt: string;
  similarity: number;
};

type SearchResponse = {
  query: string;
  results: SearchResult[];
};

type SemanticSearchProps = {
  onSearchComplete?: () => void;
};

export default function SemanticSearch({
  onSearchComplete,
}: SemanticSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch() {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setError("Enter something to search.");
      setResults([]);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/feedback/search?query=${encodeURIComponent(
          trimmedQuery
        )}&limit=10`
      );

      const data: unknown = await response.json();

      if (!response.ok) {
        throw new Error(
          "Search failed. Please try again."
        );
      }

      if (
        typeof data !== "object" ||
        data === null ||
        !("results" in data) ||
        !Array.isArray(data.results)
      ) {
        throw new Error("Invalid search response.");
      }

      const searchData = data as SearchResponse;

      setResults(searchData.results);
      onSearchComplete?.();
    } catch (searchError) {
      setResults([]);

      setError(
        searchError instanceof Error
          ? searchError.message
          : "Search failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "Enter") {
      void handleSearch();
    }
  }

  function getSimilarityPercentage(
    similarity: number
  ): number {
    return Math.max(
      0,
      Math.min(100, Math.round(similarity * 100))
    );
  }

 return (
  <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
    {/* Header */}
    <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg">
          ⌕
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-slate-950">
              Semantic Search
            </h2>

            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              AI Search
            </span>
          </div>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Search feedback by meaning using stored embeddings.
          </p>
        </div>
      </div>
    </div>

    {/* Search */}
    <div className="p-5 sm:p-6">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
        <label
          htmlFor="semantic-search"
          className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
        >
          Search feedback
        </label>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <input
              id="semantic-search"
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Try: delivery was late"
              maxLength={500}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
            />
          </div>

          <button
            type="button"
            onClick={() => void handleSearch()}
            disabled={loading}
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        <p className="mt-2 text-xs text-slate-400">
          Press Enter to search.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm leading-6 text-red-700"
        >
          <span className="font-semibold">Search failed:</span> {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="mt-5 flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-8">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />

          <p className="text-sm font-medium text-slate-600">
            Searching feedback...
          </p>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="mt-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Search Results
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                {results.length} matching{" "}
                {results.length === 1 ? "entry" : "entries"}
              </p>
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              Semantic match
            </span>
          </div>

          <div className="space-y-3">
            {results.map((result) => {
              const similarity = getSimilarityPercentage(
                result.similarity
              );

              return (
                <article
                  key={result.id}
                  className="group rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">
                        {result.customerLabel || "Unknown customer"}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-600">
                          {result.channel}
                        </span>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            result.status === "NEW"
                              ? "bg-blue-50 text-blue-700"
                              : result.status === "REVIEWED"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {result.status}
                        </span>

                        {result.sentiment && (
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              result.sentiment === "POS"
                                ? "bg-emerald-50 text-emerald-700"
                                : result.sentiment === "NEG"
                                  ? "bg-rose-50 text-rose-700"
                                  : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {result.sentiment === "POS"
                              ? "Positive"
                              : result.sentiment === "NEG"
                                ? "Negative"
                                : "Neutral"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Similarity */}
                    <div className="shrink-0 sm:text-right">
                      <p className="text-lg font-bold text-slate-900">
                        {similarity}%
                      </p>

                      <p className="text-xs font-medium text-slate-400">
                        similarity
                      </p>
                    </div>
                  </div>

                  {/* Similarity bar */}
                  <div className="mt-4">
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-slate-800 transition-all"
                        style={{ width: `${similarity}%` }}
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="mt-4 rounded-xl bg-slate-50 p-4">
                    <p className="text-sm leading-6 text-slate-700">
                      {result.content}
                    </p>
                  </div>

                  {/* Date */}
                  <p className="mt-3 text-xs text-slate-400">
                    {new Date(result.createdAt).toLocaleString()}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading &&
        query.trim() &&
        !error &&
        results.length === 0 && (
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-5 py-10 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg text-slate-400">
              ⌕
            </div>

            <h3 className="mt-3 text-sm font-semibold text-slate-900">
              No matching feedback
            </h3>

            <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500">
              No feedback with stored embeddings was found for this search.
              Try a different phrase or generate missing embeddings first.
            </p>
          </div>
        )}
    </div>
  </section>
);
}