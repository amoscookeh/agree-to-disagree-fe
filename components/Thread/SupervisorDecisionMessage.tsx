import type { SupervisorDecisionData } from "@/lib/types";

interface SupervisorDecisionMessageProps {
  data: SupervisorDecisionData;
}

export function SupervisorDecisionMessage({
  data,
}: SupervisorDecisionMessageProps) {
  const isContinue = data.decision === "continue";

  return (
    <div
      className={`border rounded-lg p-4 mr-8 ${
        isContinue
          ? "border-amber-800/50 bg-amber-950/10"
          : "border-teal-800/50 bg-teal-950/10"
      }`}
    >
      <div
        className={`flex items-center gap-2 mb-2 text-xs ${
          isContinue ? "text-amber-500" : "text-teal-500"
        }`}
      >
        <span className="text-base">{isContinue ? "↻" : "✓"}</span>
        <span className="font-medium">
          {isContinue ? "Need More Research" : "Ready to Synthesize"}
        </span>
        <span className="text-zinc-600">•</span>
        <span className="text-zinc-500">Cycle {data.cycle}</span>
      </div>

      <p className="text-zinc-300 text-sm italic mb-2">{data.reasoning}</p>

      <div className="flex items-center gap-4 text-xs text-zinc-500">
        <span>{data.drafts_collected} drafts collected</span>
        {isContinue && data.new_sub_queries_count !== undefined && (
          <>
            <span>•</span>
            <span>{data.new_sub_queries_count} new directions to explore</span>
          </>
        )}
      </div>
    </div>
  );
}
