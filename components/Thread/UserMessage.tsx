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
    <div
      className={`bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 ${isResponse ? "ml-8" : ""}`}
    >
      <div className="flex items-center gap-2 mb-2 text-xs text-zinc-500">
        <span>You</span>
        <span>•</span>
        <span>{new Date(timestamp).toLocaleTimeString()}</span>
      </div>
      <p className="text-zinc-200">{query}</p>
    </div>
  );
}
