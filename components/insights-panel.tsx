"use client";

import { useEffect, useState } from "react";

type Metrics = {
  totalFeedback: number;
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  negativePercentage: number;
  averageSentimentScore: number | null;
};

type ThemeSummary = {
  name: string;
  count: number;
  averageConfidence: number;
};

type Insight = {
  type: "SENTIMENT" | "THEME" | "VOLUME";
  title: string;
  description: string;
};

type Recommendation = {
  priority: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  action: string;
};

type InsightsResponse = {
  metrics: Metrics;
  topThemes: ThemeSummary[];
  insights: Insight[];
  recommendations: Recommendation[];
};

export default function InsightsPanel() {
  const [data, setData] =
    useState<InsightsResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInsights() {
      try {
        const response = await fetch(
          "/api/insights?days=30"
        );

        const result: unknown = await response.json();

        if (!response.ok) {
          throw new Error("Unable to load insights.");
        }

        if (
          typeof result !== "object" ||
          result === null ||
          !("metrics" in result) ||
          !("topThemes" in result) ||
          !("insights" in result) ||
          !("recommendations" in result)
        ) {
          throw new Error("Invalid insights response.");
        }

        setData(result as InsightsResponse);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load insights."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadInsights();
  }, []);

  if (loading) {
    return (
      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-500">
          Loading insights...
        </p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">
        <p className="text-sm text-red-700">
          {error}
        </p>
      </section>
    );
  }

  if (!data) {
    return null;
  }

  const {
    metrics,
    topThemes,
    insights,
    recommendations,
  } = data;

  return (
    <section className="mb-6 space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Insights & Recommendations
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Feedback intelligence from the last 30 days.
          </p>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Total Feedback
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {metrics.totalFeedback}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Positive
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {metrics.positiveCount}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Negative
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {metrics.negativeCount}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Negative Rate
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {metrics.negativePercentage.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900">
            Key Insights
          </h3>

          <div className="mt-4 space-y-3">
            {insights.map((insight, index) => (
              <div
                key={`${insight.type}-${index}`}
                className="rounded-xl border border-slate-200 p-4"
              >
                <p className="font-medium text-slate-900">
                  {insight.title}
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {insight.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900">
            Recommendations
          </h3>

          <div className="mt-4 space-y-3">
            {recommendations.map(
              (recommendation, index) => (
                <div
                  key={`${recommendation.priority}-${index}`}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-900">
                      {recommendation.title}
                    </p>

                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      {recommendation.priority}
                    </span>
                  </div>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {recommendation.action}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="font-semibold text-slate-900">
          Top Themes
        </h3>

        {topThemes.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            No extracted themes available yet.
          </p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {topThemes.map((theme) => (
              <div
                key={theme.name}
                className="rounded-xl border border-slate-200 p-4"
              >
                <p className="font-medium text-slate-900">
                  {theme.name}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {theme.count} feedback{" "}
                  {theme.count === 1
                    ? "item"
                    : "items"}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  Confidence:{" "}
                  {Math.round(
                    theme.averageConfidence * 100
                  )}
                  %
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}