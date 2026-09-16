"use client";

import { useState } from "react";

type Sentiment = "POS" | "NEU" | "NEG";

type SentimentResponse = {
  message: string;
  feedback: {
    id: string;
    sentiment: Sentiment;
    sentimentScore: number;
  };
};

type AnalyzeSentimentButtonProps = {
  feedbackId: string;
  initialSentiment: Sentiment | null;
  initialScore: number | null;
};

function getSentimentLabel(
  sentiment: Sentiment
): string {
  switch (sentiment) {
    case "POS":
      return "Positive";
    case "NEG":
      return "Negative";
    case "NEU":
      return "Neutral";
  }
}

export default function AnalyzeSentimentButton({
  feedbackId,
  initialSentiment,
  initialScore,
}: AnalyzeSentimentButtonProps) {
  const [sentiment, setSentiment] =
    useState<Sentiment | null>(initialSentiment);

  const [score, setScore] =
    useState<number | null>(initialScore);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    null
  );

  async function analyzeSentiment() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/feedback/${feedbackId}/sentiment`,
        {
          method: "POST",
        }
      );

      const data: unknown = await response.json();

      if (!response.ok) {
        if (
          typeof data === "object" &&
          data !== null &&
          "error" in data &&
          typeof data.error === "string"
        ) {
          throw new Error(data.error);
        }

        throw new Error(
          "Unable to analyze sentiment"
        );
      }

      if (
        typeof data !== "object" ||
        data === null ||
        !("feedback" in data)
      ) {
        throw new Error(
          "Invalid sentiment response"
        );
      }

      const responseData =
        data as SentimentResponse;

      if (
        !responseData.feedback ||
        !["POS", "NEU", "NEG"].includes(
          responseData.feedback.sentiment
        ) ||
        typeof responseData.feedback
          .sentimentScore !== "number"
      ) {
        throw new Error(
          "Invalid sentiment response"
        );
      }

      setSentiment(
        responseData.feedback.sentiment
      );

      setScore(
        responseData.feedback.sentimentScore
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to analyze sentiment"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={analyzeSentiment}
        disabled={loading}
        className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? "Analyzing..."
          : "Analyze Sentiment"}
      </button>

      {sentiment !== null && score !== null && (
        <div className="rounded-md border p-3 text-sm">
          <div>
            <strong>Sentiment:</strong>{" "}
            {getSentimentLabel(sentiment)}
          </div>

          <div>
            <strong>Score:</strong>{" "}
            {(score * 100).toFixed(1)}%
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}