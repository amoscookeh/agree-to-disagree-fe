import type { ReportData } from "@/lib/types";
import { formatTimestamp } from "@/lib/dateUtils";

interface ReportMessageProps {
  report: ReportData;
  timestamp: string;
}

export function ReportMessage({ report, timestamp }: ReportMessageProps) {
  return (
    <article
      className="border border-zinc-800 rounded-lg p-6 bg-zinc-900/50 space-y-6"
      aria-label="Research report"
    >
      <header className="flex items-center gap-2 mb-2">
        <span className="text-xs text-teal-500">Research Complete</span>
        <span className="text-zinc-600" aria-hidden="true">
          •
        </span>
        <time className="text-xs text-zinc-500" dateTime={timestamp}>
          {formatTimestamp(timestamp)}
        </time>
      </header>

      <section aria-labelledby="report-summary">
        <h2
          id="report-summary"
          className="text-2xl font-bold mb-3 text-teal-500"
        >
          Summary
        </h2>
        <p className="text-zinc-300 leading-relaxed text-sm">
          {report.summary}
        </p>
      </section>

      <div
        className="grid md:grid-cols-2 gap-4"
        role="region"
        aria-label="Opposing perspectives"
      >
        <section
          className="border border-zinc-700 rounded-lg p-4 bg-zinc-800/50"
          aria-labelledby="claim-a-title"
        >
          <div className="text-xs uppercase tracking-wider text-teal-500 mb-2">
            {report.claim_a.stance}
          </div>
          <h3 id="claim-a-title" className="text-xl font-bold mb-4">
            {report.claim_a.title}
          </h3>
          <ul className="space-y-3" aria-label="Supporting evidence">
            {report.claim_a.evidence.map((ev, idx) => (
              <li key={idx} className="text-sm">
                <p className="text-zinc-300 mb-1">{ev.claim}</p>
                <a
                  href={ev.url}
                  className="text-teal-500 hover:text-teal-400 text-xs"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {ev.source} <span aria-hidden="true">→</span>
                  <span className="sr-only">(opens in new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section
          className="border border-zinc-700 rounded-lg p-4 bg-zinc-800/50"
          aria-labelledby="claim-b-title"
        >
          <div className="text-xs uppercase tracking-wider text-amber-500 mb-2">
            {report.claim_b.stance}
          </div>
          <h3 id="claim-b-title" className="text-xl font-bold mb-4">
            {report.claim_b.title}
          </h3>
          <ul className="space-y-3" aria-label="Supporting evidence">
            {report.claim_b.evidence.map((ev, idx) => (
              <li key={idx} className="text-sm">
                <p className="text-zinc-300 mb-1">{ev.claim}</p>
                <a
                  href={ev.url}
                  className="text-amber-500 hover:text-amber-400 text-xs"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {ev.source} <span aria-hidden="true">→</span>
                  <span className="sr-only">(opens in new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {report.agreements.length > 0 && (
        <section
          className="border border-zinc-700 rounded-lg p-4 bg-zinc-800/50"
          aria-labelledby="agreements-heading"
        >
          <h3 id="agreements-heading" className="text-lg font-bold mb-3">
            Areas of Agreement
          </h3>
          <ul className="space-y-2">
            {report.agreements.map((agreement, idx) => (
              <li key={idx} className="text-zinc-400 text-sm">
                <span aria-hidden="true">• </span>
                {agreement}
              </li>
            ))}
          </ul>
        </section>
      )}

      {report.disagreements.length > 0 && (
        <section
          className="border border-zinc-700 rounded-lg p-4 bg-zinc-800/50"
          aria-labelledby="disagreements-heading"
        >
          <h3 id="disagreements-heading" className="text-lg font-bold mb-3">
            Key Disagreements
          </h3>
          <div className="space-y-4">
            {report.disagreements.map((dis, idx) => (
              <article key={idx} aria-label={`Disagreement: ${dis.topic}`}>
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
              </article>
            ))}
          </div>
        </section>
      )}

      {report.uncertainties && report.uncertainties.length > 0 && (
        <section
          className="border border-zinc-700 rounded-lg p-4 bg-zinc-800/50"
          aria-labelledby="uncertainties-heading"
        >
          <h3 id="uncertainties-heading" className="text-lg font-bold mb-3">
            Uncertainties
          </h3>
          <ul className="space-y-2">
            {report.uncertainties.map((uncertainty, idx) => (
              <li key={idx} className="text-zinc-400 text-sm">
                <span aria-hidden="true">• </span>
                {uncertainty}
              </li>
            ))}
          </ul>
        </section>
      )}

      {report.metadata && (
        <footer className="text-xs text-zinc-500 pt-2 border-t border-zinc-700">
          {report.metadata.cycles_used !== undefined && (
            <span>
              {report.metadata.cycles_used} research cycle
              {report.metadata.cycles_used !== 1 ? "s" : ""}
            </span>
          )}
          {report.metadata.drafts_synthesized !== undefined && (
            <span>
              {" "}
              <span aria-hidden="true">•</span>{" "}
              {report.metadata.drafts_synthesized} draft
              {report.metadata.drafts_synthesized !== 1 ? "s" : ""} synthesized
            </span>
          )}
          {report.metadata.sources_searched !== undefined &&
            report.metadata.sources_searched > 0 && (
              <span>
                {" "}
                <span aria-hidden="true">•</span>{" "}
                {report.metadata.sources_searched} sources
              </span>
            )}
          {report.metadata.processing_time_ms !== undefined &&
            report.metadata.processing_time_ms > 0 && (
              <span>
                {" "}
                <span aria-hidden="true">•</span>{" "}
                {(report.metadata.processing_time_ms / 1000).toFixed(1)}s
              </span>
            )}
        </footer>
      )}
    </article>
  );
}
