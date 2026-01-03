import { formatTimestamp } from "@/lib/dateUtils";

interface UserMessageProps {
  query: string;
  timestamp: string;
  isResponse?: boolean;
}

export function UserMessage({
  query,
  timestamp,
  isResponse,
}: UserMessageProps) {
  return (
    <article
      className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 ml-8"
      aria-label={isResponse ? "Your clarification response" : "Your query"}
    >
      <header className="flex items-center gap-2 mb-2 text-xs text-zinc-500">
        <span>You</span>
        <span aria-hidden="true">•</span>
        <time dateTime={timestamp}>{formatTimestamp(timestamp)}</time>
      </header>
      <p className="text-zinc-200">{query}</p>
    </article>
  );
}
