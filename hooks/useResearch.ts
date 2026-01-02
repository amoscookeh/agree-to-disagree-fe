import { useState, useCallback } from "react";
import { researchStream, ResearchStream } from "@/lib/researchStream";
import type { ResearchState, SSEEvent } from "@/lib/types";

export function useResearch(stream: ResearchStream = researchStream) {
  const [state, setState] = useState<ResearchState>({
    status: "idle",
    threadId: null,
    clarification: null,
    progress: [],
    report: null,
    error: null,
  });

  const startResearch = useCallback(
    async (query: string) => {
      setState({
        status: "researching",
        threadId: null,
        clarification: null,
        progress: [],
        report: null,
        error: null,
      });

      for await (const event of stream.stream(query)) {
        handleEvent(event);
      }
    },
    [stream]
  );

  const handleEvent = (event: SSEEvent) => {
    switch (event.type) {
      case "clarification":
        setState((prev) => ({
          ...prev,
          status: "clarifying",
          threadId: event.data.thread_id,
          clarification: event.data,
        }));
        break;

      case "progress":
        setState((prev) => ({
          ...prev,
          status: "researching",
          progress: [...prev.progress, event.data],
        }));
        break;

      case "report":
        setState((prev) => ({
          ...prev,
          status: "complete",
          threadId: event.data.thread_id,
          report: event.data,
        }));
        break;

      case "error":
        setState((prev) => ({
          ...prev,
          status: "error",
          error: event.data,
        }));
        break;

      case "done":
        setState((prev) => ({
          ...prev,
          threadId: event.data.thread_id,
        }));
        break;
    }
  };

  const reset = useCallback(() => {
    setState({
      status: "idle",
      threadId: null,
      clarification: null,
      progress: [],
      report: null,
      error: null,
    });
  }, []);

  return {
    ...state,
    startResearch,
    reset,
  };
}
