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
    <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Embeddings
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Generate embeddings for feedback that has not been
          indexed yet.
        </p>
      </div>

      <button
        type="button"
        onClick={() => void handleGenerate()}
        disabled={loading}
        className="mt-4 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? "Generating..."
          : "Generate Missing Embeddings"}
      </button>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-900">
            Embedding generation completed
          </p>

          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-xs text-slate-500">
                Generated
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {result.generated}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Failed
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {result.failed}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Remaining
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {result.remaining}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}