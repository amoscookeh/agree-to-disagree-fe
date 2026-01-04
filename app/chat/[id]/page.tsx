"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchChat } from "@/lib/api";
import { config } from "@/lib/config";
import { formatDateTime } from "@/lib/dateUtils";
import type {
  ChatThread,
  Message,
  FollowupAnswerData,
  SubQueriesData,
  DraftData,
  SupervisorDecisionData,
} from "@/lib/types";
import {
  UserMessage,
  ClarificationMessage,
  ReportMessage,
  FollowupMessage,
  SubQueriesMessage,
  DraftMessage,
  SupervisorDecisionMessage,
  ProgressLogGroupFromMessages,
  getAgentFromMessage,
  normalizeProgressMessage,
} from "@/components/Thread";
import { ChatInput } from "@/components/Chat";

type GroupedEvent =
  | { type: "user_query"; query: string; timestamp: string }
  | {
      type: "progress_group";
      messages: Message[];
      afterClarification: boolean;
      title?: string;
    }
  | { type: "clarification"; refinedQuery: string; timestamp: string }
  | { type: "user_response"; response: string; timestamp: string }
  | { type: "sub_queries"; data: SubQueriesData; timestamp: string }
  | { type: "draft"; data: DraftData; timestamp: string }
  | {
      type: "supervisor_decision";
      data: SupervisorDecisionData;
      timestamp: string;
    }
  | { type: "report" }
  | { type: "followup"; data: FollowupAnswerData; timestamp: string };

type TimelineItem =
  | { type: "progress"; message: Message; timestamp: number }
  | { type: "sub_queries"; message: Message; timestamp: number }
  | { type: "draft"; message: Message; timestamp: number }
  | { type: "supervisor_decision"; message: Message; timestamp: number }
  | { type: "clarification_complete"; message: Message; timestamp: number }
  | { type: "clarification_response"; message: Message; timestamp: number };

