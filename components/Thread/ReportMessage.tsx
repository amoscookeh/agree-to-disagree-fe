import type { ReportData } from "@/lib/types";

interface ReportMessageProps {
  report: ReportData;
  timestamp: string;
}

export function ReportMessage({ report, timestamp }: ReportMessageProps) {
  return (
    <div className="border border-zinc-800 rounded-lg p-6 bg-zinc-900/50 space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-teal-500">Research Complete</span>
        <span className="text-zinc-600">•</span>
        <span className="text-xs text-zinc-500">
          {new Date(timestamp).toLocaleTimeString()}
        </span>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-3 text-teal-500">Summary</h2>
        <p className="text-zinc-300 leading-relaxed text-sm">
          {report.summary}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="border border-zinc-700 rounded-lg p-4 bg-zinc-800/50">
          <div className="text-xs uppercase tracking-wider text-teal-500 mb-2">
            {report.claim_a.stance}
          </div>
          <h3 className="text-xl font-bold mb-4">{report.claim_a.title}</h3>
          <div className="space-y-3">
            {report.claim_a.evidence.map((ev, idx) => (
              <div key={idx} className="text-sm">
                <p className="text-zinc-300 mb-1">{ev.claim}</p>
                <a
                  href={ev.url}
                  className="text-teal-500 hover:text-teal-400 text-xs"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {ev.source} →
                </a>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-zinc-700 rounded-lg p-4 bg-zinc-800/50">
          <div className="text-xs uppercase tracking-wider text-amber-500 mb-2">
            {report.claim_b.stance}
          </div>
          <h3 className="text-xl font-bold mb-4">{report.claim_b.title}</h3>
          <div className="space-y-3">
            {report.claim_b.evidence.map((ev, idx) => (
              <div key={idx} className="text-sm">
                <p className="text-zinc-300 mb-1">{ev.claim}</p>
                <a
                  href={ev.url}
                  className="text-amber-500 hover:text-amber-400 text-xs"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {ev.source} →
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {report.agreements.length > 0 && (
        <div className="border border-zinc-700 rounded-lg p-4 bg-zinc-800/50">
          <h3 className="text-lg font-bold mb-3">Areas of Agreement</h3>
          <ul className="space-y-2">
            {report.agreements.map((agreement, idx) => (
              <li key={idx} className="text-zinc-400 text-sm">
                • {agreement}
              </li>
            ))}
          </ul>
        </div>
      )}

      {report.disagreements.length > 0 && (
        <div className="border border-zinc-700 rounded-lg p-4 bg-zinc-800/50">
          <h3 className="text-lg font-bold mb-3">Key Disagreements</h3>
          <div className="space-y-4">
            {report.disagreements.map((dis, idx) => (
              <div key={idx}>
                <h4 className="text-teal-500 font-bold text-sm mb-2">
                  {dis.topic}
                </h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-zinc-500">Left: </span>
                    <span className="text-zinc-300">{dis.left_position}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Right: </span>
                    <span className="text-zinc-300">{dis.right_position}</span>
                  </div>
                </div>
                <p className="text-zinc-500 text-xs mt-2">{dis.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {report.uncertainties && report.uncertainties.length > 0 && (
        <div className="border border-zinc-700 rounded-lg p-4 bg-zinc-800/50">
          <h3 className="text-lg font-bold mb-3">Uncertainties</h3>
          <ul className="space-y-2">
            {report.uncertainties.map((uncertainty, idx) => (
              <li key={idx} className="text-zinc-400 text-sm">
                • {uncertainty}
              </li>
            ))}
          </ul>
        </div>
      )}

      {report.metadata && (
        <div className="text-xs text-zinc-500 pt-2 border-t border-zinc-700">
          {report.metadata.sources_searched} sources •{" "}
          {report.metadata.total_results} results •{" "}
          {(report.metadata.processing_time_ms / 1000).toFixed(1)}s
        </div>
      )}
    </div>
  );
}
