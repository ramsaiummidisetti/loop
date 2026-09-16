"use client";

import { useState } from "react";

type BulkEmbeddingResponse = {
  message: string;
  generated: number;
  failed: number;
  remaining: number;
};

export default function BulkEmbedding() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] =
    useState<BulkEmbeddingResponse | null>(null);
  const [error, setError] = useState("");

  async function handleGenerate() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/feedback/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          limit: 100,
        }),
      });

      const data: unknown = await response.json();

      if (!response.ok) {
        throw new Error(
          "Failed to generate missing embeddings."
        );
      }

      if (
        typeof data !== "object" ||
        data === null ||
        !("generated" in data) ||
        !("failed" in data) ||
        !("remaining" in data)
      ) {
        throw new Error("Invalid embedding response.");
      }

      const embeddingData =
        data as BulkEmbeddingResponse;

      setResult(embeddingData);
    } catch (generationError) {
      setError(
        generationError instanceof Error
          ? generationError.message
          : "Failed to generate embeddings."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
  <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
    {/* Header */}
    <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg">
          ✦
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-slate-950">
              Embeddings
            </h2>

            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Semantic Search
            </span>
          </div>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Generate embeddings for feedback that has not been indexed yet.
          </p>
        </div>
      </div>
    </div>

    {/* Body */}
    <div className="p-5 sm:p-6">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800">
              Index missing feedback
            </p>

            <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500">
              Generate searchable vector representations for feedback that
              has not been indexed.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void handleGenerate()}
            disabled={loading}
            className="shrink-0 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate Missing Embeddings"}
          </button>
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />

            <p className="text-xs font-medium text-slate-600">
              Generating embeddings. Please wait...
            </p>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm leading-6 text-red-700"
        >
          <span className="font-semibold">Embedding generation failed:</span>{" "}
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-950">
                Embedding generation completed
              </p>

              <p className="mt-1 text-xs text-slate-500">
                The indexing operation has finished.
              </p>
            </div>

            <span
              className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${
                result.failed > 0
                  ? "bg-amber-50 text-amber-700"
                  : "bg-emerald-50 text-emerald-700"
              }`}
            >
              {result.failed > 0 ? "Completed with issues" : "Complete"}
            </span>
          </div>

          {/* Statistics */}
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-emerald-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                Generated
              </p>

              <p className="mt-1 text-2xl font-bold text-emerald-800">
                {result.generated}
              </p>
            </div>

            <div className="rounded-xl bg-rose-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">
                Failed
              </p>

              <p className="mt-1 text-2xl font-bold text-rose-800">
                {result.failed}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Remaining
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {result.remaining}
              </p>
            </div>
          </div>

          {/* Completion message */}
          <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3">
            <p className="text-xs leading-5 text-slate-600">
              {result.remaining === 0
                ? "All available feedback is now indexed for semantic search."
                : `${result.remaining} feedback entries still need embeddings.`}
            </p>
          </div>
        </div>
      )}
    </div>
  </section>
);
}