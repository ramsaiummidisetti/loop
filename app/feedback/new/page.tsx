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
  <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
    <div className="mx-auto max-w-3xl">

      {/* Top navigation */}
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="inline-flex items-center rounded-lg px-2 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-900"
        >
          ← Dashboard
        </button>

        <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:inline-flex">
          Feedback Intake
        </span>
      </div>

      {/* Header */}
      <header className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-slate-900 px-2.5 py-1 text-xs font-bold tracking-wide text-white">
            LOOP
          </span>

          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Feedback Intelligence
          </span>
        </div>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
          Add Feedback
        </h1>

        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
          Capture customer feedback and add it to your workspace for review,
          analysis, and follow-up.
        </p>
      </header>

      {/* Form */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5 sm:px-7">
          <h2 className="text-base font-semibold text-slate-950">
            Feedback Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Provide the feedback details below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-7 p-6 sm:p-7">

          {/* Feedback content */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="content"
                className="text-sm font-semibold text-slate-800"
              >
                Feedback
              </label>

              <span className="text-xs font-medium text-slate-400">
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
              className="w-full resize-y rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 hover:bg-white focus:border-slate-500 focus:bg-white focus:ring-4 focus:ring-slate-100"
            />

            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-slate-400">
                Capture the customer's feedback as accurately as possible.
              </p>

              <p className="shrink-0 text-xs font-medium text-slate-500">
                {content.length}/10000
              </p>
            </div>
          </div>

          {/* Source */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="channel"
                className="text-sm font-semibold text-slate-800"
              >
                Source
              </label>

              <span className="text-xs font-medium text-slate-400">
                Required
              </span>
            </div>

            <select
              id="channel"
              name="channel"
              value={channel}
              onChange={(event) => setChannel(event.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition hover:border-slate-400 focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
            >
              <option value="">Select source</option>
              <option value="web">Web</option>
              <option value="email">Email</option>
              <option value="support">Support</option>
              <option value="survey">Survey</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Optional fields */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
            <div className="mb-5">
              <p className="text-sm font-semibold text-slate-800">
                Additional Information
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                These fields are optional but can help identify and trace the
                feedback later.
              </p>
            </div>

            <div className="space-y-6">

              {/* Source reference */}
              <div>
                <label
                  htmlFor="sourceRef"
                  className="mb-2 block text-sm font-semibold text-slate-800"
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
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                />

                <p className="mt-2 text-xs text-slate-400">
                  Example: ticket number, survey ID, or email reference.
                </p>
              </div>

              {/* Customer */}
              <div>
                <label
                  htmlFor="customerLabel"
                  className="mb-2 block text-sm font-semibold text-slate-800"
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
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm leading-6 text-red-700"
            >
              <span className="font-semibold">Unable to submit:</span>{" "}
              {error}
            </div>
          )}

          {success && (
            <div
              role="status"
              className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm leading-6 text-emerald-700"
            >
              <span className="font-semibold">Success:</span> {success}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Submit Feedback"}
            </button>
          </div>
        </form>
      </section>

      {/* Footer hint */}
      <p className="mt-4 text-center text-xs text-slate-400">
        Feedback will be added to your current workspace.
      </p>
    </div>
  </main>
);
}