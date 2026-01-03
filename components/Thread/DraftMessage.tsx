"use client";

import { useState, useCallback } from "react";
import type { DraftData, SubQueryAngle } from "@/lib/types";

interface DraftMessageProps {
  data: DraftData;
}

const SUMMARY_PREVIEW_LENGTH = 150;

function AngleBadge({ angle }: { angle: SubQueryAngle }) {
  const styles: Record<SubQueryAngle, string> = {
    left: "bg-blue-900/70 text-blue-300 border-blue-700",
    right: "bg-red-900/70 text-red-300 border-red-700",
    both: "bg-purple-900/70 text-purple-300 border-purple-700",
  };

  const labels: Record<SubQueryAngle, string> = {
    left: "Left",
    right: "Right",
    both: "Both",
  };

  return (
    <span
      className={`text-[10px] px-1.5 py-0.5 rounded border font-medium uppercase tracking-wider ${styles[angle]}`}
      role="status"
      aria-label={`${labels[angle]} perspective`}
    >
      {labels[angle]}
    </span>
  );
}

export function DraftMessage({ data }: DraftMessageProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const summaryPreview =
    data.summary.length > SUMMARY_PREVIEW_LENGTH
      ? `${data.summary.slice(0, SUMMARY_PREVIEW_LENGTH)}...`
      : data.summary;

  return (
    <article
      className="border border-zinc-700/50 rounded-lg p-4 bg-zinc-800/30 mr-8"
      aria-label="Draft research finding"
    >
      <header className="flex items-center gap-2 mb-3 text-xs text-zinc-500">
        <svg
          className="w-4 h-4 text-teal-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <span className="text-teal-500">Draft Finding</span>
        <span aria-hidden="true">•</span>
        <AngleBadge angle={data.angle} />
        <span aria-hidden="true">•</span>
        <span>{data.sources_count} sources</span>
      </header>

      <section className="mb-3">
        <h4 className="text-zinc-400 text-xs mb-1">Investigated:</h4>
        <p className="text-zinc-200 text-sm">{data.sub_query}</p>
      </section>

      <section className="mb-3">
        <h4 className="text-zinc-400 text-xs mb-1">Summary:</h4>
        <p className="text-zinc-300 text-sm">
          {isExpanded ? data.summary : summaryPreview}
        </p>
        {data.summary.length > SUMMARY_PREVIEW_LENGTH && (
          <button
            onClick={handleToggle}
            className="text-teal-500 text-xs mt-1 hover:text-teal-400"
            aria-expanded={isExpanded}
          >
            {isExpanded ? "Show less" : "Show more"}
          </button>
        )}
      </section>

      {data.key_findings.length > 0 && (
        <section
          className="border-t border-zinc-700/50 pt-3 mt-3"
          aria-label="Key findings"
        >
          <h4 className="text-zinc-400 text-xs mb-2">Key findings:</h4>
          <ul className="space-y-1">
            {data.key_findings.map((finding, idx) => (
              <li key={idx} className="text-zinc-400 text-xs flex gap-2">
                <span className="text-teal-500" aria-hidden="true">
                  •
                </span>
                <span>{finding}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
