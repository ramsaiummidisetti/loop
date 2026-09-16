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
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            LOOP
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Add Feedback
          </h1>

          <p className="mt-2 text-slate-600">
            Add a customer feedback entry to your workspace.
          </p>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="content"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Feedback
              </label>

              <textarea
                id="content"
                name="content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                required
                maxLength={10000}
                rows={7}
                placeholder="Enter customer feedback..."
                className="w-full resize-y rounded-lg border border-slate-300 px-3 py-3 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />

              <p className="mt-1 text-right text-xs text-slate-500">
                {content.length}/10000
              </p>
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
                name="channel"
                value={channel}
                onChange={(event) => setChannel(event.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              >
                <option value="">Select source</option>
                <option value="web">Web</option>
                <option value="email">Email</option>
                <option value="support">Support</option>
                <option value="survey">Survey</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="sourceRef"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Source Reference
                <span className="ml-1 font-normal text-slate-500">
                  (optional)
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
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label
                htmlFor="customerLabel"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Customer
                <span className="ml-1 font-normal text-slate-500">
                  (optional)
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
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {success}
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Submitting..." : "Submit Feedback"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}