"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useResearchThread, type ThreadEvent } from "@/hooks/useResearchThread";
import { useAuth } from "@/context/AuthContext";
import { ChatInput } from "@/components/Chat";
import { AuthModal, UserBadge } from "@/components/Auth";
import {
  UserMessage,
  ClarificationMessage,
  ReportMessage,
  FollowupMessage,
  SubQueriesMessage,
  DraftMessage,
  SupervisorDecisionMessage,
  ProgressLogGroupFromEvents,
} from "@/components/Thread";
import { ChatHistory } from "@/components/Sidebar";
import type {
  ProgressData,
  ReportData,
  FollowupAnswerData,
  SubQueriesData,
  DraftData,
  SupervisorDecisionData,
} from "@/lib/types";

function scrollToBottom(behavior: ScrollBehavior = "smooth") {
  window.scrollTo({ top: document.body.scrollHeight, behavior });
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
  | { type: "sub_queries"; data: SubQueriesData }
  | { type: "draft"; data: DraftData }
  | { type: "supervisor_decision"; data: SupervisorDecisionData }
  | { type: "report"; data: ReportData; timestamp: string }
  | { type: "followup_answer"; data: FollowupAnswerData; timestamp: string };

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
        if (event.data.agent !== "classification") {
          currentProgressGroup.push(event.data);
        }
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

      case "sub_queries":
        flushProgressGroup();
        grouped.push({ type: "sub_queries", data: event.data });
        break;

      case "draft":
        grouped.push({ type: "draft", data: event.data });
        break;

      case "supervisor_decision":
        grouped.push({ type: "supervisor_decision", data: event.data });
        break;

      case "report":
        flushProgressGroup();
        grouped.push({
          type: "report",
          data: event.data,
          timestamp: new Date().toISOString(),
        });
        break;

      case "followup_answer":
        flushProgressGroup();
        grouped.push({
          type: "followup_answer",
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const hasProcessedQuery = useRef(false);

  const {
    status,
    events,
    error,
    queryId,
    startResearch,
    submitClarification,
    reset,
  } = useResearchThread({ token });

  const isResearching = status === "researching";
  const isClarifying = status === "clarifying";
  const isComplete = status === "complete";
  const isError = status === "error";
  const isActive = isClarifying || isResearching || isComplete || isError;

  // redirect to chat page when research completes
  useEffect(() => {
    if (isComplete && queryId) {
      router.push(`/chat/${queryId}`);
    }
  }, [isComplete, queryId, router]);

  // warn user before leaving during active research
  useEffect(() => {
    if (!isResearching) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      return "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isResearching]);

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

  const handleStartResearch = useCallback(
    (query: string) => {
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
    },
    [user, isQuotaExhausted, router, startResearch]
  );

  const handleClarificationSubmit = useCallback(
    (response: string) => {
      submitClarification(response);
    },
    [submitClarification]
  );

  const handleReset = useCallback(() => {
    reset();
  }, [reset]);

  const handleSidebarToggle = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const handleCloseAuthModal = useCallback(() => {
    setShowAuthModal(false);
  }, []);

  const handleOpenAuthModal = useCallback(() => {
    setShowAuthModal(true);
  }, []);

  const groupedEvents = useMemo(() => groupEvents(events), [events]);

  // auto-scroll to bottom as new events come in
  useEffect(() => {
    if (isActive && events.length > 0) {
      scrollToBottom();
    }
  }, [events.length, isActive]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 relative">
      <AuthModal
        isOpen={showAuthModal}
        onClose={handleCloseAuthModal}
        onSuccess={handleCloseAuthModal}
      />

      <ChatHistory
        isOpen={sidebarOpen && !!user}
        onToggle={handleSidebarToggle}
      />

      <div
        className={`
          relative z-10 flex flex-col min-h-screen transition-all duration-300
          ${sidebarOpen && user ? "ml-72" : "ml-0"}
        `}
      >
        <div className="flex flex-col min-h-screen max-w-4xl mx-auto px-6 py-12 w-full">
          {!isLoading && (
            <div className="absolute top-6 right-6">
              {user ? (
                <UserBadge />
              ) : (
                <button
                  onClick={handleOpenAuthModal}
                  className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded font-medium text-sm"
                >
                  Sign In
                </button>
              )}
            </div>
          )}

          {isLoading && (
            <div className="flex-1 flex items-center justify-center">
              <div className="loading loading-spinner loading-lg text-zinc-300"></div>
            </div>
          )}

          {!isLoading && status === "idle" && (
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

          {!isLoading && isActive && (
            <div className="flex-1 mb-8">
              {isComplete && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 flex flex-col items-center gap-4">
                    <div className="loading loading-spinner loading-lg text-zinc-300"></div>
                    <p className="text-zinc-300 text-lg font-medium">
                      Redirecting to report...
                    </p>
                  </div>
                </div>
              )}

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
                        <ProgressLogGroupFromEvents
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

                    case "sub_queries":
                      return <SubQueriesMessage key={idx} data={event.data} />;

                    case "draft":
                      return <DraftMessage key={idx} data={event.data} />;

                    case "supervisor_decision":
                      return (
                        <SupervisorDecisionMessage
                          key={idx}
                          data={event.data}
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

                    case "followup_answer":
                      return (
                        <FollowupMessage
                          key={idx}
                          answer={event.data.answer}
                          citations={event.data.citations}
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

          {!isLoading && (
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
          )}
        </div>
      </div>
    </div>
  );
}
