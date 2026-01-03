import type { ProgressDetails, ToolCall } from "@/lib/types";
import { formatTimestamp } from "@/lib/dateUtils";

interface AgentUpdateProps {
  agent: string;
  status: string;
  message: string;
  details?: ProgressDetails;
  toolCalls?: ToolCall[];
  timestamp: string;
}

function getAgentDisplayName(agent: string): string {
  const displayNames: Record<string, string> = {
    supervisor: "Supervisor",
    sub_research: "Sub-Research",
    clarification: "Clarification",
    classification: "Classification",
    left_research: "Left Research",
    right_research: "Right Research",
    academic_research: "Academic Research",
    synthesis: "Synthesis",
    quality_check: "Quality Check",
    followup: "Follow-up",
  };
  return displayNames[agent] || agent.replace("_", " ");
}

export function AgentUpdate({
  agent,
  status,
  message,
  details,
  toolCalls,
  timestamp,
}: AgentUpdateProps) {
  const agentName = getAgentDisplayName(agent);

  return (
    <article
      className="border border-zinc-700/50 rounded-lg p-4 bg-zinc-800/30"
      aria-label={`${agentName} agent update: ${status}`}
    >
      <header className="flex items-center gap-3 mb-2">
        <span className="text-teal-500 text-xs uppercase tracking-wider">
          {agentName}
        </span>
        <span className="text-zinc-600" aria-hidden="true">
          •
        </span>
        <span className="text-zinc-400 text-sm" role="status">
          {status}
        </span>
        <span className="text-zinc-600" aria-hidden="true">
          •
        </span>
        <time className="text-zinc-500 text-xs" dateTime={timestamp}>
          {formatTimestamp(timestamp)}
        </time>
      </header>
      <p className="text-zinc-300 text-sm">{message}</p>

      {details?.query_sent && (
        <div className="mt-2 bg-zinc-900/50 rounded p-2">
          <span className="text-xs text-zinc-500">Query: </span>
          <code className="text-xs text-zinc-400 font-mono">
            {details.query_sent}
          </code>
        </div>
      )}

      {details?.sample_titles && details.sample_titles.length > 0 && (
        <ul className="mt-2 space-y-1" aria-label="Sample results">
          {details.sample_titles.map((title, i) => (
            <li key={i} className="text-xs text-zinc-500 truncate">
              <span aria-hidden="true">• </span>
              {title}
            </li>
          ))}
        </ul>
      )}

      {details?.result_count !== undefined && (
        <p className="mt-2 text-xs text-zinc-500">
          Found {details.result_count} result
          {details.result_count !== 1 ? "s" : ""}
        </p>
      )}

      {toolCalls && toolCalls.length > 0 && (
        <section className="mt-3 space-y-2" aria-label="Tool calls">
          <h4 className="text-xs text-zinc-500 uppercase tracking-wider">
            Tool Calls
          </h4>
          {toolCalls.map((call, i) => (
            <div
              key={i}
              className="bg-zinc-900/70 border border-zinc-700/50 rounded p-2"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-amber-500">
                  {call.tool}
                </span>
              </div>
              {call.input && Object.keys(call.input).length > 0 && (
                <div className="text-xs text-zinc-500 font-mono overflow-x-auto">
                  <pre className="whitespace-pre-wrap break-all">
                    {JSON.stringify(call.input, null, 2)}
                  </pre>
                </div>
              )}
              {call.output_preview && (
                <div className="mt-1 text-xs text-zinc-400 border-t border-zinc-700/50 pt-1">
                  <span className="text-zinc-500">Output: </span>
                  {call.output_preview}
                </div>
              )}
            </div>
          ))}
        </section>
      )}
    </article>
  );
}
