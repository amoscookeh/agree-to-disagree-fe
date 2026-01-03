import type { SubQueriesData, SubQueryAngle } from "@/lib/types";

interface SubQueriesMessageProps {
  data: SubQueriesData;
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

export function SubQueriesMessage({ data }: SubQueriesMessageProps) {
  return (
    <div className="border border-amber-800/50 rounded-lg p-4 bg-amber-950/20 mr-8">
      <div className="flex items-center gap-2 mb-3 text-xs text-amber-500">
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
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
        <span>Research Plan</span>
        <span>•</span>
        <span className="text-amber-400/70">Cycle {data.cycle}</span>
      </div>

      <p className="text-zinc-400 text-sm mb-3">
        Investigating {data.sub_queries.length} research direction
        {data.sub_queries.length !== 1 ? "s" : ""}:
      </p>

      <div className="space-y-2">
        {data.sub_queries.map((sq) => (
          <div
            key={sq.id}
            className="flex items-start gap-2 p-2 rounded bg-zinc-800/50"
          >
            <AngleBadge angle={sq.angle} />
            <span className="text-zinc-300 text-sm flex-1">{sq.query}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
