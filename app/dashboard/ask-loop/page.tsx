"use client";

import { FormEvent, useState } from "react";
import {
  Bot,
  MessageSquare,
  Search,
  Sparkles,
  UserRound,
} from "lucide-react";

type FeedbackSource = {
  id: string;
  content: string;
  channel: string;
  customerLabel: string | null;
  sentiment: "POS" | "NEU" | "NEG" | null;
  status: "NEW" | "REVIEWED" | "ACTIONED";
  similarity: number;
};

type AskLoopResponse = {
  question: string;
  answer: string;
  sources: FeedbackSource[];
};

const exampleQuestions = [
  "What are the main customer complaints?",
  "What do customers like most about our product?",
  "Which feedback needs immediate attention?",
  "What are the common issues mentioned by customers?",
];

export default function AskLoopPage() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<AskLoopResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAsk(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) {
      setError("Please enter a question.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/ask-loop", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: trimmedQuestion,
        }),
      });

      const data: unknown = await response.json();

      if (!response.ok) {
        const message =
          typeof data === "object" &&
          data !== null &&
          "message" in data &&
          typeof data.message === "string"
            ? data.message
            : "Unable to process your question.";

        throw new Error(message);
      }

      setResult(data as AskLoopResponse);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  function useExample(example: string) {
    setQuestion(example);
    setError("");
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a
            href="/dashboard"
            className="flex items-center gap-2.5 font-bold tracking-tight"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/20">
              <Sparkles size={18} />
            </span>
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              LOOP
            </span>
          </a>

          <nav className="hidden items-center gap-1 md:flex">
            <a
              href="/dashboard"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Dashboard
            </a>

            <a
              href="/dashboard/feedback"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Feedback
            </a>

            <a
              href="/dashboard/feedback#semantic-search"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Search
            </a>

            <a
              href="/dashboard/ask-loop"
              className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700"
            >
              Ask LOOP
            </a>

            <a
              href="/dashboard#insights"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Insights
            </a>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-7 text-white shadow-xl shadow-blue-500/10 sm:p-10">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-violet-300/20 blur-3xl" />

          <div className="relative">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
              <Bot size={25} />
            </div>

            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-blue-100">
              Feedback Intelligence
            </p>

            <h1 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
              Ask LOOP
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
              Ask questions about your customer feedback and get answers
              grounded in the feedback collected in your workspace.
            </p>
          </div>
        </section>

        {/* Question form */}
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <form onSubmit={handleAsk}>
            <label
              htmlFor="question"
              className="mb-2 block text-sm font-semibold text-slate-900"
            >
              What would you like to know?
            </label>

            <div className="relative">
              <MessageSquare
                size={19}
                className="absolute left-4 top-4 text-slate-400"
              />

              <textarea
                id="question"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="e.g. What are the main customer complaints?"
                maxLength={500}
                rows={4}
                className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs text-slate-400">
                {question.length}/500 characters
              </span>

              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:shadow-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    LOOP is thinking...
                  </>
                ) : (
                  <>
                    <Search size={17} />
                    Ask LOOP
                  </>
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          {/* Example questions */}
          <div className="mt-6 border-t border-slate-100 pt-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Try asking
            </p>

            <div className="flex flex-wrap gap-2">
              {exampleQuestions.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => useExample(example)}
                  className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Answer */}
        {result && (
          <section className="mt-6 space-y-6">
            <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-violet-50 p-6 shadow-sm sm:p-8">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
                  <Bot size={20} />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                    LOOP Answer
                  </p>
                  <h2 className="font-semibold text-slate-900">
                    {result.question}
                  </h2>
                </div>
              </div>

              <div className="rounded-2xl border border-white/80 bg-white/80 p-5">
                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                  {result.answer}
                </p>
              </div>
            </div>

            {/* Sources */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">
                    Evidence
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-slate-900">
                    Source feedback
                  </h2>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {result.sources.length} sources
                </span>
              </div>

              {result.sources.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                  <Search className="mx-auto mb-3 text-slate-400" size={25} />
                  <p className="text-sm font-medium text-slate-700">
                    No matching feedback was found.
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Try a different question or add more feedback.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {result.sources.map((source, index) => (
                    <a
                      key={source.id}
                      href={`/dashboard/feedback/${source.id}`}
                      className="block rounded-2xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50/40"
                    >
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                          {index + 1}
                        </span>

                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          {source.channel}
                        </span>

                        {source.customerLabel && (
                          <span className="flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700">
                            <UserRound size={12} />
                            {source.customerLabel}
                          </span>
                        )}

                        {source.sentiment && (
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              source.sentiment === "POS"
                                ? "bg-emerald-50 text-emerald-700"
                                : source.sentiment === "NEG"
                                  ? "bg-rose-50 text-rose-700"
                                  : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {source.sentiment}
                          </span>
                        )}

                        <span className="ml-auto rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                          {Math.round(source.similarity * 100)}% match
                        </span>
                      </div>

                      <p className="text-sm leading-6 text-slate-700">
                        {source.content}
                      </p>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}