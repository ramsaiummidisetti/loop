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
    <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Semantic Search
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Search feedback by meaning using stored embeddings.
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Try: delivery was late"
          maxLength={500}
          className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />

        <button
          type="button"
          onClick={() => void handleSearch()}
          disabled={loading}
          className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {results.length > 0 && (
        <div className="mt-5 space-y-3">
          <p className="text-sm font-medium text-slate-700">
            Search Results
          </p>

          {results.map((result) => {
            const similarity = getSimilarityPercentage(
              result.similarity
            );

            return (
              <div
                key={result.id}
                className="rounded-lg border border-slate-200 p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-medium text-slate-900">
                      {result.customerLabel ||
                        "Unknown customer"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {result.channel} • {result.status}
                    </p>
                  </div>

                  <span className="text-sm font-semibold text-slate-700">
                    {similarity}% similar
                  </span>
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-700">
                  {result.content}
                </p>

                {result.sentiment && (
                  <p className="mt-2 text-xs text-slate-500">
                    Sentiment: {result.sentiment}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!loading &&
        query.trim() &&
        !error &&
        results.length === 0 && (
          <p className="mt-4 text-sm text-slate-500">
            No feedback with stored embeddings was found.
          </p>
        )}
    </section>
  );
}