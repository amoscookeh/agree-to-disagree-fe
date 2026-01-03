import type { FollowupCitation } from "@/lib/types";

interface FollowupMessageProps {
  answer: string;
  citations?: FollowupCitation[];
  timestamp: string;
}

export function FollowupMessage({
  answer,
  citations = [],
  timestamp,
}: FollowupMessageProps) {
  return (
    <div className="border border-teal-800/50 rounded-lg p-4 bg-teal-950/20 mr-8">
      <div className="flex items-center gap-2 mb-3 text-xs text-teal-500">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
        <span>Follow-up Answer</span>
        <span>•</span>
        <span>{new Date(timestamp).toLocaleTimeString()}</span>
      </div>

      <div className="text-zinc-300 text-sm whitespace-pre-wrap leading-relaxed">
        {answer}
      </div>

      {citations.length > 0 && (
        <div className="mt-4 pt-3 border-t border-teal-800/30">
          <p className="text-xs text-zinc-500 mb-2">Sources referenced:</p>
          <div className="space-y-2">
            {citations.map((citation, idx) => (
              <a
                key={idx}
                href={citation.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-2 rounded bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded ${
                      citation.ideological_lean === "left"
                        ? "bg-blue-900/50 text-blue-400"
                        : citation.ideological_lean === "right"
                          ? "bg-red-900/50 text-red-400"
                          : "bg-zinc-700 text-zinc-400"
                    }`}
                  >
                    {citation.source_name}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                  {citation.title || citation.snippet}
                </p>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
