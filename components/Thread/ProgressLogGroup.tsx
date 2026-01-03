"use client";

import { useState, useCallback } from "react";
import { AgentUpdate } from "./AgentUpdate";
import type { ProgressData, Message, ToolCall } from "@/lib/types";

interface NormalizedProgress {
  agent: string;
  status: string;
  message: string;
  details?: Record<string, unknown>;
  toolCalls?: ToolCall[];
}

function normalizeProgressMessage(msg: Message): NormalizedProgress {
  const content = msg.content;

  // format 2: nested under content.data
  const data = content.data as Record<string, unknown> | undefined;
  if (data && typeof data === "object" && data.agent) {
    // handle singular tool_call -> array
    const toolCall = content.tool_call as ToolCall | undefined;
    const toolCalls = toolCall ? [toolCall] : undefined;

    return {
      agent: (data.agent as string) || "",
      status: (data.status as string) || "",
      message: (data.message as string) || "",
      details: data.details as Record<string, unknown> | undefined,
      toolCalls,
    };
  }

  // format 1: flat structure
  // handle singular tool_call -> array
  const toolCall = content.tool_call as ToolCall | undefined;
  const toolCallsArray = content.tool_calls as ToolCall[] | undefined;
  const toolCalls = toolCallsArray || (toolCall ? [toolCall] : undefined);

  return {
    agent: (content.agent as string) || "",
    status: (content.status as string) || "",
    message: (content.message as string) || "",
    details: content.details as Record<string, unknown> | undefined,
    toolCalls,
  };
}

interface ProgressLogGroupFromEventsProps {
  events: ProgressData[];
  title: string;
  defaultOpen: boolean;
}

export function ProgressLogGroupFromEvents({
  events,
  title,
  defaultOpen,
}: ProgressLogGroupFromEventsProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  if (events.length === 0) return null;

  return (
    <section
      className="border border-zinc-700 rounded-lg overflow-hidden mr-8"
      aria-label={title}
    >
      <button
        onClick={handleToggle}
        className="w-full px-4 py-3 bg-zinc-800/50 hover:bg-zinc-800 transition-colors flex items-center justify-between"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-300">{title}</span>
          <span className="text-xs text-zinc-500">
            ({events.length} events)
          </span>
        </div>
        <span className="text-zinc-500" aria-hidden="true">
          {isOpen ? "▼" : "▶"}
        </span>
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
              toolCalls={p.tool_calls}
              timestamp={p.timestamp}
            />
          ))}
        </div>
      )}
    </section>
  );
}

interface ProgressLogGroupFromMessagesProps {
  messages: Message[];
  title: string;
  defaultOpen: boolean;
}

export function ProgressLogGroupFromMessages({
  messages,
  title,
  defaultOpen,
}: ProgressLogGroupFromMessagesProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  if (messages.length === 0) return null;

  return (
    <section
      className="border border-zinc-700 rounded-lg overflow-hidden mr-8"
      aria-label={title}
    >
      <button
        onClick={handleToggle}
        className="w-full px-4 py-3 bg-zinc-800/50 hover:bg-zinc-800 transition-colors flex items-center justify-between"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-300">{title}</span>
          <span className="text-xs text-zinc-500">
            ({messages.length} events)
          </span>
        </div>
        <span className="text-zinc-500" aria-hidden="true">
          {isOpen ? "▼" : "▶"}
        </span>
      </button>
      {isOpen && (
        <div className="p-4 space-y-3 bg-zinc-900/30">
          {messages.map((msg) => {
            const normalized = normalizeProgressMessage(msg);
            return (
              <AgentUpdate
                key={msg.id}
                agent={normalized.agent}
                status={normalized.status}
                message={normalized.message}
                details={normalized.details}
                toolCalls={normalized.toolCalls}
                timestamp={msg.created_at}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}

// helper to get agent from message
export function getAgentFromMessage(msg: Message): string {
  const data = msg.content.data as Record<string, unknown> | undefined;
  if (data && typeof data === "object" && data.agent) {
    return data.agent as string;
  }
  return (msg.content.agent as string) || "";
}

// export normalizer for external use
export { normalizeProgressMessage };
