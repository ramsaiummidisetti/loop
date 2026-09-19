"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewFeedbackPage() {
  const router = useRouter();

  const [content, setContent] = useState("");
  const [channel, setChannel] = useState("");
  const [sourceRef, setSourceRef] = useState("");
  const [customerLabel, setCustomerLabel] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          channel,
          sourceRef,
          customerLabel,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to create feedback");
        return;
      }

      setSuccess("Feedback submitted successfully.");

      setContent("");
      setChannel("");
      setSourceRef("");
      setCustomerLabel("");

      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 800);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
  <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-6">
    <div className="mx-auto max-w-4xl">

      {/* Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-indigo-600 hover:shadow-sm"
        >
          ← Dashboard
        </button>

        <span className="hidden rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-indigo-600 sm:inline-flex">
          Feedback Intake
        </span>
      </div>

      {/* Header */}
      <header className="relative mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-indigo-100 blur-3xl" />
        <div className="absolute -bottom-20 right-40 h-40 w-40 rounded-full bg-blue-100 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 px-3 py-1.5 text-xs font-black tracking-wide text-white shadow-md">
              LOOP
            </span>

            <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">
              Feedback Intelligence
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
            Add Feedback
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Capture customer feedback and add it to your workspace for review,
            analysis, and follow-up.
          </p>
        </div>
      </header>

      {/* Form */}
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

        {/* Form Header */}
        <div className="border-b border-slate-200 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-violet-50/70 px-6 py-6 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-lg text-white shadow-md">
              +
            </div>

            <div>
              <h2 className="text-lg font-black text-slate-950">
                Feedback Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Provide the feedback details below.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-7 p-6 sm:p-8">

          {/* Feedback Content */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="content"
                className="text-sm font-bold text-slate-800"
              >
                Feedback
              </label>

              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600">
                Required
              </span>
            </div>

            <textarea
              id="content"
              name="content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              required
              maxLength={10000}
              rows={8}
              placeholder="Enter customer feedback..."
              className="w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 hover:bg-white focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
            />

            <div className="mt-2 flex items-center justify-between gap-4">
              <p className="text-xs text-slate-400">
                Capture the customer's feedback as accurately as possible.
              </p>

              <p className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">
                {content.length}/10000
              </p>
            </div>
          </div>

          {/* Source */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="channel"
                className="text-sm font-bold text-slate-800"
              >
                Source
              </label>

              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600">
                Required
              </span>
            </div>

            <select
              id="channel"
              name="channel"
              value={channel}
              onChange={(event) => setChannel(event.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-700 outline-none transition hover:bg-white focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
            >
              <option value="">Select source</option>
              <option value="web">Web</option>
              <option value="email">Email</option>
              <option value="support">Support</option>
              <option value="survey">Survey</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Additional Information */}
          <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-blue-50/60 via-white to-violet-50/60 p-5 sm:p-6">
            <div className="mb-5">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-sm text-indigo-600">
                  +
                </span>

                <p className="text-sm font-bold text-slate-800">
                  Additional Information
                </p>
              </div>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                These fields are optional but can help identify and trace the
                feedback later.
              </p>
            </div>

            <div className="space-y-6">

              {/* Source Reference */}
              <div>
                <label
                  htmlFor="sourceRef"
                  className="mb-2 block text-sm font-bold text-slate-800"
                >
                  Source Reference
                  <span className="ml-1 font-normal text-slate-400">
                    Optional
                  </span>
                </label>

                <input
                  id="sourceRef"
                  name="sourceRef"
                  type="text"
                  value={sourceRef}
                  onChange={(event) => setSourceRef(event.target.value)}
                  maxLength={500}
                  placeholder="Ticket, survey, email reference..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />

                <p className="mt-2 text-xs text-slate-400">
                  Example: ticket number, survey ID, or email reference.
                </p>
              </div>

              {/* Customer */}
              <div>
                <label
                  htmlFor="customerLabel"
                  className="mb-2 block text-sm font-bold text-slate-800"
                >
                  Customer
                  <span className="ml-1 font-normal text-slate-400">
                    Optional
                  </span>
                </label>

                <input
                  id="customerLabel"
                  name="customerLabel"
                  type="text"
                  value={customerLabel}
                  onChange={(event) => setCustomerLabel(event.target.value)}
                  maxLength={200}
                  placeholder="Customer name or label"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm leading-6 text-rose-700"
            >
              <span className="font-bold">Error</span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div
              role="status"
              className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-700"
            >
              <span className="font-bold">Success</span>
              <span>{success}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {loading ? "Submitting..." : "Submit Feedback"}
            </button>
          </div>
        </form>
      </section>

      {/* Footer */}
      <p className="mt-4 text-center text-xs text-slate-400">
        Feedback will be added to your current workspace.
      </p>
    </div>
  </main>
);
}