"use client";

import { useState } from "react";
import type { DraftData, SubQueryAngle } from "@/lib/types";

interface DraftMessageProps {
  data: DraftData;
}

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
    >
      {labels[angle]}
    </span>
  );
}

export function DraftMessage({ data }: DraftMessageProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const summaryPreview =
    data.summary.length > 150
      ? `${data.summary.slice(0, 150)}...`
      : data.summary;

  return (
    <div className="border border-zinc-700/50 rounded-lg p-4 bg-zinc-800/30 mr-8">
      <div className="flex items-center gap-2 mb-3 text-xs text-zinc-500">
        <svg
          className="w-4 h-4 text-teal-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <span className="text-teal-500">Draft Finding</span>
        <span>•</span>
        <AngleBadge angle={data.angle} />
        <span>•</span>
        <span>{data.sources_count} sources</span>
      </div>

      <div className="mb-3">
        <p className="text-zinc-400 text-xs mb-1">Investigated:</p>
        <p className="text-zinc-200 text-sm">{data.sub_query}</p>
      </div>

      <div className="mb-3">
        <p className="text-zinc-400 text-xs mb-1">Summary:</p>
        <p className="text-zinc-300 text-sm">
          {isExpanded ? data.summary : summaryPreview}
        </p>
        {data.summary.length > 150 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-teal-500 text-xs mt-1 hover:text-teal-400"
          >
            {isExpanded ? "Show less" : "Show more"}
          </button>
        )}
      </div>

      {data.key_findings.length > 0 && (
        <div className="border-t border-zinc-700/50 pt-3 mt-3">
          <p className="text-zinc-400 text-xs mb-2">Key findings:</p>
          <ul className="space-y-1">
            {data.key_findings.map((finding, idx) => (
              <li key={idx} className="text-zinc-400 text-xs flex gap-2">
                <span className="text-teal-500">•</span>
                <span>{finding}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
