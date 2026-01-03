import type { ProgressDetails } from "@/lib/types";

interface AgentUpdateProps {
  agent: string;
  status: string;
  message: string;
  details?: ProgressDetails;
  timestamp: string;
}

export function AgentUpdate({
  agent,
  status,
  message,
  details,
  timestamp,
}: AgentUpdateProps) {
  return (
    <div className="border border-zinc-700/50 rounded-lg p-4 bg-zinc-800/30">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-teal-500 text-xs uppercase tracking-wider">
          {agent.replace("_", " ")}
        </span>
        <span className="text-zinc-600">•</span>
        <span className="text-zinc-400 text-sm">{status}</span>
        <span className="text-zinc-600">•</span>
        <span className="text-zinc-500 text-xs">
          {new Date(timestamp).toLocaleTimeString()}
        </span>
      </div>
      <p className="text-zinc-300 text-sm">{message}</p>

      {details?.query_sent && (
        <div className="mt-2 bg-zinc-900/50 rounded p-2">
          <span className="text-xs text-zinc-500">Query: </span>
          <span className="text-xs text-zinc-400 font-mono">
            {details.query_sent}
          </span>
        </div>
      )}

      {details?.sample_titles && details.sample_titles.length > 0 && (
        <div className="mt-2 space-y-1">
          {details.sample_titles.map((title, i) => (
            <div key={i} className="text-xs text-zinc-500 truncate">
              • {title}
            </div>
          ))}
        </div>
      )}

      {details?.result_count !== undefined && (
        <div className="mt-2 text-xs text-zinc-500">
          Found {details.result_count} result
          {details.result_count !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
