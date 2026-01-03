"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchChat } from "@/lib/api";
import type { ChatThread, Message } from "@/lib/types";
import { UserMessage } from "@/components/Thread/UserMessage";
import { AgentUpdate } from "@/components/Thread/AgentUpdate";
import { ClarificationMessage } from "@/components/Thread/ClarificationMessage";
import { ReportMessage } from "@/components/Thread/ReportMessage";

function ProgressLogGroup({
  messages,
  title,
  defaultOpen,
}: {
  messages: Message[];
  title: string;
  defaultOpen: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (messages.length === 0) return null;

  return (
    <div className="border border-zinc-700 rounded-lg overflow-hidden mr-8">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-zinc-800/50 hover:bg-zinc-800 transition-colors flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-300">{title}</span>
          <span className="text-xs text-zinc-500">
            ({messages.length} events)
          </span>
        </div>
        <span className="text-zinc-500">{isOpen ? "▼" : "▶"}</span>
      </button>
      {isOpen && (
        <div className="p-4 space-y-3 bg-zinc-900/30">
          {messages.map((msg) => (
            <AgentUpdate
              key={msg.id}
              agent={(msg.content.agent as string) || ""}
              status={(msg.content.status as string) || ""}
              message={(msg.content.message as string) || ""}
              details={msg.content.details as Record<string, unknown>}
              timestamp={msg.created_at}
            />
          ))}
        </div>
      )}
    </div>
  );
}

type GroupedEvent =
  | { type: "user_query"; query: string; timestamp: string }
  | { type: "progress_group"; messages: Message[]; afterClarification: boolean }
  | { type: "clarification"; refinedQuery: string; timestamp: string }
  | { type: "user_response"; response: string; timestamp: string }
  | { type: "report" };

function buildGroupedEvents(chat: ChatThread): GroupedEvent[] {
  const grouped: GroupedEvent[] = [];
  const messages = chat.messages || [];

  // add initial query
  grouped.push({
    type: "user_query",
    query: chat.query.query_text,
    timestamp: chat.query.created_at,
  });

  // find clarification response (user message with type: clarification_response)
  const clarificationResponseMsg = messages.find(
    (m) => m.role === "user" && m.content.type === "clarification_response"
  );

  // find clarification complete agent message (has refined_query in details)
  const clarificationCompleteMsg = messages.find(
    (m) =>
      m.role === "agent" &&
      m.content.agent === "clarification" &&
      m.content.status === "complete" &&
      (m.content.details as Record<string, unknown>)?.refined_query
  );

  const hadClarification = !!clarificationResponseMsg;
  const agentMessages = messages.filter((m) => m.role === "agent");

  if (hadClarification && clarificationCompleteMsg) {
    const clarificationCompleteIdx = agentMessages.indexOf(
      clarificationCompleteMsg
    );
    const agentMessagesBefore = agentMessages.slice(
      0,
      clarificationCompleteIdx + 1
    );
    const agentMessagesAfter = agentMessages.slice(
      clarificationCompleteIdx + 1
    );

    // progress before clarification
    if (agentMessagesBefore.length > 0) {
      grouped.push({
        type: "progress_group",
        messages: agentMessagesBefore,
        afterClarification: false,
      });
    }

    // clarification message
    const details = clarificationCompleteMsg.content.details as Record<
      string,
      unknown
    >;
    grouped.push({
      type: "clarification",
      refinedQuery:
        (details?.refined_query as string) || "Clarification was requested",
      timestamp: clarificationCompleteMsg.created_at,
    });

    // user's response
    grouped.push({
      type: "user_response",
      response: (clarificationResponseMsg.content.response as string) || "",
      timestamp: clarificationResponseMsg.created_at,
    });

    // progress after clarification
    if (agentMessagesAfter.length > 0) {
      grouped.push({
        type: "progress_group",
        messages: agentMessagesAfter,
        afterClarification: true,
      });
    }
  } else {
    // no clarification - just show all agent messages
    if (agentMessages.length > 0) {
      grouped.push({
        type: "progress_group",
        messages: agentMessages,
        afterClarification: false,
      });
    }
  }

  // report at the end
  if (chat.report) {
    grouped.push({ type: "report" });
  }

  return grouped;
}

export default function ChatPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { user, token, isLoading } = useAuth();
  const [chat, setChat] = useState<ChatThread | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
      return;
    }

    if (!token || !id) return;

    const load = async () => {
      try {
        const data = await fetchChat(token, id);
        setChat(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load chat");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token, id, isLoading, user, router]);

  const groupedEvents = useMemo(
    () => (chat ? buildGroupedEvents(chat) : []),
    [chat]
  );

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-teal-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-zinc-500">Chat not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100">
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
            {new Date(chat.query.created_at).toLocaleString()}
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
                  <ProgressLogGroup
                    key={idx}
                    messages={event.messages}
                    title={
                      event.afterClarification
                        ? "Continued Research Progress"
                        : "Research Progress Log"
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

              case "report":
                return (
                  <ReportMessage
                    key={idx}
                    report={chat.report!}
                    timestamp={chat.query.created_at}
                  />
                );

              default:
                return null;
            }
          })}
        </div>

        {chat.query.is_completed && (
          <div className="text-center text-zinc-500 text-sm py-8 border-t border-zinc-800">
            Follow-up questions coming in Phase 6
          </div>
        )}
      </div>
    </div>
  );
}
