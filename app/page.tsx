"use client";

import { useResearch } from "@/hooks/useResearch";
import { ChatInput } from "@/components/Chat/ChatInput";
import { ClarificationPrompt } from "@/components/Chat/ClarificationPrompt";

export default function Home() {
  const { status, clarification, progress, report, startResearch, submitClarification, reset } = useResearch();

  const isResearching = status === "researching";
  const isClarifying = status === "clarifying";
  const isComplete = status === "complete";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 relative">
      <div className="relative z-10 flex flex-col min-h-screen max-w-4xl mx-auto px-6 py-12">
        {status === "idle" && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-center mb-16">
              <h1 className="text-6xl font-bold mb-4 tracking-tight">
                Agree <span className="text-teal-500">2</span> Disagree
              </h1>
              <p className="text-zinc-500 text-lg">
                What should we explore today?
              </p>
            </div>
          </div>
        )}

        {isClarifying && clarification && (
          <div className="flex-1 mb-8">
            <div className="mb-8">
              <button
                onClick={reset}
                className="text-teal-500 hover:text-teal-400 text-sm transition-colors"
              >
                ← Cancel
              </button>
            </div>
            <ClarificationPrompt
              data={clarification}
              onSubmit={submitClarification}
              onCancel={reset}
            />
          </div>
        )}

        {(isResearching || isComplete) && (
          <div className="flex-1 mb-8">
            <div className="mb-8">
              <button
                onClick={reset}
                className="text-teal-500 hover:text-teal-400 text-sm transition-colors"
              >
                ← New research
              </button>
            </div>

            {isResearching && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold mb-6">Researching...</h2>
                {progress.map((p, idx) => (
                  <div
                    key={idx}
                    className="border border-zinc-800 rounded-lg p-4 bg-zinc-900/50"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-teal-500 text-xs uppercase tracking-wider">
                        {p.agent.replace("_", " ")}
                      </span>
                      <span className="text-zinc-600">•</span>
                      <span className="text-zinc-400 text-sm">{p.status}</span>
                    </div>
                    <p className="text-zinc-300 text-sm">{p.message}</p>
                    {p.sources_searched.length > 0 && (
                      <div className="mt-2 flex gap-2 flex-wrap">
                        {p.sources_searched.map((source) => (
                          <span
                            key={source}
                            className="text-xs bg-zinc-800 px-2 py-1 rounded text-zinc-400"
                          >
                            {source}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {isComplete && report && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold mb-4">Research Complete</h2>
                  <p className="text-zinc-400 leading-relaxed">
                    {report.summary}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="border border-zinc-800 rounded-lg p-6 bg-zinc-900/50">
                    <div className="text-xs uppercase tracking-wider text-teal-500 mb-2">
                      {report.claim_a.stance}
                    </div>
                    <h3 className="text-xl font-bold mb-4">
                      {report.claim_a.title}
                    </h3>
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

                  <div className="border border-zinc-800 rounded-lg p-6 bg-zinc-900/50">
                    <div className="text-xs uppercase tracking-wider text-amber-500 mb-2">
                      {report.claim_b.stance}
                    </div>
                    <h3 className="text-xl font-bold mb-4">
                      {report.claim_b.title}
                    </h3>
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
                  <div className="border border-zinc-800 rounded-lg p-6 bg-zinc-900/50">
                    <h3 className="text-lg font-bold mb-3">
                      Areas of Agreement
                    </h3>
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
                  <div className="border border-zinc-800 rounded-lg p-6 bg-zinc-900/50">
                    <h3 className="text-lg font-bold mb-3">
                      Key Disagreements
                    </h3>
                    <div className="space-y-4">
                      {report.disagreements.map((dis, idx) => (
                        <div key={idx}>
                          <h4 className="text-teal-500 font-bold text-sm mb-2">
                            {dis.topic}
                          </h4>
                          <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-zinc-500">Left: </span>
                              <span className="text-zinc-300">
                                {dis.left_position}
                              </span>
                            </div>
                            <div>
                              <span className="text-zinc-500">Right: </span>
                              <span className="text-zinc-300">
                                {dis.right_position}
                              </span>
                            </div>
                          </div>
                          <p className="text-zinc-500 text-xs mt-2">
                            {dis.reason}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-xs text-zinc-600">
                  {report.metadata.sources_searched} sources •{" "}
                  {report.metadata.total_results} results •{" "}
                  {(report.metadata.processing_time_ms / 1000).toFixed(1)}s
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-auto pt-8">
          <ChatInput
            onSubmit={(query) => startResearch(query)}
            disabled={isResearching || isClarifying}
            placeholder="What should we explore today?"
          />
        </div>
      </div>
    </div>
  );
}
