"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useResearchThread, type ThreadEvent } from "@/hooks/useResearchThread";
import { useAuth } from "@/context/AuthContext";
import { ChatInput } from "@/components/Chat/ChatInput";
import { AuthModal } from "@/components/Auth/AuthModal";
import { UserBadge } from "@/components/Auth/UserBadge";
import { UserMessage } from "@/components/Thread/UserMessage";
import { AgentUpdate } from "@/components/Thread/AgentUpdate";
import { ClarificationMessage } from "@/components/Thread/ClarificationMessage";
import { ReportMessage } from "@/components/Thread/ReportMessage";
import type { ProgressData, ReportData } from "@/lib/types";

function ProgressLogGroup({
  events,
  title,
  defaultOpen,
}: {
  events: ProgressData[];
  title: string;
  defaultOpen: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (events.length === 0) return null;

  return (
    <div className="border border-zinc-700 rounded-lg overflow-hidden mr-8">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-zinc-800/50 hover:bg-zinc-800 transition-colors flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-300">{title}</span>
          <span className="text-xs text-zinc-500">
            ({events.length} events)
          </span>
        </div>
        <span className="text-zinc-500">{isOpen ? "▼" : "▶"}</span>
      </button>
      {isOpen && (
        <div className="p-4 space-y-3 bg-zinc-900/30">
          {events.map((p, idx) => (
            <AgentUpdate
              key={idx}
              agent={p.agent}
              status={p.status}
              message={p.message}
              details={p.details}
              timestamp={p.timestamp}
            />
          ))}
        </div>
      )}
    </div>
  );
}

type GroupedEvent =
  | { type: "user_query"; query: string; timestamp: string }
  | {
      type: "progress_group";
      events: ProgressData[];
      afterClarification: boolean;
    }
  | {
      type: "clarification";
      data: {
        refined_query: string;
        questions: string[];
        suggestions: string[];
      };
      timestamp: string;
    }
  | { type: "user_response"; response: string; timestamp: string }
  | { type: "report"; data: ReportData; timestamp: string };

function groupEvents(events: ThreadEvent[]): GroupedEvent[] {
  const grouped: GroupedEvent[] = [];
  let currentProgressGroup: ProgressData[] = [];
  let hadClarification = false;

  const flushProgressGroup = () => {
    if (currentProgressGroup.length > 0) {
      grouped.push({
        type: "progress_group",
        events: currentProgressGroup,
        afterClarification: hadClarification,
      });
      currentProgressGroup = [];
    }
  };

  events.forEach((event) => {
    switch (event.type) {
      case "user_query":
        flushProgressGroup();
        grouped.push({
          type: "user_query",
          query: event.query,
          timestamp: event.timestamp,
        });
        break;

      case "progress":
        currentProgressGroup.push(event.data);
        break;

      case "clarification":
        flushProgressGroup();
        grouped.push({
          type: "clarification",
          data: event.data,
          timestamp: new Date().toISOString(),
        });
        hadClarification = true;
        break;

      case "user_response":
        grouped.push({
          type: "user_response",
          response: event.response,
          timestamp: event.timestamp,
        });
        break;

      case "report":
        flushProgressGroup();
        grouped.push({
          type: "report",
          data: event.data,
          timestamp: new Date().toISOString(),
        });
        break;
    }
  });

  flushProgressGroup();
  return grouped;
}

export default function Home() {
  const router = useRouter();
  const { user, token, isLoading, isQuotaExhausted } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingQuery, setPendingQuery] = useState("");
  const hasProcessedQuery = useRef(false);

  const { status, events, error, startResearch, submitClarification, reset } =
    useResearchThread({ token });

  const isResearching = status === "researching";
  const isClarifying = status === "clarifying";
  const isComplete = status === "complete";
  const isError = status === "error";
  const isActive = isClarifying || isResearching || isComplete || isError;

  // redirect to waitlist if quota exhausted
  useEffect(() => {
    if (isError && error?.code === "RATE_LIMITED") {
      router.push("/waitlist");
    }
  }, [isError, error, router]);

  // process pending query after auth
  useEffect(() => {
    if (user && token && pendingQuery && !hasProcessedQuery.current) {
      hasProcessedQuery.current = true;
      const query = pendingQuery;

      setTimeout(() => setPendingQuery(""), 0);

      if (isQuotaExhausted) {
        router.push("/waitlist");
      } else {
        startResearch(query);
      }
    }
  }, [user, token, pendingQuery, isQuotaExhausted, router, startResearch]);

  const handleStartResearch = (query: string) => {
    if (!user) {
      hasProcessedQuery.current = false;
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

  const handleClarificationSubmit = (response: string) => {
    submitClarification(response);
  };

  const handleReset = () => {
    reset();
  };

  const groupedEvents = useMemo(() => groupEvents(events), [events]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 relative">
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setShowAuthModal(false)}
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

        {isActive && (
          <div className="flex-1 mb-8">
            <div className="mb-8">
              <button
                onClick={handleReset}
                className="text-teal-500 hover:text-teal-400 text-sm transition-colors"
              >
                ← New research
              </button>
            </div>

            <div className="space-y-4">
              {groupedEvents.map((event, idx) => {
                switch (event.type) {
                  case "user_query":
                    return (
                      <UserMessage
                        key={idx}
                        query={event.query}
                        timestamp={event.timestamp}
                      />
                    );

                  case "progress_group":
                    return (
                      <ProgressLogGroup
                        key={idx}
                        events={event.events}
                        title={
                          event.afterClarification
                            ? "Continued Research Progress"
                            : "Research Progress Log"
                        }
                        defaultOpen={true}
                      />
                    );

                  case "clarification":
                    return (
                      <ClarificationMessage
                        key={idx}
                        question={event.data.refined_query}
                        questions={event.data.questions}
                        suggestions={event.data.suggestions}
                        timestamp={event.timestamp}
                      />
                    );

                  case "user_response":
                    return (
                      <UserMessage
                        key={idx}
                        query={event.response}
                        timestamp={event.timestamp}
                        isResponse
                      />
                    );

                  case "report":
                    return (
                      <ReportMessage
                        key={idx}
                        report={event.data}
                        timestamp={event.timestamp}
                      />
                    );

                  default:
                    return null;
                }
              })}
            </div>

            {isError && error && (
              <div className="border border-red-800 rounded-lg p-6 bg-red-950/30 mt-4 mr-8">
                <h3 className="text-lg font-semibold mb-3 text-red-400">
                  {error.code === "RATE_LIMITED"
                    ? "Research Quota Exhausted"
                    : "Research Error"}
                </h3>
                <p className="text-zinc-400 text-sm mb-4">{error.message}</p>
                {error.code === "RATE_LIMITED" && (
                  <p className="text-zinc-500 text-xs">
                    Redirecting to waitlist...
                  </p>
                )}
                {error.recoverable && error.code !== "RATE_LIMITED" && (
                  <button
                    onClick={handleReset}
                    className="text-teal-500 hover:text-teal-400 text-sm"
                  >
                    Try again
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        <div className="mt-auto pt-8">
          <ChatInput
            onSubmit={
              isClarifying ? handleClarificationSubmit : handleStartResearch
            }
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
