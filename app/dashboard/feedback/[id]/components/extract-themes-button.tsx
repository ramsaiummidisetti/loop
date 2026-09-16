"use client";

import { useState } from "react";

type Theme = {
  id: string;
  name: string;
  description: string;
  color: string;
  confidence: number;
};

type ThemeResponse = {
  message: string;
  themes: Theme[];
};

type ExtractThemesButtonProps = {
  feedbackId: string;
  initialThemes: Theme[];
};

export default function ExtractThemesButton({
  feedbackId,
  initialThemes,
}: ExtractThemesButtonProps) {
  const [themes, setThemes] =
    useState<Theme[]>(initialThemes);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  async function extractThemes() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/feedback/${feedbackId}/themes`,
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
          "Unable to extract themes"
        );
      }

      if (
        typeof data !== "object" ||
        data === null ||
        !("themes" in data) ||
        !Array.isArray(data.themes)
      ) {
        throw new Error(
          "Invalid theme response"
        );
      }

      const themeResponse =
        data as ThemeResponse;

      setThemes(themeResponse.themes);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to extract themes"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={extractThemes}
        disabled={loading}
        className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? "Extracting..."
          : "Extract Themes"}
      </button>

      {themes.length > 0 && (
        <div className="space-y-3">
          {themes.map((theme) => (
            <div
              key={theme.id}
              className="rounded-md border p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="font-medium">
                  {theme.name}
                </div>

                <div className="text-sm">
                  {(theme.confidence * 100).toFixed(
                    0
                  )}
                  %
                </div>
              </div>

              <p className="mt-1 text-sm text-gray-600">
                {theme.description}
              </p>
            </div>
          ))}
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