function buildGroupedEvents(chat: ChatThread): GroupedEvent[] {
  const grouped: GroupedEvent[] = [];
  const messages = chat.messages || [];

  // add initial query
  grouped.push({
    type: "user_query",
    query: chat.query.query_text,
    timestamp: chat.query.created_at,
  });

  const hiddenAgents = ["classification", "followup"];

  // build timeline of all events (excluding followups which are handled separately)
  const timeline: TimelineItem[] = [];

  messages.forEach((m) => {
    const timestamp = new Date(m.created_at).getTime();

    if (m.role === "agent") {
      const agent = getAgentFromMessage(m);
      if (hiddenAgents.includes(agent)) return;

      const normalized = normalizeProgressMessage(m);
      // check if this is clarification complete with refined_query
      if (
        normalized.agent === "clarification" &&
        normalized.status === "complete" &&
        normalized.details?.refined_query
      ) {
        timeline.push({
          type: "clarification_complete",
          message: m,
          timestamp,
        });
      } else {
        timeline.push({ type: "progress", message: m, timestamp });
      }
    } else if (
      m.role === "user" &&
      m.content.type === "clarification_response"
    ) {
      timeline.push({ type: "clarification_response", message: m, timestamp });
    } else if (m.role === "sub_queries") {
      timeline.push({ type: "sub_queries", message: m, timestamp });
    } else if (m.role === "draft") {
      timeline.push({ type: "draft", message: m, timestamp });
    } else if (m.role === "supervisor_decision") {
      timeline.push({ type: "supervisor_decision", message: m, timestamp });
    }
  });

  // sort by timestamp
  timeline.sort((a, b) => a.timestamp - b.timestamp);

  // process timeline, grouping consecutive progress events
  let currentProgressGroup: Message[] = [];
  let afterClarification = false;

  const flushProgressGroup = () => {
    if (currentProgressGroup.length > 0) {
      grouped.push({
        type: "progress_group",
        messages: currentProgressGroup,
        afterClarification,
      });
      currentProgressGroup = [];
    }
  };

  timeline.forEach((item) => {
    switch (item.type) {
      case "progress":
        currentProgressGroup.push(item.message);
        break;

      case "clarification_complete": {
        // include clarification complete in progress group, then flush
        currentProgressGroup.push(item.message);
        flushProgressGroup();

        const normalized = normalizeProgressMessage(item.message);
        grouped.push({
          type: "clarification",
          refinedQuery:
            (normalized.details?.refined_query as string) ||
            "Clarification was requested",
          timestamp: item.message.created_at,
        });
        break;
      }

      case "clarification_response":
        flushProgressGroup();
        grouped.push({
          type: "user_response",
          response: (item.message.content.response as string) || "",
          timestamp: item.message.created_at,
        });
        afterClarification = true;
        break;

      case "sub_queries":
        flushProgressGroup();
        grouped.push({
          type: "sub_queries",
          data: item.message.content as unknown as SubQueriesData,
          timestamp: item.message.created_at,
        });
        break;

      case "draft":
        flushProgressGroup();
        grouped.push({
          type: "draft",
          data: item.message.content as unknown as DraftData,
          timestamp: item.message.created_at,
        });
        break;

      case "supervisor_decision":
        flushProgressGroup();
        grouped.push({
          type: "supervisor_decision",
          data: item.message.content as unknown as SupervisorDecisionData,
          timestamp: item.message.created_at,
        });
        break;
    }
  });

  // flush any remaining progress events
  flushProgressGroup();

  // report at the end
  if (chat.report) {
    grouped.push({ type: "report" });
  }

  // handle followups separately (they come after the main research)
  const followupUserMessages = messages.filter(
    (m) =>
      m.role === "user" &&
      m.content.type === "query" &&
      (m.content.query as string) !== chat.query.query_text
  );

  const followupAnswerMessages = messages.filter((m) => m.role === "followup");
  const followupAgentMessages = messages.filter(
    (m) => m.role === "agent" && getAgentFromMessage(m) === "followup"
  );

  const followupEvents = [
    ...followupUserMessages.map((m) => ({
      sortKey: new Date(m.created_at).getTime(),
      event: {
        type: "user_query" as const,
        query: (m.content.query as string) || "",
        timestamp: m.created_at,
      },
    })),
    ...followupAnswerMessages.map((m) => ({
      sortKey: new Date(m.created_at).getTime(),
      event: {
        type: "followup" as const,
        data: m.content as unknown as FollowupAnswerData,
        timestamp: m.created_at,
      },
    })),
  ].sort((a, b) => a.sortKey - b.sortKey);

  followupEvents.forEach(({ event }, idx) => {
    if (event.type === "user_query") {
      grouped.push(event);
      const queryTime = new Date(event.timestamp).getTime();
      const nextEvent = followupEvents[idx + 1];
      const nextTime = nextEvent
        ? new Date(nextEvent.event.timestamp).getTime()
        : Infinity;

      const relatedAgentMessages = followupAgentMessages.filter((m) => {
        const msgTime = new Date(m.created_at).getTime();
        return msgTime >= queryTime && msgTime <= nextTime;
      });

      if (relatedAgentMessages.length > 0) {
        grouped.push({
          type: "progress_group",
          messages: relatedAgentMessages,
          afterClarification: false,
          title: "Follow-up Progress",
        });
      }
    } else {
      grouped.push(event);
    }
  });

  return grouped;
}

interface PendingFollowup {
  question: string;
  timestamp: string;
  progressEvents: Message[];
}

