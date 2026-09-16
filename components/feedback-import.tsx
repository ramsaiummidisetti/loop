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
  <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
    {/* Header */}
    <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg">
          ↑
        </div>

        <div>
          <h2 className="text-base font-semibold text-slate-950">
            Import Feedback
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Upload CSV or Excel data to add multiple feedback entries to your
            workspace.
          </p>
        </div>
      </div>
    </div>

    {/* Upload area */}
    <div className="p-5 sm:p-6">
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800">
              Choose an import file
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Supported formats: CSV and Excel (.xlsx)
            </p>
          </div>

          <button
            type="button"
            onClick={handleImport}
            disabled={!file || loading}
            className="shrink-0 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Importing..." : "Import File"}
          </button>
        </div>

        <div className="mt-4">
          <input
            type="file"
            accept=".csv,.xlsx"
            onChange={(event) => {
              setFile(event.target.files?.[0] ?? null);
              setResult(null);
              setError("");
            }}
            disabled={loading}
            className="block w-full rounded-xl border border-slate-300 bg-white text-sm text-slate-700 outline-none transition file:mr-4 file:border-0 file:border-r file:border-slate-200 file:bg-slate-100 file:px-4 file:py-3 file:text-sm file:font-semibold file:text-slate-700 hover:border-slate-400 focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        {file && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Selected file
              </p>

              <p className="mt-1 truncate text-sm font-medium text-slate-800">
                {file.name}
              </p>
            </div>

            <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              Ready
            </span>
          </div>
        )}
      </div>

      {/* Format guidance */}
      <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Expected columns
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-600">
          <span className="font-medium">content</span>,{" "}
          <span className="font-medium">channel</span>,{" "}
          <span className="font-medium">customer_label</span>, and{" "}
          <span className="font-medium">created_at</span>
        </p>
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm leading-6 text-red-700"
        >
          <span className="font-semibold">Import failed:</span> {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-950">
                Import completed
              </p>

              <p className="mt-1 text-xs text-slate-500">
                The file has been processed.
              </p>
            </div>

            <span className="inline-flex w-fit rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              Complete
            </span>
          </div>

          {/* Import stats */}
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-emerald-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                Imported
              </p>

              <p className="mt-1 text-2xl font-bold text-emerald-800">
                {result.imported ?? 0}
              </p>
            </div>

            <div className="rounded-xl bg-rose-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">
                Failed
              </p>

              <p className="mt-1 text-2xl font-bold text-rose-800">
                {result.failed ?? 0}
              </p>
            </div>
          </div>

          {/* Failed rows */}
          {result.failures && result.failures.length > 0 && (
            <div className="mt-5 border-t border-slate-200 pt-5">
              <p className="text-sm font-semibold text-slate-800">
                Failed rows
              </p>

              <div className="mt-3 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50">
                <ul className="divide-y divide-slate-200">
                  {result.failures.map((failure) => (
                    <li
                      key={failure.row}
                      className="px-4 py-3 text-xs leading-5 text-slate-600"
                    >
                      <span className="font-semibold text-slate-800">
                        Row {failure.row}:
                      </span>{" "}
                      {failure.errors.join(", ")}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  </section>
);
}