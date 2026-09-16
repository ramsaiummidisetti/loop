"use client";

import { useState } from "react";

type ImportFailure = {
  row: number;
  errors: string[];
};

type ImportResponse = {
  message?: string;
  imported?: number;
  failed?: number;
  failures?: ImportFailure[];
  error?: string;
};

type FeedbackImportProps = {
  onImportComplete?: () => void;
};

export default function FeedbackImport({
  onImportComplete,
}: FeedbackImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResponse | null>(null);
  const [error, setError] = useState("");

  async function handleImport() {
    if (!file) {
      setError("Please select a CSV file.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/feedback/import", {
        method: "POST",
        body: formData,
      });

      const data: ImportResponse = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to import file.");
        return;
      }

      setResult(data);
      setFile(null);

      onImportComplete?.();
    } catch {
      setError("Something went wrong while importing the CSV.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Import Feedback
        </h2>

        <p className="mt-1 text-sm text-slate-500">
        Upload a CSV or Excel file with content, channel, customer_label, and created_at columns.
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="file"
          accept=".csv,.xlsx"
          onChange={(event) => {
            setFile(event.target.files?.[0] ?? null);
            setResult(null);
            setError("");
          }}
          disabled={loading}
          className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium"
        />

        <button
          type="button"
          onClick={handleImport}
          disabled={!file || loading}
          className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Importing..." : "Import File"}
        </button>
      </div>

      {file && (
        <p className="mt-2 text-xs text-slate-500">
          Selected: {file.name}
        </p>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-900">
            CSV import completed
          </p>

          <div className="mt-2 flex flex-wrap gap-4 text-sm">
            <span className="text-green-700">
              Imported: {result.imported ?? 0}
            </span>

            <span className="text-red-700">
              Failed: {result.failed ?? 0}
            </span>
          </div>

          {result.failures && result.failures.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-slate-700">
                Failed rows
              </p>

              <ul className="mt-2 space-y-1 text-xs text-slate-600">
                {result.failures.map((failure) => (
                  <li key={failure.row}>
                    Row {failure.row}: {failure.errors.join(", ")}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}