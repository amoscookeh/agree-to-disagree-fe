"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useResearch } from "@/hooks/useResearch";
import { useAuth } from "@/context/AuthContext";
import { ChatInput } from "@/components/Chat/ChatInput";
import { AuthModal } from "@/components/Auth/AuthModal";
import { UserBadge } from "@/components/Auth/UserBadge";

export default function Home() {
  const router = useRouter();
  const { user, token, isLoading, isQuotaExhausted } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingQuery, setPendingQuery] = useState("");

  const {
    status,
    clarification,
    progress,
    report,
    startResearch,
    submitClarification,
    reset,
  } = useResearch({ token });

  const isResearching = status === "researching";
  const isClarifying = status === "clarifying";
  const isComplete = status === "complete";

  const handleStartResearch = (query: string) => {
    if (!user) {
      setPendingQuery(query);
      setShowAuthModal(true);
      return;
    }

    if (isQuotaExhausted) {
      router.push("/waitlist");
      return;
    }

    startResearch(query);
  };

  const handleAuthSuccess = () => {
    if (pendingQuery) {
      if (isQuotaExhausted) {
        router.push("/waitlist");
      } else {
        startResearch(pendingQuery);
      }
      setPendingQuery("");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 relative">
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />

      <div className="relative z-10 flex flex-col min-h-screen max-w-4xl mx-auto px-6 py-12">
        {!isLoading && (
          <div className="absolute top-6 right-6">
            {user ? (
              <UserBadge />
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded font-medium text-sm"
              >
                Sign In
              </button>
            )}
          </div>
        )}
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

        {(isClarifying || isResearching || isComplete) && (
          <div className="flex-1 mb-8">
            <div className="mb-8">
              <button
                onClick={reset}
                className="text-teal-500 hover:text-teal-400 text-sm transition-colors"
              >
                ← New research
              </button>
            </div>

            <div className="space-y-4">
              {progress.map((p, idx) => (
                <div
                  key={idx}
                  className="border border-zinc-700/50 rounded-lg p-4 bg-zinc-800/30"
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
                          className="text-xs bg-zinc-700/50 px-2 py-1 rounded text-zinc-400"
                        >
                          {source}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isClarifying && clarification && (
                <div className="border border-teal-800 rounded-lg p-6 bg-teal-950/30">
                  <h3 className="text-lg font-semibold mb-3 text-teal-400">
                    I need more details to research this accurately
                  </h3>
                  <p className="text-zinc-400 text-sm mb-4">
                    {clarification.refined_query}
                  </p>
                  {clarification.questions.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-zinc-300">
                        Please clarify:
                      </p>
                      <ul className="space-y-2">
                        {clarification.questions.map((question, idx) => (
                          <li
                            key={idx}
                            className="text-zinc-400 text-sm flex gap-3"
                          >
                            <span className="text-teal-500">•</span>
                            <span>{question}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {isComplete && report && (
              <div className="border border-zinc-800 rounded-lg p-6 bg-zinc-900/50 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-3 text-teal-500">
                    Research Complete
                  </h2>
                  <p className="text-zinc-300 leading-relaxed text-sm">
                    {report.summary}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border border-zinc-700 rounded-lg p-4 bg-zinc-800/50">
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

                  <div className="border border-zinc-700 rounded-lg p-4 bg-zinc-800/50">
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
                  <div className="border border-zinc-700 rounded-lg p-4 bg-zinc-800/50">
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
                  <div className="border border-zinc-700 rounded-lg p-4 bg-zinc-800/50">
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

                <div className="text-xs text-zinc-500 pt-2 border-t border-zinc-700">
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
            onSubmit={isClarifying ? submitClarification : handleStartResearch}
            disabled={isResearching}
            placeholder={
              isClarifying
                ? "Provide more details about what you're looking for..."
                : "What should we explore today?"
            }
          />
        </div>
      </div>
    </div>
  );
}