export default function ChatPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { user, token, isLoading } = useAuth();
  const [chat, setChat] = useState<ChatThread | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmittingFollowup, setIsSubmittingFollowup] = useState(false);
  const [followupError, setFollowupError] = useState<string | null>(null);
  const [pendingFollowup, setPendingFollowup] =
    useState<PendingFollowup | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const hasScrolledToReport = useRef(false);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const loadChat = useCallback(async () => {
    if (!token || !id) return;
    try {
      const data = await fetchChat(token, id);
      setChat(data);
      hasScrolledToReport.current = false;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load chat");
    } finally {
      setLoading(false);
    }
  }, [token, id]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
      return;
    }

    loadChat();
  }, [token, id, isLoading, user, router, loadChat]);

  const handleFollowup = useCallback(
    async (question: string) => {
      if (!token || !chat?.query.thread_id) return;

      // cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setIsSubmittingFollowup(true);
      setFollowupError(null);

      // optimistically show user message immediately
      const timestamp = new Date().toISOString();
      setPendingFollowup({
        question,
        timestamp,
        progressEvents: [],
      });

      try {
        const res = await fetch(`${config.apiUrl}/api/research`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "text/event-stream",
          },
          body: JSON.stringify({
            query: question,
            thread_id: chat.query.thread_id,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!res.ok) {
          throw new Error("Failed to submit follow-up");
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const jsonStr = line.slice(6);
              if (jsonStr.trim()) {
                try {
                  const event = JSON.parse(jsonStr);

                  if (event.type === "progress") {
                    // add progress event to pending state
                    const progressMsg: Message = {
                      id: `pending-${Date.now()}-${Math.random()}`,
                      query_id: chat.query.id,
                      role: "agent",
                      content: event.data || event,
                      created_at: new Date().toISOString(),
                    };
                    setPendingFollowup((prev) =>
                      prev
                        ? {
                            ...prev,
                            progressEvents: [
                              ...prev.progressEvents,
                              progressMsg,
                            ],
                          }
                        : null
                    );
                  } else if (event.type === "done") {
                    setPendingFollowup(null);
                    await loadChat();
                  }
                } catch {
                  // ignore parse errors
                }
              }
            }
          }
        }
      } catch (err) {
        // don't show error if request was aborted
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        setFollowupError(
          err instanceof Error ? err.message : "Failed to submit"
        );
        setPendingFollowup(null);
      } finally {
        setIsSubmittingFollowup(false);
        abortControllerRef.current = null;
      }
    },
    [token, chat, loadChat]
  );

  const groupedEvents = useMemo(() => {
    const events = chat ? buildGroupedEvents(chat) : [];

    // append pending followup if exists
    if (pendingFollowup) {
      events.push({
        type: "user_query",
        query: pendingFollowup.question,
        timestamp: pendingFollowup.timestamp,
      });

      if (pendingFollowup.progressEvents.length > 0) {
        events.push({
          type: "progress_group",
          messages: pendingFollowup.progressEvents,
          afterClarification: false,
          title: "Follow-up Progress",
        });
      }
    }

    return events;
  }, [chat, pendingFollowup]);

  // scroll to report when chat loads
  useEffect(() => {
    if (chat?.report && reportRef.current && !hasScrolledToReport.current) {
      hasScrolledToReport.current = true;
      setTimeout(() => {
        reportRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [chat?.report]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <p className="text-zinc-500 text-sm">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="text-teal-500 hover:text-teal-400"
          >
            ← Back to home
          </button>
        </div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-zinc-500">Chat not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-zinc-100">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <button
            onClick={() => router.push("/")}
            className="text-teal-500 hover:text-teal-400 text-sm mb-4"
          >
            ← New research
          </button>
          <h1 className="text-2xl font-bold">{chat.query.title}</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {formatDateTime(chat.query.created_at)}
          </p>
        </div>

        <div className="space-y-4 mb-8">
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
                  <ProgressLogGroupFromMessages
                    key={idx}
                    messages={event.messages}
                    title={
                      event.title ||
                      (event.afterClarification
                        ? "Continued Research Progress"
                        : "Research Progress Log")
                    }
                    defaultOpen={false}
                  />
                );

              case "clarification":
                return (
                  <ClarificationMessage
                    key={idx}
                    question={event.refinedQuery}
                    questions={[]}
                    suggestions={[]}
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
                  <SupervisorDecisionMessage key={idx} data={event.data} />
                );

              case "report":
                return (
                  <div key={idx} ref={reportRef}>
                    <ReportMessage
                      report={chat.report!}
                      timestamp={chat.query.created_at}
                    />
                  </div>
                );

              case "followup":
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

        {chat.query.is_completed && (
          <div className="sticky bottom-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent pt-8 pb-6">
            <div className="max-w-3xl mx-auto">
              {followupError && (
                <div className="text-red-400 text-sm mb-2 text-center">
                  {followupError}
                </div>
              )}
              <ChatInput
                onSubmit={handleFollowup}
                disabled={isSubmittingFollowup}
                placeholder="Ask a follow-up question..."
              />
              <p className="text-xs text-zinc-600 mt-2 text-center">
                Ask questions about this research or request additional details
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
